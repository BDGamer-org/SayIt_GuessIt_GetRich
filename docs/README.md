# Documentation Index

Complete technical documentation for **你说我猜马上发财** (Say It Guess It Get Rich).

## Quick Links

| Document | Purpose | Audience |
|----------|---------|----------|
| [SPEC.md](./SPEC.md) | Complete technical specification | Developers |
| [API_SPEC.md](./API_SPEC.md) | API endpoint documentation | Backend/Frontend devs |
| [COMPONENT_SPEC.md](./COMPONENT_SPEC.md) | UI component specifications | Frontend devs |
| [design.md](./design.md) | UI/UX design system | Designers |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deployment instructions | DevOps |
| [auth-setup.sql](./auth-setup.sql) | Database schema | Backend devs |
| [worker-simple.js](./worker-simple.js) | Cloudflare Worker code | Backend devs |

## Project Overview

A gesture-based word guessing game for mobile (uni-app + Vue 3).

**Architecture:**
- Frontend: Vue 3 + uni-app
- Backend: Cloudflare Worker
- Database: Supabase (PostgreSQL)

**Key Features:**
- Device-based authentication with backup codes
- Motion controls (tilt to answer)
- Score history tracking
- Hand-drawn sketch UI aesthetic

## File Organization

```
docs/
├── README.md              # This index
├── SPEC.md                # Complete technical spec
├── API_SPEC.md            # API documentation
├── COMPONENT_SPEC.md      # UI component specs
├── DEPLOYMENT.md          # Deployment guide
├── design.md              # Design system
├── auth-setup.sql         # Database setup SQL
├── worker-simple.js       # API worker (simple auth)
└── worker-auth.js         # API worker (JWT auth, unused)
```

## For New Developers

1. Start with [SPEC.md](./SPEC.md) for architecture overview
2. Read [design.md](./design.md) for UI understanding
3. Check [COMPONENT_SPEC.md](./COMPONENT_SPEC.md) for implementation details
4. Use [DEPLOYMENT.md](./DEPLOYMENT.md) to set up environment

## Database Quick Start

Run in Supabase SQL Editor:
```sql
\i auth-setup.sql
```

## API Quick Test

```bash
# Register
curl -X POST https://sgit-api.bdgamer.org/api/register \
  -H "Content-Type: application/json" \
  -d '{"player_name": "Test"}'

# Get history
curl https://sgit-api.bdgamer.org/api/history \
  -H "X-Player-ID: your-player-id"
```
