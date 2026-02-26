# 你说我猜马上发财 - Backend API

Cloudflare Worker backend for the SayIt GuessIt GetRich game.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Create new account (username, password) |
| POST | `/api/login` | Login with username and password |
| GET | `/api/lives` | Get current lives and next recovery countdown |
| POST | `/api/lives/consume` | Consume 1 life and start recovery timer |
| POST | `/api/pay/checkout/create` | Create Stripe checkout session |
| GET | `/api/pay/order-status` | Query payment order status |
| POST | `/api/stripe/webhook` | Stripe webhook callback |
| GET | `/api/history` | Get user's score history (requires X-Player-ID header) |
| POST | `/api/score` | Submit a score (requires X-Player-ID header) |
| GET | `/api/words` | Get random word bank |


## Database Schema

Required Supabase tables:

### players
```sql
create table players (
  id uuid default gen_random_uuid() primary key,
  username text unique not null,
  password_hash text not null,
  player_name text,
  lives integer not null default 5,
  life_recovery_queue jsonb not null default '[]'::jsonb,
  created_at timestamp default now()
);
```

Notes:
- `lives` can be greater than `5` after recharge.
- Free recovery only applies when `lives < 5` (30 min +1, up to 5).
- Stripe plans currently support `p1`, `p2`, `p6`, `p12`, `p20_month`, `p68_permanent`.
- `p20_month` grants 30 days of unlimited lives (can be extended by repurchase).
- `p68_permanent` grants permanent unlimited lives.
- To satisfy Stripe Checkout minimum amount constraints, all payment plans should stay above ¥5.

### payment_orders
```sql
create table payment_orders (
  id bigserial primary key,
  order_no text unique not null,
  player_id uuid not null references players(id),
  plan_id text not null,
  amount_cents integer not null,
  currency text not null default 'cny',
  lives_gain integer not null,
  channel text not null default 'stripe',
  status text not null default 'pending',
  stripe_session_id text,
  stripe_payment_intent text,
  paid_lives_snapshot integer,
  error_message text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### stripe_webhook_events
```sql
create table stripe_webhook_events (
  event_id text primary key,
  created_at timestamptz not null default now()
);
```

### player_memberships
```sql
create table player_memberships (
  player_id uuid primary key references players(id) on delete cascade,
  membership_type text not null check (membership_type in ('monthly', 'lifetime')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## Required Worker Secrets

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_SUCCESS_URL`
- `STRIPE_CANCEL_URL`

### scores
```sql
create table scores (
  id uuid default gen_random_uuid() primary key,
  player_id uuid references players(id),
  player_name text,
  score integer not null,
  created_at timestamp default now()
);
```

### word_bank
```sql
create table word_bank (
  id uuid default gen_random_uuid() primary key,
  word_id integer not null,
  word text not null,
  category text
);
```
