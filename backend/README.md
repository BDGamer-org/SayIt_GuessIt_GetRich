# 你说我猜马上发财 - Backend API

Cloudflare Worker backend for the SayIt GuessIt GetRich game.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Create new account (username, password) |
| POST | `/api/login` | Login with username and password |
| GET | `/api/lives` | Get current lives and next recovery countdown |
| POST | `/api/lives/consume` | Consume 1 life and start recovery timer |
| POST | `/api/lives/recharge` | Recharge lives by plan or amount |
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
- Recharge endpoint currently supports `p1`, `p6`, `p12`.

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
