# 你说我猜马上发财 - Backend API

Cloudflare Worker backend for the SayIt GuessIt GetRich game.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Create new account (username, password) |
| POST | `/api/login` | Login with username and password |
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
  created_at timestamp default now()
);
```

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