# SayIt_GuessIt_GetRich - Technical Specification

## Project Overview

**Name**: 你说我猜马上发财 (Say It Guess It Get Rich)
**Type**: Mobile Game (uni-app)
**Platform**: iOS/Android (via uni-app)
**Backend**: Cloudflare Worker + Supabase

A gesture-based word guessing game where players tilt their phone to answer (tilt down = correct, tilt up = pass).

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Mobile App    │────▶│  Cloudflare     │────▶│    Supabase     │
│   (uni-app)     │◀────│   Worker        │◀────│  (PostgreSQL)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                                               │
        │          ┌─────────────────┐                  │
        └─────────▶│  sgit-api.      │◀─────────────────┘
                   │  bdgamer.org    │
                   └─────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vue 3 + uni-app |
| Styling | CSS3 with custom sketch aesthetic |
| Backend | Cloudflare Worker (JavaScript) |
| Database | Supabase (PostgreSQL) |
| API Protocol | REST + CORS |
| Auth | Device-based (X-Player-ID header) |

---

## Database Schema

### Table: `players`

```sql
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    backup_code TEXT UNIQUE NOT NULL,
    player_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key, auto-generated |
| backup_code | TEXT | 8-char uppercase code for account recovery |
| player_name | TEXT | Display name (max 12 chars) |
| created_at | TIMESTAMPTZ | Account creation timestamp |

**Indexes**:
- `idx_players_backup_code` on `backup_code`

**RLS Policies**:
- `Allow insert`: Anyone can create players
- `Allow select`: Anyone can read players (needed for recovery)

### Table: `scores`

```sql
CREATE TABLE IF NOT EXISTS scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id),
    player_name TEXT,
    score INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| player_id | UUID | Foreign key to players |
| player_name | TEXT | Denormalized player name at time of score |
| score | INTEGER | Score value (number of correct answers) |
| created_at | TIMESTAMPTZ | When the score was recorded |

**Indexes**:
- `idx_scores_player_id` on `player_id`

**RLS Policies**:
- `Allow insert`: Anyone can submit scores
- `Allow select`: Anyone can view scores

---

## API Specification

### Base URL
```
https://sgit-api.bdgamer.org
```

### CORS Headers
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-Player-ID
```

---

### POST /api/register

Create a new player account.

**Request**:
```json
{
  "player_name": "Player Name"
}
```

**Response (200)**:
```json
{
  "player_id": "uuid-here",
  "backup_code": "ABC12345",
  "player_name": "Player Name"
}
```

**Errors**:
- `500`: Database error

---

### POST /api/recover

Restore account by backup code.

**Request**:
```json
{
  "backup_code": "ABC12345"
}
```

**Response (200)**:
```json
{
  "player_id": "uuid-here",
  "player_name": "Player Name"
}
```

**Errors**:
- `400`: Missing backup code
- `404`: Invalid backup code

---

### GET /api/history

Get user's last 10 scores.

**Headers**:
```
X-Player-ID: <player-uuid>
```

**Response (200)**:
```json
[
  {
    "id": "uuid",
    "player_id": "uuid",
    "player_name": "Player Name",
    "score": 15,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

**Errors**:
- `401`: Missing X-Player-ID header

---

### POST /api/score

Submit a new score.

**Headers**:
```
X-Player-ID: <player-uuid>
Content-Type: application/json
```

**Request**:
```json
{
  "score": 15
}
```

**Response (200)**:
```
OK
```

**Errors**:
- `401`: Missing X-Player-ID header

---

## Frontend Architecture

### Project Structure

```
SayIt_GuessIt_GetRich/
├── pages/
│   └── index/
│       └── index.vue          # Main game component (all screens)
├── static/
│   └── data/
│       └── idioms.js          # Word database
├── docs/
│   ├── SPEC.md                # This file
│   ├── design.md              # UI design specifications
│   ├── auth-setup.sql         # Database setup
│   └── worker-simple.js       # Cloudflare Worker code
├── manifest.json              # App manifest
├── pages.json                 # Page routing
└── App.vue                    # Root component
```

---

## Game Screens (States)

| Status | Description |
|--------|-------------|
| `auth` | Login/register modal |
| `backup` | Display backup code after registration |
| `home` | Category selection screen |
| `setup` | Time selection modal |
| `playing` | Active game screen |
| `result` | Score display modal |
| `history` | User's score history modal |

---

## State Management

### Data Properties

```javascript
{
  // Game State
  gameStatus: 'home',      // Current screen
  score: 0,                // Current game score
  timeLeft: 60,            // Seconds remaining
  selectedTime: 120,       // Selected game duration
  lastTime: 120,           // Remember last selection
  currentWord: '准备',      // Current displayed word
  wordList: [],            // Shuffled word queue
  isLocked: false,         // Motion debounce lock
  timerInterval: null,     // Timer reference

  // Auth State
  playerId: '',            // UUID from Supabase
  playerName: '',          // Display name
  backupCode: '',          // 8-char recovery code
  authMode: 'register',    // 'register' or 'recover'
  tempName: '',            // Form input
  backupCodeInput: '',     // Recovery input
  authError: '',           // Error message
  authSuccess: '',         // Success message

  // History State
  userHistory: [],         // Last 10 scores
  loading: false,          // History loading state
  submitStatus: ''         // Score upload status
}
```

### Local Storage Keys

| Key | Value |
|-----|-------|
| `playerId` | UUID string |
| `playerName` | Display name |
| `backupCode` | 8-char recovery code |

---

## API Integration (uni-app)

### HTTP Client Pattern

uni-app uses `uni.request` with callbacks (NOT async/await):

```javascript
uni.request({
  url: `${API_BASE_URL}/api/endpoint`,
  method: 'POST',
  header: {
    'Content-Type': 'application/json',
    'X-Player-ID': this.playerId
  },
  data: { key: value },
  success: (res) => {
    if (res.statusCode === 200) {
      // Handle success
    } else {
      // Handle API error
    }
  },
  fail: (err) => {
    // Handle network error
  },
  complete: () => {
    // Cleanup (optional)
  }
});
```

### Base URL

```javascript
const API_BASE_URL = 'https://sgit-api.bdgamer.org';
```

---

## Motion Controls

### Accelerometer Logic

```javascript
// Z-axis thresholds
const CORRECT_THRESHOLD = -5;   // Tilt down (forward)
const PASS_THRESHOLD = 7;       // Tilt up (backward)
const RESET_MIN = -2;           // Neutral zone lower bound
const RESET_MAX = 5;            // Neutral zone upper bound

// State machine
isLocked = false  // Wait for neutral before next trigger

// On accelerometer change:
if (isLocked) {
  if (z > RESET_MIN && z < RESET_MAX) {
    isLocked = false;  // Reset when phone returns to neutral
  }
} else {
  if (z < CORRECT_THRESHOLD) triggerResult(true);   // Correct
  if (z > PASS_THRESHOLD) triggerResult(false);     // Pass
}
```

### Vibration Feedback

| Action | Pattern |
|--------|---------|
| Correct answer | `uni.vibrateShort()` |
| Wrong answer | `uni.vibrateShort()` |
| Game end | `uni.vibrateLong()` |

---

## Word Database

### Data Format (idioms.js)

```javascript
export default [
  { word: '一心一意', level: 'easy' },
  { word: '画龙点睛', level: 'medium' },
  // ... 300+ entries
];
```

### Loading Strategy

All words loaded at app start, shuffled for each game:

```javascript
fetchWords() {
  let allWords = [...idiomData];
  this.wordList = allWords.sort(() => Math.random() - 0.5);
}
```

---

## UI Design System

### Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Paper | `#f8f6f0` | Background |
| Grid | `rgba(200,200,200,0.3)` | Grid lines |
| Ink | `#333` | Primary text, borders |
| Accent | `#facc15` | Buttons, highlights |
| Sky | `#7dd3fc` | Energy pill |
| Muted | `#666`, `#999` | Secondary text |

### Typography

| Element | Size | Weight |
|---------|------|--------|
| Word display | 56px | Bold |
| Card title | 32px | Bold |
| Score result | 64px | 900 (black) |
| Body text | 14-16px | Normal |

### Components

#### Energy Pill
```
Position: absolute top-left
Background: #7dd3fc
Border: 2px solid #333
Border-radius: 25px
Shadow: 3px 3px 0 rgba(0,0,0,0.15)
```

#### Paper Card
```
Background: #fff
Border: 3px solid #333
Border-radius: 8px
Inner: 1px dashed rgba(0,0,0,0.2)
Transform: rotate(0.5deg) or (-0.5deg)
Shadow: 4px 4px 0 rgba(0,0,0,0.1)
```

#### Binder Clips
```
Position: absolute top (-12px)
Size: 14px × 28px
Color: #555
Detail: horizontal line at 50%
```

#### Sketch Button
```
Padding: 12px 28px
Border: 2px solid #333
Border-radius: 8px
Shadow: 3px 3px 0 rgba(0,0,0,0.1)
```

---

## Deployment

### Cloudflare Worker

**File**: `docs/worker-simple.js`

**Environment Variables**:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_ANON_KEY=your-anon-key
```

**Deployment**:
1. Create worker in Cloudflare dashboard
2. Paste code from `worker-simple.js`
3. Add environment variables in Settings → Variables
4. Deploy

### Supabase Setup

**File**: `docs/auth-setup.sql`

Run the SQL in Supabase SQL Editor to:
1. Create `players` table
2. Add `player_id` to `scores` table
3. Create indexes
4. Set up RLS policies
5. Create `generate_backup_code()` function

### Mobile App Build

**HBuilderX**:
1. Import project
2. Select platform (iOS/Android)
3. Configure manifest.json
4. Build → Run

---

## Security Considerations

### Current Design (Simple Auth)

- No passwords - anyone with backup code can recover
- X-Player-ID header is the only auth mechanism
- Suitable for low-stakes gaming

### Potential Improvements

1. **Rate limiting** on score submission
2. **Input validation** on player names (XSS prevention)
3. **HTTPS enforcement** (already enabled)
4. **Score validation** (prevent impossibly high scores)

---

## Error Handling

### Frontend

| Error | User Feedback |
|-------|---------------|
| Network failure | Toast: "网络错误" |
| Invalid backup code | Inline: "无效的备份码" |
| Missing name | Inline: "请输入名字" |
| Score submit fail | Inline: "上传失败" |

### Backend

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 400 | Bad request (missing fields) |
| 401 | Unauthorized (missing X-Player-ID) |
| 404 | Not found (invalid backup code) |
| 500 | Server error |

---

## Future Enhancements

### Short Term
- [ ] More word categories (movies, celebrities, etc.)
- [ ] Difficulty levels
- [ ] Sound effects
- [ ] Animation improvements

### Long Term
- [ ] Multiplayer mode
- [ ] Real-time leaderboard
- [ ] Social sharing
- [ ] In-app purchases for energy

---

## Files Reference

| File | Purpose |
|------|---------|
| `pages/index/index.vue` | Main game component (1084 lines) |
| `static/data/idioms.js` | Word database |
| `docs/design.md` | UI/UX specifications |
| `docs/SPEC.md` | This technical spec |
| `docs/auth-setup.sql` | Database schema |
| `docs/worker-simple.js` | Cloudflare Worker API |
| `docs/worker-auth.js` | Alternative JWT-based API (unused) |
| `manifest.json` | App configuration |
| `pages.json` | Page routing |

---

## Changelog

| Date | Change |
|------|--------|
| 2024-02-15 | Converted API calls from async/await to callbacks |
| 2024-02-15 | Fixed duplicate authMode declaration |
| 2024-02-15 | Initial complete implementation |
