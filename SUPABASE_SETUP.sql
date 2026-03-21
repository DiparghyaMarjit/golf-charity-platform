-- Golf Charity Platform - Supabase SQL Schema
-- Copy and paste this entire file into Supabase SQL Editor
-- Note: users table is already created by Supabase Auth, we use auth.users directly

-- Drop tables in reverse dependency order first (if they exist)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS charity_contributions CASCADE;
DROP TABLE IF EXISTS winners CASCADE;
DROP TABLE IF EXISTS draw_participants CASCADE;
DROP TABLE IF EXISTS draws CASCADE;
DROP TABLE IF EXISTS golf_scores CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS charities CASCADE;

-- 1. Charities table (create first due to FK dependency)
CREATE TABLE charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 0. User profile table (linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user',
  selected_charity_id UUID,
  charity_contribution_percentage INT DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (selected_charity_id) REFERENCES charities(id)
);

-- 1. Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_type VARCHAR(50) NOT NULL,
  plan_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  stripe_subscription_id VARCHAR(255) UNIQUE,
  start_date TIMESTAMP DEFAULT NOW(),
  renewal_date TIMESTAMP,
  cancellation_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Golf scores table
CREATE TABLE IF NOT EXISTS golf_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  score INT NOT NULL,
  score_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 4. Draws table
CREATE TABLE draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_year VARCHAR(7) NOT NULL UNIQUE,
  status VARCHAR(50) DEFAULT 'pending',
  draw_type VARCHAR(50) DEFAULT 'random',
  total_prize_pool DECIMAL(10, 2),
  pool_40_amount DECIMAL(10, 2),
  pool_35_amount DECIMAL(10, 2),
  pool_25_amount DECIMAL(10, 2),
  winning_numbers TEXT NOT NULL,
  rollover_from_previous DECIMAL(10, 2) DEFAULT 0,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Draw participants table
CREATE TABLE draw_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID NOT NULL,
  user_id UUID NOT NULL,
  selected_numbers TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (draw_id) REFERENCES draws(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(draw_id, user_id)
);

-- 6. Winners table
CREATE TABLE winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  draw_id UUID NOT NULL,
  match_type INT NOT NULL,
  prize_amount DECIMAL(10, 2) NOT NULL,
  verification_status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  proof_url TEXT,
  proof_submitted_at TIMESTAMP,
  verified_at TIMESTAMP,
  verified_by UUID,
  paid_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (draw_id) REFERENCES draws(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES auth.users(id)
);

-- 7. Charity contributions table
CREATE TABLE charity_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  charity_id UUID NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  source VARCHAR(50) NOT NULL,
  subscription_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (charity_id) REFERENCES charities(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);

-- 8. Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  stripe_payment_id VARCHAR(255) UNIQUE,
  subscription_id UUID,
  winner_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id),
  FOREIGN KEY (winner_id) REFERENCES winners(id)
);

-- Indexes for performance
CREATE INDEX idx_golf_scores_user_id ON golf_scores(user_id);
CREATE INDEX idx_golf_scores_user_date ON golf_scores(user_id, score_date DESC);
CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX idx_winners_user_status ON winners(user_id, verification_status);
CREATE INDEX idx_winners_payment_status ON winners(payment_status);
