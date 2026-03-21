import { supabase } from './supabaseClient';
import { Winner } from '@/types';

/**
 * Get all winners for a user
 */
export async function getUserWinners(userId: string): Promise<Winner[]> {
  try {
    const { data, error } = await supabase
      .from('winners')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user winners:', error);
      return [];
    }

    return data as Winner[];
  } catch (error) {
    console.error('Error getting winners:', error);
    return [];
  }
}

/**
 * Get winner verification count
 */
export async function getUserWinnerCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('winners')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    if (error) {
      console.error('Error counting winners:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error getting winner count:', error);
    return 0;
  }
}

/**
 * Calculate total winnings for a user
 */
export async function getTotalWinnings(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('winners')
      .select('prize_amount')
      .eq('user_id', userId);

    if (error || !data) {
      return 0;
    }

    return data.reduce((sum, winner) => sum + winner.prize_amount, 0);
  } catch (error) {
    console.error('Error calculating total winnings:', error);
    return 0;
  }
}

/**
 * Submit winner proof (screenshot of scores)
 */
export async function submitWinnerProof(
  winnerId: string,
  proofUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('winners')
      .update({
        proof_url: proofUrl,
        proof_submitted_at: new Date().toISOString(),
      })
      .eq('id', winnerId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error submitting proof:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit proof',
    };
  }
}

/**
 * Get pending verifications (admin only)
 */
export async function getPendingVerifications(): Promise<Winner[]> {
  try {
    const { data, error } = await supabase
      .from('winners')
      .select('*')
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching pending verifications:', error);
      return [];
    }

    return data as Winner[];
  } catch (error) {
    console.error('Error getting pending verifications:', error);
    return [];
  }
}

/**
 * Approve winner verification (admin only)
 */
export async function approveWinner(
  winnerId: string,
  adminUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('winners')
      .update({
        verification_status: 'approved',
        verified_at: new Date().toISOString(),
        verified_by: adminUserId,
      })
      .eq('id', winnerId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error approving winner:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve winner',
    };
  }
}

/**
 * Reject winner verification with reason (admin only)
 */
export async function rejectWinner(
  winnerId: string,
  adminUserId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!reason.trim()) {
      return { success: false, error: 'Rejection reason is required' };
    }

    const { error } = await supabase
      .from('winners')
      .update({
        verification_status: 'rejected',
        verified_at: new Date().toISOString(),
        verified_by: adminUserId,
        rejection_reason: reason,
      })
      .eq('id', winnerId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error rejecting winner:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reject winner',
    };
  }
}

/**
 * Mark winner as paid (admin only)
 */
export async function markWinnerAsPaid(
  winnerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if winner is approved first
    const { data: winner, error: fetchError } = await supabase
      .from('winners')
      .select('verification_status')
      .eq('id', winnerId)
      .single();

    if (fetchError || !winner) {
      return { success: false, error: 'Winner not found' };
    }

    if (winner.verification_status !== 'approved') {
      return { success: false, error: 'Winner must be approved before marking as paid' };
    }

    const { error } = await supabase
      .from('winners')
      .update({
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', winnerId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error marking paid:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark as paid',
    };
  }
}

/**
 * Get all winners (admin dashboard)
 */
export async function getAllWinners(): Promise<Winner[]> {
  try {
    const { data, error } = await supabase
      .from('winners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all winners:', error);
      return [];
    }

    return data as Winner[];
  } catch (error) {
    console.error('Error getting all winners:', error);
    return [];
  }
}

/**
 * Get winner verification statistics
 */
export async function getWinnerStats(): Promise<{
  totalWinners: number;
  pendingVerification: number;
  approvedWinners: number;
  rejectedWinners: number;
  paidWinners: number;
  totalPrizesPaid: number;
}> {
  try {
    const { count: totalCount } = await supabase
      .from('winners')
      .select('id', { count: 'exact' });

    const { count: pendingCount } = await supabase
      .from('winners')
      .select('id', { count: 'exact' })
      .eq('verification_status', 'pending');

    const { count: approvedCount } = await supabase
      .from('winners')
      .select('id', { count: 'exact' })
      .eq('verification_status', 'approved');

    const { count: rejectedCount } = await supabase
      .from('winners')
      .select('id', { count: 'exact' })
      .eq('verification_status', 'rejected');

    const { count: paidCount } = await supabase
      .from('winners')
      .select('id', { count: 'exact' })
      .eq('payment_status', 'paid');

    const { data: paid } = await supabase
      .from('winners')
      .select('prize_amount')
      .eq('payment_status', 'paid');

    const totalPrizesPaid = paid
      ? paid.reduce((sum, w) => sum + w.prize_amount, 0)
      : 0;

    return {
      totalWinners: totalCount || 0,
      pendingVerification: pendingCount || 0,
      approvedWinners: approvedCount || 0,
      rejectedWinners: rejectedCount || 0,
      paidWinners: paidCount || 0,
      totalPrizesPaid,
    };
  } catch (error) {
    console.error('Error getting winner stats:', error);
    return {
      totalWinners: 0,
      pendingVerification: 0,
      approvedWinners: 0,
      rejectedWinners: 0,
      paidWinners: 0,
      totalPrizesPaid: 0,
    };
  }
}
