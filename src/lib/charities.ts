import { supabase } from './supabaseClient';
import { Charity } from '@/types';

/**
 * Get all charities
 */
export async function getAllCharities(): Promise<Charity[]> {
  try {
    const { data, error } = await supabase
      .from('charities')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching charities:', error);
      return [];
    }

    return data as Charity[];
  } catch (error) {
    console.error('Error getting charities:', error);
    return [];
  }
}

/**
 * Get featured charities
 */
export async function getFeaturedCharities(): Promise<Charity[]> {
  try {
    const { data, error } = await supabase
      .from('charities')
      .select('*')
      .eq('is_featured', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching featured charities:', error);
      return [];
    }

    return data as Charity[];
  } catch (error) {
    console.error('Error getting featured charities:', error);
    return [];
  }
}

/**
 * Get charity by ID
 */
export async function getCharityById(charityId: string): Promise<Charity | null> {
  try {
    const { data, error } = await supabase
      .from('charities')
      .select('*')
      .eq('id', charityId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as Charity;
  } catch (error) {
    console.error('Error getting charity:', error);
    return null;
  }
}

/**
 * Search charities by name or description
 */
export async function searchCharities(query: string): Promise<Charity[]> {
  try {
    const { data, error } = await supabase
      .from('charities')
      .select('*')
      .or(
        `name.ilike.%${query}%,description.ilike.%${query}%`
      )
      .order('is_featured', { ascending: false })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error searching charities:', error);
      return [];
    }

    return data as Charity[];
  } catch (error) {
    console.error('Error searching charities:', error);
    return [];
  }
}

/**
 * Create a new charity (admin only)
 */
export async function createCharity(
  name: string,
  description: string,
  logoUrl?: string,
  websiteUrl?: string,
  isFeatured: boolean = false
): Promise<{ success: boolean; error?: string; charity?: Charity }> {
  try {
    if (!name.trim()) {
      return { success: false, error: 'Charity name is required' };
    }

    const { data, error } = await supabase
      .from('charities')
      .insert({
        name: name.trim(),
        description: description.trim(),
        logo_url: logoUrl,
        website_url: websiteUrl,
        is_featured: isFeatured,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, charity: data as Charity };
  } catch (error) {
    console.error('Error creating charity:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create charity',
    };
  }
}

/**
 * Update charity (admin only)
 */
export async function updateCharity(
  charityId: string,
  updates: Partial<Charity>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('charities')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', charityId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating charity:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update charity',
    };
  }
}

/**
 * Delete charity (admin only)
 */
export async function deleteCharity(charityId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('charities')
      .delete()
      .eq('id', charityId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting charity:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete charity',
    };
  }
}

/**
 * Toggle charity featured status (admin only)
 */
export async function toggleCharityFeatured(
  charityId: string,
  isFeatured: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('charities')
      .update({
        is_featured: isFeatured,
        updated_at: new Date().toISOString(),
      })
      .eq('id', charityId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error toggling featured:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update',
    };
  }
}

/**
 * Get charity contribution leaderboard
 */
export async function getCharityLeaderboard(): Promise<
  (Charity & { totalContributed: number; contributorCount: number })[]
> {
  try {
    const charities = await getAllCharities();

    const charityStats = await Promise.all(
      charities.map(async (charity) => {
        const { data: contributions } = await supabase
          .from('charity_contributions')
          .select('amount')
          .eq('charity_id', charity.id);

        const { count } = await supabase
          .from('charity_contributions')
          .select('id', { count: 'exact' })
          .eq('charity_id', charity.id);

        const totalContributed = contributions
          ? contributions.reduce((sum, c) => sum + c.amount, 0)
          : 0;

        return {
          ...charity,
          totalContributed,
          contributorCount: count || 0,
        };
      })
    );

    return charityStats.sort((a, b) => b.totalContributed - a.totalContributed);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
}

/**
 * Get charity statistics
 */
export async function getCharityStats(charityId: string): Promise<{
  totalContributed: number;
  contributorCount: number;
  averageContribution: number;
}> {
  try {
    const { data: contributions, error } = await supabase
      .from('charity_contributions')
      .select('amount')
      .eq('charity_id', charityId);

    if (error || !contributions) {
      return {
        totalContributed: 0,
        contributorCount: 0,
        averageContribution: 0,
      };
    }

    const totalContributed = contributions.reduce((sum, c) => sum + c.amount, 0);
    const contributorCount = contributions.length;
    const averageContribution =
      contributorCount > 0 ? totalContributed / contributorCount : 0;

    return {
      totalContributed: Math.round(totalContributed * 100) / 100,
      contributorCount,
      averageContribution: Math.round(averageContribution * 100) / 100,
    };
  } catch (error) {
    console.error('Error getting charity stats:', error);
    return {
      totalContributed: 0,
      contributorCount: 0,
      averageContribution: 0,
    };
  }
}
