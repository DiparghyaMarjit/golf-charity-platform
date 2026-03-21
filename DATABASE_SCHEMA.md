# Golf Charity Platform - Database Schema

## Supabase Tables

### 1. users (Extends Supabase auth)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY (FK: auth.users.id),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user', -- 'user', 'admin'
  selected_charity_id UUID,
  charity_contribution_percentage INT DEFAULT 10, -- Minimum 10%
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (selected_charity_id) REFERENCES charities(id)
);
```

### 2. subscriptions
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_type VARCHAR(50) NOT NULL, -- 'monthly', 'yearly'
  plan_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'pending'
  stripe_subscription_id VARCHAR(255) UNIQUE,
  start_date TIMESTAMP DEFAULT NOW(),
  renewal_date TIMESTAMP,
  cancellation_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3. golf_scores
```sql
CREATE TABLE golf_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  score INT NOT NULL, -- 1-45 Stableford format
  score_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_golf_scores_user_id ON golf_scores(user_id);
```

### 4. charities
```sql
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
```

### 5. draws
```sql
CREATE TABLE draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_year VARCHAR(7) NOT NULL UNIQUE, -- 'YYYY-MM'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'simulation', 'published', 'cancelled'
  draw_type VARCHAR(50) DEFAULT 'random', -- 'random', 'algorithmic'
  total_prize_pool DECIMAL(10, 2),
  pool_40_amount DECIMAL(10, 2), -- 5-number match
  pool_35_amount DECIMAL(10, 2), -- 4-number match
  pool_25_amount DECIMAL(10, 2), -- 3-number match
  winning_numbers TEXT NOT NULL, -- JSON: [n1, n2, n3, n4, n5]
  rollover_from_previous DECIMAL(10, 2) DEFAULT 0,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 6. draw_participants
```sql
CREATE TABLE draw_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID NOT NULL,
  user_id UUID NOT NULL,
  selected_numbers TEXT NOT NULL, -- JSON: [n1, n2, n3, n4, n5]
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (draw_id) REFERENCES draws(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(draw_id, user_id)
);
```

### 7. winners
```sql
CREATE TABLE winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  draw_id UUID NOT NULL,
  match_type INT NOT NULL, -- 5, 4, or 3
  prize_amount DECIMAL(10, 2) NOT NULL,
  verification_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid'
  proof_url TEXT, -- Screenshot of scores
  proof_submitted_at TIMESTAMP,
  verified_at TIMESTAMP,
  verified_by UUID, -- Admin user ID
  paid_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (draw_id) REFERENCES draws(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id)
);
```

### 8. charity_contributions
```sql
CREATE TABLE charity_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  charity_id UUID NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  source VARCHAR(50) NOT NULL, -- 'subscription', 'donation'
  subscription_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (charity_id) REFERENCES charities(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);
```

### 9. payments
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_type VARCHAR(50) NOT NULL, -- 'subscription', 'prize'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  stripe_payment_id VARCHAR(255) UNIQUE,
  subscription_id UUID,
  winner_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id),
  FOREIGN KEY (winner_id) REFERENCES winners(id)
);
```

## Key Constraints & Indexes

```sql
-- Ensure rolling window of 5 scores per user
CREATE INDEX idx_golf_scores_user_date ON golf_scores(user_id, score_date DESC);

-- Quick lookups for active subscriptions
CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status);

-- Winner verification tracking
CREATE INDEX idx_winners_user_status ON winners(user_id, verification_status);
CREATE INDEX idx_winners_payment_status ON winners(payment_status);
```

## Setup Instructions for Supabase

1. Copy each table schema from above
2. Run in Supabase SQL editor (Tables → New Query)
3. Enable RLS (Row Level Security) for each table
4. Setup policies:
   - Users can only view their own data (except charities, public draws)
   - Admin users can manage everything
   - Public can view charity listings and draw results

5. Enable real-time for needed tables (subscriptions, winners updates)
