import { supabase } from './supabaseClient';
import { Draw, Winner } from '@/types';

/**
 * Prize pool distribution constants
 */
export const PRIZE_POOL_DISTRIBUTION = {
  '5-number': 0.40, // 40%
  '4-number': 0.35, // 35%
  '3-number': 0.25, // 25%
};

/**
 * Generate random lottery numbers (1-45)
 */
export function generateRandomNumbers(
  count: number = 5,
  max: number = 45
): number[] {
  const numbers = new Set<number>();
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * max) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Generate draw numbers using algorithmic approach
 * Weighted by most/least frequent user scores
 */
export async function generateAlgorithmicNumbers(): Promise<number[]> {
  try {
    // Get all golf scores
    const { data: scores, error } = await supabase
      .from('golf_scores')
      .select('score');

    if (error || !scores) {
      return generateRandomNumbers(); // Fall back to random
    }

    // Count frequency of each score
    const frequency: { [key: number]: number } = {};
    scores.forEach(({ score }) => {
      frequency[score] = (frequency[score] || 0) + 1;
    });

    // Get top 5 most frequent scores
    const sorted = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([score]) => parseInt(score));

    // If we don't have 5 unique scores, fill with random ones
    if (sorted.length < 5) {
      const remaining = 5 - sorted.length;
      const otherNumbers = generateRandomNumbers(remaining).filter(
        n => !sorted.includes(n)
      );
      sorted.push(...otherNumbers);
    }

    return sorted.sort((a, b) => a - b);
  } catch (error) {
    console.error('Error generating algorithmic numbers:', error);
    return generateRandomNumbers(); // Fall back to random
  }
}

/**
 * Create a new monthly draw
 */
export async function createDraw(
  monthYear: string,
  drawType: 'random' | 'algorithmic' = 'random'
): Promise<{ success: boolean; error?: string; draw?: Draw }> {
  try {
    // Check if draw already exists for this month
    const { data: existing } = await supabase
      .from('draws')
      .select('id')
      .eq('month_year', monthYear)
      .single();

    if (existing) {
      return { success: false, error: 'Draw already exists for this month' };
    }

    // Generate winning numbers
    const winningNumbers =
      drawType === 'random'
        ? generateRandomNumbers()
        : await generateAlgorithmicNumbers();

    // Calculate total pool based on active subscribers
    const { count: subscriberCount } = await supabase
      .from('subscriptions')
      .select('id', { count: 'exact' })
      .eq('status', 'active');

    // Estimate average subscription fee (mock value - adjust as needed)
    const avgSubscriptionFee = 15; // dollars
    const totalPool = (subscriberCount || 0) * avgSubscriptionFee * 0.5; // 50% to prizes

    const pool40 = totalPool * PRIZE_POOL_DISTRIBUTION['5-number'];
    const pool35 = totalPool * PRIZE_POOL_DISTRIBUTION['4-number'];
    const pool25 = totalPool * PRIZE_POOL_DISTRIBUTION['3-number'];

    // Create draw
    const { data, error } = await supabase
      .from('draws')
      .insert({
        month_year: monthYear,
        draw_type: drawType,
        status: 'pending',
        winning_numbers: winningNumbers,
        total_prize_pool: totalPool,
        pool_40_amount: pool40,
        pool_35_amount: pool35,
        pool_25_amount: pool25,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, draw: data as Draw };
  } catch (error) {
    console.error('Error creating draw:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create draw',
    };
  }
}

/**
 * Get current or latest draw
 */
export async function getLatestDraw(): Promise<Draw | null> {
  try {
    const { data, error } = await supabase
      .from('draws')
      .select('*')
      .order('month_year', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return data as Draw;
  } catch (error) {
    console.error('Error getting latest draw:', error);
    return null;
  }
}

/**
 * Get draw by month
 */
export async function getDrawByMonth(monthYear: string): Promise<Draw | null> {
  try {
    const { data, error } = await supabase
      .from('draws')
      .select('*')
      .eq('month_year', monthYear)
      .single();

    if (error || !data) {
      return null;
    }

    return data as Draw;
  } catch (error) {
    console.error('Error getting draw:', error);
    return null;
  }
}

/**
 * Check how many numbers a user matched
 */
export function getMatchCount(
  userNumbers: number[],
  winningNumbers: number[]
): number {
  const matches = userNumbers.filter(n => winningNumbers.includes(n));
  return matches.length;
}

/**
 * Run draw simulation (doesn't publish results)
 */
export type SimulatedDrawWinner = { user_id: string; match_type: number };

export type SimulatedDrawResults = {
  '5-match': SimulatedDrawWinner[];
  '4-match': SimulatedDrawWinner[];
  '3-match': SimulatedDrawWinner[];
};

export async function simulateDraw(
  drawId: string
): Promise<{ success: boolean; error?: string; results?: SimulatedDrawResults }> {
  try {
    // Get draw details
    const { data: draw, error: drawError } = await supabase
      .from('draws')
      .select('*')
      .eq('id', drawId)
      .single();

    if (drawError || !draw) {
      return { success: false, error: 'Draw not found' };
    }

    // Get all participants
    const { data: participants, error: partError } = await supabase
      .from('draw_participants')
      .select('*')
      .eq('draw_id', drawId);

    if (partError) {
      return { success: false, error: partError.message };
    }

    const winningNumbers = draw.winning_numbers as number[];
    const winners: SimulatedDrawResults = {
      '5-match': [],
      '4-match': [],
      '3-match': [],
    };

    participants?.forEach(participant => {
      const matchCount = getMatchCount(
        participant.selected_numbers as number[],
        winningNumbers
      );

      if (matchCount >= 3) {
        const key = `${matchCount}-match` as keyof SimulatedDrawResults;
        winners[key].push({
          user_id: participant.user_id,
          match_type: matchCount,
        });
      }
    });

    return { success: true, results: winners };
  } catch (error) {
    console.error('Error simulating draw:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Simulation failed',
    };
  }
}

/**
 * Publish draw results and create winner records
 */
export async function publishDrawResults(
  drawId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get draw
    const { data: draw, error: drawError } = await supabase
      .from('draws')
      .select('*')
      .eq('id', drawId)
      .single();

    if (drawError || !draw) {
      return { success: false, error: 'Draw not found' };
    }

    // Update draw status
    const { error: updateError } = await supabase
      .from('draws')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', drawId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Get all participants
    const { data: participants } = await supabase
      .from('draw_participants')
      .select('*')
      .eq('draw_id', drawId);

    if (!participants) {
      return { success: true }; // No participants
    }

    // Calculate winners and insert winner records
    const winningNumbers = draw.winning_numbers as number[];

    type WinnerInsert = {
      user_id: string;
      draw_id: string;
      match_type: number;
      prize_amount: number;
      verification_status: 'pending';
      payment_status: 'pending';
    };
    const winnersToInsert: WinnerInsert[] = [];

    participants.forEach(participant => {
      const matchCount = getMatchCount(
        participant.selected_numbers as number[],
        winningNumbers
      );

      if (matchCount >= 3) {
        let prizeAmount = 0;

        if (matchCount === 5) {
          prizeAmount = draw.pool_40_amount;
        } else if (matchCount === 4) {
          prizeAmount = draw.pool_35_amount;
        } else if (matchCount === 3) {
          prizeAmount = draw.pool_25_amount;
        }

        winnersToInsert.push({
          user_id: participant.user_id,
          draw_id: drawId,
          match_type: matchCount,
          prize_amount: prizeAmount,
          verification_status: 'pending',
          payment_status: 'pending',
        });
      }
    });

    if (winnersToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('winners')
        .insert(winnersToInsert);

      if (insertError) {
        return { success: false, error: insertError.message };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error publishing draw:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to publish draw',
    };
  }
}

/**
 * Get winners for a specific draw
 */
export async function getDrawWinners(drawId: string): Promise<Winner[]> {
  try {
    const { data, error } = await supabase
      .from('winners')
      .select('*')
      .eq('draw_id', drawId)
      .order('match_type', { ascending: false });

    if (error) {
      console.error('Error fetching winners:', error);
      return [];
    }

    return data as Winner[];
  } catch (error) {
    console.error('Error getting winners:', error);
    return [];
  }
}

/**
 * Calculate total prize pool from all active subscribers
 */
export async function calculateTotalPrizePool(): Promise<number> {
  try {
    const { count } = await supabase
      .from('subscriptions')
      .select('id', { count: 'exact' })
      .eq('status', 'active');

    const avgFee = 15; // Adjust based on your pricing
    return (count || 0) * avgFee * 0.5; // 50% to prizes
  } catch (error) {
    console.error('Error calculating pool:', error);
    return 0;
  }
}
