# Documentation Index

Complete technical documentation for **你说我猜马上发财** (Say It Guess It Get Rich).

## Quick Links

| Document | Purpose | Audience |
|----------|---------|----------|
| [SPEC.md](./SPEC.md) | Complete technical specification, architecture, composables | Developers |
| [API_SPEC.md](./API_SPEC.md) | API endpoint documentation | Backend/Frontend devs |
| [COMPONENT_SPEC.md](./COMPONENT_SPEC.md) | Vue component specifications | Frontend devs |
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

### Documentation (`docs/`)
```
docs/
├── README.md              # This index
├── SPEC.md                # Complete technical spec (includes composables)
├── COMPONENT_SPEC.md      # Vue component specifications
├── API_SPEC.md            # API endpoint documentation
├── DEPLOYMENT.md          # Deployment guide
├── design.md              # Design system
├── auth-setup.sql         # Database setup SQL
├── worker-simple.js       # API worker (simple auth)
└── worker-auth.js         # API worker (JWT auth, unused)
```

### Source Code
```
├── components/            # Vue components
│   ├── PaperCard.vue
│   ├── SketchButton.vue
│   ├── EnergyPill.vue
│   ├── RightMenu.vue
│   └── screens/           # Screen components
│       ├── AuthScreen.vue
│       ├── BackupScreen.vue
│       ├── HomeScreen.vue
│       ├── SetupScreen.vue
│       ├── GameScreen.vue
│       ├── ResultScreen.vue
│       └── HistoryScreen.vue
├── composables/           # Logic composables
│   ├── useGameApi.js      # API calls
│   └── useGameLogic.js    # Game mechanics
└── pages/index/index.vue  # Main orchestrator
```

## For New Developers

1. Start with [SPEC.md](./SPEC.md) for architecture overview, composables, and data flow
2. Read [design.md](./design.md) for UI understanding and visual specs
3. Check [COMPONENT_SPEC.md](./COMPONENT_SPEC.md) for Vue component props, events, and usage
4. Reference [API_SPEC.md](./API_SPEC.md) for backend integration
5. Use [DEPLOYMENT.md](./DEPLOYMENT.md) to set up environment

## Component Architecture

The app uses a **component-based architecture**:

- **Screen Components**: Each game screen is a separate component in `components/screens/`
- **UI Components**: Reusable components (PaperCard, SketchButton, etc.) in `components/`
- **Composables**: Logic extracted into `composables/` for API calls and game mechanics
- **Orchestrator**: `pages/index/index.vue` manages state and coordinates between components

**Before**: Single 1084-line `index.vue`
**After**: 14 focused files (~1600 lines total, index.vue is ~393 lines)

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
