# Golf Charity Platform - Setup Guide

## Phase 1: Backend Setup (Complete!)

### Database & Utilities Created
✅ Supabase schema (DATABASE_SCHEMA.md)
✅ TypeScript types and interfaces (/src/types/index.ts)
✅ Authentication utilities (/src/lib/auth.ts)
✅ Golf score management (/src/lib/scores.ts)
✅ Draw and prize calculations (/src/lib/draws.ts)
✅ Subscription and payment handling (/src/lib/subscriptions.ts)
✅ Winner verification system (/src/lib/winners.ts)
✅ Charity management (/src/lib/charities.ts)
✅ Stripe integration ready (dependencies added)

---

## Phase 2: Environment & Dependencies Setup

### 1. Create `.env.local` file
```bash
# Copy .env.example to .env.local and fill in with your credentials
cp .env.example .env.local
```

### 2. Set Up Supabase Project
1. Go to https://supabase.com and create a new project
2. In Supabase Dashboard:
   - Settings → API Keys → Copy `URL` and `Anon Key`
   - Add to `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Create Database Schema
1. In Supabase Dashboard → SQL Editor → New Query
2. Copy each table definition from `DATABASE_SCHEMA.md`
3. Run each CREATE TABLE statement
4. Create indexes as specified

### 4. Set Up Stripe
1. Go to https://dashboard.stripe.com
2. In Developers → API keys, copy:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`
3. Set up webhook endpoint (we'll create the API route for this)

### 5. Install Dependencies
```bash
npm install
```

---

## Phase 3: Data & Configuration

### Seed Initial Charities (Optional)
Run this in Supabase SQL Editor to add sample charities:
```sql
INSERT INTO charities (name, description, is_featured) VALUES
('Heart of Golf Foundation', 'Supporting youth golf development in underprivileged communities', true),
('Golf Community Care', 'Building inclusive golf facilities for all abilities', true),
('Environmental Golf Initiative', 'Protecting golf courses and natural habitats', false),
('Golf & Children''s Health', 'Promoting golf as therapy for children with disabilities', true);
```

### Create Admin User
1. Register a user normally via signup
2. In Supabase Database Editor:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@example.com';
```

---

## Phase 4: Features Still to Implement

### UI Components (Next Steps)
- [ ] Homepage/Landing page (emotion-driven design)
- [ ] Signup flow with charity selection
- [ ] Complete auth pages (login/signup styling)
- [ ] User dashboard (all modules)
- [ ] Score entry interface
- [ ] Charity selection UI
- [ ] Draw participation interface
- [ ] Admin dashboard
- [ ] Winner verification UI
- [ ] Charity listing/directory page

### API Routes
- [ ] `/api/auth/signup` - Register user
- [ ] `/api/auth/login` - Authenticate user
- [ ] `/api/subscriptions/create-checkout-session` - Stripe checkout
- [ ] `/api/subscriptions/webhook` - Handle Stripe events
- [ ] `/api/draw/create` - Admin create draw
- [ ] `/api/draw/publish` - Admin publish results
- [ ] `/api/upload/proof` - Upload winner proof
- [ ] Dashboard data endpoints

### Testing Checklist Items
- [ ] User signup & login
- [ ] Subscription flow (monthly/yearly)
- [ ] Score entry - 5-score rolling logic
- [ ] Draw system logic & simulation
- [ ] Charity selection & contribution calculation
- [ ] Winner verification flow & payout tracking
- [ ] User Dashboard - all modules
- [ ] Admin Panel - full control
- [ ] Data accuracy validation
- [ ] Mobile responsive design
- [ ] Error handling & edge cases

---

## Development Workflow

### Start Dev Server
```bash
npm run dev
```
Visit http://localhost:3000

### Build for Production
```bash
npm run build
npm start
```

### Deployment
- Deploy to Vercel (or your hosting)
- Use NEW Vercel account (as per PRD requirements)
- Use NEW Supabase project (as per PRD requirements)
- Set environment variables in deployment dashboard

---

## Troubleshooting

### "Missing Supabase environment variables"
→ Check `.env.local` file exists with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

### Database connection issues
→ Verify Supabase URL/key are correct
→ Check network connectivity

### Stripe errors
→ Verify Stripe keys are correct
→ Check webhook secret if applicable

---

## Key Architecture Decisions

1. **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
2. **Payment**: Stripe for PCI compliance
3. **Frontend**: Next.js with TailwindCSS for responsive design
4. **Authentication**: Supabase Auth with JWT tokens
5. **Draw Engine**: Supports both random and algorithm-based draws
6. **Score Management**: Rolling window of 5 scores per user
7. **Charity Tracking**: Percentage-based and direct donations

---

## Next Steps

1. Create `.env.local` with your credentials
2. Set up Supabase project and database schema
3. Set up Stripe account
4. Run `npm install`
5. Start development with `npm run dev`
6. Follow "Features Still to Implement" section for UI build-out
