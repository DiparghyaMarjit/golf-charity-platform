import { supabase } from './supabaseClient';
import { GolfScore } from '@/types';

/**
 * Get user's last 5 golf scores (most recent first)
 */
export async function getUserScores(userId: string): Promise<GolfScore[]> {
  try {
    const { data, error } = await supabase
      .from('golf_scores')
      .select('*')
      .eq('user_id', userId)
      .order('score_date', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching scores:', error);
      return [];
    }

    return data as GolfScore[];
  } catch (error) {
    console.error('Error getting scores:', error);
    return [];
  }
}

/**
 * Add a new golf score
 * If user already has 5 scores, the oldest one is removed automatically
 */
export async function addGolfScore(
  userId: string,
  score: number,
  scoreDate: string
): Promise<{ success: boolean; error?: string; score?: GolfScore }> {
  try {
    // Validate score is in Stableford range
    if (score < 1 || score > 45) {
      return { success: false, error: 'Score must be between 1 and 45' };
    }

    // Get current scores
    const { data: existingScores, error: fetchError } = await supabase
      .from('golf_scores')
      .select('id, score_date')
      .eq('user_id', userId)
      .order('score_date', { ascending: false });

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    // If user has 5 or more scores, delete the oldest
    if (existingScores && existingScores.length >= 5) {
      const oldestScore = existingScores[existingScores.length - 1];
      
      const { error: deleteError } = await supabase
        .from('golf_scores')
        .delete()
        .eq('id', oldestScore.id);

      if (deleteError) {
        return { success: false, error: deleteError.message };
      }
    }

    // Insert new score
    const { data, error } = await supabase
      .from('golf_scores')
      .insert({
        user_id: userId,
        score,
        score_date: scoreDate,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, score: data as GolfScore };
  } catch (error) {
    console.error('Error adding score:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add score',
    };
  }
}

/**
 * Update an existing golf score
 */
export async function updateGolfScore(
  scoreId: string,
  score: number,
  scoreDate: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate score
    if (score < 1 || score > 45) {
      return { success: false, error: 'Score must be between 1 and 45' };
    }

    const { error } = await supabase
      .from('golf_scores')
      .update({
        score,
        score_date: scoreDate,
      })
      .eq('id', scoreId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating score:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update score',
    };
  }
}

/**
 * Delete a golf score
 */
export async function deleteGolfScore(
  scoreId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('golf_scores')
      .delete()
      .eq('id', scoreId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting score:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete score',
    };
  }
}

/**
 * Get average score for a user
 */
export async function getAverageScore(userId: string): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from('golf_scores')
      .select('score')
      .eq('user_id', userId);

    if (error || !data || data.length === 0) {
      return null;
    }

    const sum = data.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round((sum / data.length) * 100) / 100;
  } catch (error) {
    console.error('Error calculating average:', error);
    return null;
  }
}

/**
 * Get best score for a user
 */
export async function getBestScore(userId: string): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from('golf_scores')
      .select('score')
      .eq('user_id', userId)
      .order('score', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return data.score;
  } catch (error) {
    console.error('Error getting best score:', error);
    return null;
  }
}
