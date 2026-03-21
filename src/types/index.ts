// Type definitions for Golf Charity Platform

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  selected_charity_id?: string;
  charity_contribution_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'monthly' | 'yearly';
  plan_price: number;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  stripe_subscription_id?: string;
  start_date: string;
  renewal_date?: string;
  cancellation_date?: string;
  created_at: string;
  updated_at: string;
}

export interface GolfScore {
  id: string;
  user_id: string;
  score: number; // 1-45 Stableford
  score_date: string;
  created_at: string;
}

export interface Charity {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Draw {
  id: string;
  month_year: string; // 'YYYY-MM'
  status: 'pending' | 'simulation' | 'published' | 'cancelled';
  draw_type: 'random' | 'algorithmic';
  total_prize_pool: number;
  pool_40_amount: number; // 5-number match (40%)
  pool_35_amount: number; // 4-number match (35%)
  pool_25_amount: number; // 3-number match (25%)
  winning_numbers: number[]; // [n1, n2, n3, n4, n5]
  rollover_from_previous: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DrawParticipant {
  id: string;
  draw_id: string;
  user_id: string;
  selected_numbers: number[]; // [n1, n2, n3, n4, n5]
  created_at: string;
}

export interface Winner {
  id: string;
  user_id: string;
  draw_id: string;
  match_type: 5 | 4 | 3; // Number of matches
  prize_amount: number;
  verification_status: 'pending' | 'approved' | 'rejected';
  payment_status: 'pending' | 'paid';
  proof_url?: string;
  proof_submitted_at?: string;
  verified_at?: string;
  verified_by?: string;
  paid_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface CharityContribution {
  id: string;
  user_id: string;
  charity_id: string;
  amount: number;
  source: 'subscription' | 'donation';
  subscription_id?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  payment_type: 'subscription' | 'prize';
  status: 'pending' | 'completed' | 'failed';
  stripe_payment_id?: string;
  subscription_id?: string;
  winner_id?: string;
  created_at: string;
  updated_at: string;
}

// Dashboard DTOs
export interface UserDashboardData {
  user: User;
  subscription?: Subscription;
  recentScores: GolfScore[];
  selectedCharity?: Charity;
  winnings: Winner[];
  totalWon: number;
  upcomingDraw?: Draw;
  totalCharityContributed: number;
}

export interface AdminDashboardData {
  totalUsers: number;
  totalSubscribers: number;
  totalPrizePool: number;
  totalCharityContributed: number;
  recentWinners: (Winner & { user: User })[];
  pendingVerifications: (Winner & { user: User })[];
  latestDraw?: Draw;
}

// Form types
export interface SignupFormData {
  email: string;
  password: string;
  full_name: string;
  selected_charity_id: string;
  charity_percentage: number;
}

export interface ScoreEntryData {
  score: number;
  score_date: string;
}

export interface DrawConfigData {
  month_year: string;
  draw_type: 'random' | 'algorithmic';
}

export interface WinnerVerificationData {
  winner_id: string;
  approval: boolean;
  rejection_reason?: string;
}
