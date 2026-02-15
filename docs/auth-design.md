# Authentication Design for SayIt Game

## Problem with Current System
- Names can be duplicated
- Anyone can submit scores for any name
- No way to verify identity

## Recommended Solution: Device-Based Auth

### Option 1: Simple Device UUID (Easiest)
```
App Launch → Generate UUID → Store locally → Use as player_id
```

**Pros:**
- No login UI needed
- Unique per device
- Persistent across sessions

**Cons:**
- Lost if app deleted
- Not transferable to new phone

### Option 2: Supabase Anonymous Auth (Recommended)
```
App Launch → Supabase anon sign-in → Get JWT → Use for API calls
```

**Pros:**
- Built-in user management
- Can upgrade to real auth later
- Secure tokens

**Cons:**
- Requires Supabase client library

---

## Database Schema Update

```sql
-- Add player_id column
ALTER TABLE scores ADD COLUMN player_id UUID;

-- Create index for faster queries
CREATE INDEX idx_scores_player_id ON scores(player_id);

-- Update RLS policy (if enabled)
CREATE POLICY "Users can only see their own scores" ON scores
FOR SELECT USING (auth.uid() = player_id);
```

---

## API Changes

### Current (Insecure)
```
GET /api/history?player=TestUser
POST /api/score {player_name, score}
```

### New (Secure)
```
GET /api/history
Headers: Authorization: Bearer <player_token>

POST /api/score
Headers: Authorization: Bearer <player_token>
Body: {score}
```

---

## Implementation Plan

Which option do you prefer?

**A) Device UUID** - Simple, no external auth service
**B) Supabase Anonymous Auth** - More robust, future-proof
**C) Custom JWT** - Full control, more complex

---

## Quick Questions

1. Do you want users to keep their history if they reinstall the app?
2. Should users be able to "claim" their account on a new device?
3. Do you plan to add Google/Apple login later?

Your answers will determine the best auth approach.
