import { supabase } from './supabaseClient';
import { Subscription, CharityContribution } from '@/types';

export const SUBSCRIPTION_PLANS = {
  monthly: {
    name: 'Monthly',
    price: 19.99,
    interval: 'month',
  },
  yearly: {
    name: 'Yearly',
    price: 199.99,
    interval: 'year',
    savings: '17%',
  },
};

/**
 * Get user's active subscription
 */
export async function getActiveSubscription(
  userId: string
): Promise<Subscription | null> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      return null;
    }

    return data as Subscription;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
}

/**
 * Get all user subscriptions (active and inactive)
 */
export async function getUserSubscriptions(
  userId: string
): Promise<Subscription[]> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return [];
    }

    return data as Subscription[];
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    return [];
  }
}

/**
 * Check if user has an active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await getActiveSubscription(userId);
  return subscription !== null && subscription.status === 'active';
}

/**
 * Create a new subscription record
 * (Actual payment processing done via Stripe in API route)
 */
export async function createSubscription(
  userId: string,
  planType: 'monthly' | 'yearly',
  stripeSubscriptionId: string
): Promise<{ success: boolean; error?: string; subscription?: Subscription }> {
  try {
    const planPrice =
      planType === 'monthly'
        ? SUBSCRIPTION_PLANS.monthly.price
        : SUBSCRIPTION_PLANS.yearly.price;

    // Calculate renewal date
    const startDate = new Date();
    const renewalDate = new Date(startDate);
    if (planType === 'monthly') {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    } else {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_type: planType,
        plan_price: planPrice,
        status: 'active',
        stripe_subscription_id: stripeSubscriptionId,
        start_date: startDate.toISOString(),
        renewal_date: renewalDate.toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, subscription: data as Subscription };
  } catch (error) {
    console.error('Error creating subscription:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create subscription',
    };
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancellation_date: new Date().toISOString(),
      })
      .eq('id', subscriptionId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to cancel subscription',
    };
  }
}

/**
 * Record a charity contribution from subscription
 */
export async function recordCharityContribution(
  userId: string,
  charityId: string,
  subscriptionId: string,
  charityPercentage: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get subscription details
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('plan_price')
      .eq('id', subscriptionId)
      .single();

    if (subError || !subscription) {
      return { success: false, error: 'Subscription not found' };
    }

    // Calculate contribution amount
    const amount = (subscription.plan_price * charityPercentage) / 100;

    const { error } = await supabase
      .from('charity_contributions')
      .insert({
        user_id: userId,
        charity_id: charityId,
        amount,
        source: 'subscription',
        subscription_id: subscriptionId,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error recording contribution:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to record contribution',
    };
  }
}

/**
 * Record a direct charity donation
 */
export async function recordCharityDonation(
  userId: string,
  charityId: string,
  amount: number
): Promise<{ success: boolean; error?: string }> {
  try {
    if (amount <= 0) {
      return { success: false, error: 'Donation amount must be positive' };
    }

    const { error } = await supabase
      .from('charity_contributions')
      .insert({
        user_id: userId,
        charity_id: charityId,
        amount,
        source: 'donation',
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error recording donation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to record donation',
    };
  }
}

/**
 * Get total charity contributions for a user
 */
export async function getTotalCharityContribution(
  userId: string
): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('charity_contributions')
      .select('amount')
      .eq('user_id', userId);

    if (error || !data) {
      return 0;
    }

    return data.reduce((sum, contrib) => sum + contrib.amount, 0);
  } catch (error) {
    console.error('Error getting total contribution:', error);
    return 0;
  }
}

/**
 * Get charity contributions by charity
 */
export async function getCharityContributionsByCharity(
  charityId: string
): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('charity_contributions')
      .select('amount')
      .eq('charity_id', charityId);

    if (error || !data) {
      return 0;
    }

    return data.reduce((sum, contrib) => sum + contrib.amount, 0);
  } catch (error) {
    console.error('Error getting charity total:', error);
    return 0;
  }
}

/**
 * Create payment record
 */
export async function createPayment(
  userId: string,
  amount: number,
  paymentType: 'subscription' | 'prize',
  stripePaymentId: string,
  relatedId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const insertData: any = {
      user_id: userId,
      amount,
      payment_type: paymentType,
      status: 'pending',
      stripe_payment_id: stripePaymentId,
    };

    if (paymentType === 'subscription' && relatedId) {
      insertData.subscription_id = relatedId;
    } else if (paymentType === 'prize' && relatedId) {
      insertData.winner_id = relatedId;
    }

    const { error } = await supabase
      .from('payments')
      .insert(insertData);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error creating payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment',
    };
  }
}

/**
 * Mark payment as completed
 */
export async function completePayment(
  paymentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('payments')
      .update({
        status: 'completed',
      })
      .eq('id', paymentId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error completing payment:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to complete payment',
    };
  }
}

/**
 * Get subscription statistics
 */
export async function getSubscriptionStats(): Promise<{
  totalSubscribers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
}> {
  try {
    const { count: totalCount } = await supabase
      .from('subscriptions')
      .select('id', { count: 'exact' });

    const { count: activeCount } = await supabase
      .from('subscriptions')
      .select('id', { count: 'exact' })
      .eq('status', 'active');

    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('plan_price, plan_type')
      .eq('status', 'active');

    let monthlyRevenue = 0;
    subscriptions?.forEach(sub => {
      if (sub.plan_type === 'monthly') {
        monthlyRevenue += sub.plan_price;
      } else {
        // Yearly plans contribute 1/12 to monthly revenue
        monthlyRevenue += sub.plan_price / 12;
      }
    });

    return {
      totalSubscribers: totalCount || 0,
      activeSubscriptions: activeCount || 0,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return {
      totalSubscribers: 0,
      activeSubscriptions: 0,
      monthlyRevenue: 0,
    };
  }
}
