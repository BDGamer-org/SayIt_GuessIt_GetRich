# Component Specification

## Component Overview

All components are Vue 3 single-file components (SFC) using uni-app.

### Directory Structure
```
components/
├── PaperCard.vue          # Reusable card component
├── SketchButton.vue       # Button component
├── EnergyPill.vue         # Energy indicator
├── RightMenu.vue          # Side menu
└── screens/               # Screen components
    ├── AuthScreen.vue
    ├── BackupScreen.vue
    ├── HomeScreen.vue
    ├── SetupScreen.vue
    ├── GameScreen.vue
    ├── ResultScreen.vue
    └── HistoryScreen.vue
```

---

## Global Components

### EnergyPill

**File**: `components/EnergyPill.vue`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | Number | 5 | Energy count to display |

**Events:**
| Event | Description |
|-------|-------------|
| `add` | Clicked on plus button |

**Usage:**
```vue
<EnergyPill :count="5" @add="handleAddEnergy" />
```

**Location**: Fixed top-left of Home and Setup screens

**Styling:**
| Property | Value |
|----------|-------|
| Position | absolute |
| Top | 20px |
| Left | 40px |
| Background | #7dd3fc |
| Border | 2px solid #333 |
| Border-radius | 25px |
| Padding | 6px 12px |
| Box-shadow | 3px 3px 0 rgba(0,0,0,0.15) |
| Z-index | 10 |

**Elements:**
- ⚡ Flash icon (18px)
- Count number (20px, bold, white with text-stroke)
- Plus button (22px circle, dark background)

**Behavior:**
- Static display (not functional yet)
- Plus button is decorative

---

### RightMenu

**File**: `components/RightMenu.vue`

**Events:**
| Event | Description |
|-------|-------------|
| `history` | History icon clicked |
| `sound` | Sound icon clicked |
| `settings` | Settings icon clicked |

**Usage:**
```vue
<RightMenu @history="showUserHistory" @sound="toggleSound" @settings="openSettings" />
```

**Location**: Fixed right side of Home screen

**Styling:**
| Property | Value |
|----------|-------|
| Position | absolute |
| Right | 20px |
| Bottom | 20px |
| Display | flex, column |
| Gap | 12px |
| Z-index | 10 |

**Icon Styling:**
| Property | Value |
|----------|-------|
| Size | 44px × 44px |
| Background | #fff |
| Border | 2px solid #333 |
| Border-radius | 50% |
| Font-size | 20px |
| Box-shadow | 2px 2px 0 rgba(0,0,0,0.1) |

**Icons:**
- 📋 History/records
- 🔊 Sound toggle
- ⚙️ Settings

---

### PaperCard

**File**: `components/PaperCard.vue`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modifier` | String | '' | Style modifier: '', 'result', 'history', 'auth', 'backup' |

**Slots:**
| Slot | Description |
|------|-------------|
| `default` | Card content |

**Usage:**
```vue
<PaperCard modifier="result">
  <text class="card-main-title">结算</text>
  <!-- ... -->
</PaperCard>
```

**Modifiers:**
| Modifier | Transform |
|----------|-----------|
| (none) | rotate(0.5deg) |
| `result` | rotate(-0.5deg) |
| `history`, `auth`, `backup` | rotate(0.3deg), max-height: 85% |

**Base Styling:**
| Property | Value |
|----------|-------|
| Width | 420px (max 85%) |
| Background | #fff |
| Border | 3px solid #333 |
| Border-radius | 8px |
| Box-shadow | 4px 4px 0 rgba(0,0,0,0.1), inset shadow |
| Position | relative |

**Modifiers:**
| Modifier | Transform |
|----------|-----------|
| `.result` | rotate(-0.5deg) |
| `.history`, `.auth`, `.backup` | rotate(0.3deg), max-height: 85% |
| (default) | rotate(0.5deg) |

**Inner Border (Pseudo-element):**
```css
.paper-card::before {
  content: '';
  position: absolute;
  top: 5px; left: 5px; right: 5px; bottom: 5px;
  border: 1px dashed rgba(0,0,0,0.2);
  border-radius: 4px;
  pointer-events: none;
}
```

**Binder Clips:**
| Property | Value |
|----------|-------|
| Position | absolute, top: -12px |
| Layout | flex, center, gap: 80px |
| Clip size | 14px × 28px |
| Clip color | #555 |
| Clip border | 2px solid #333 |
| Clip radius | 8px |
| Detail | Horizontal line at 50% height |

**Card Content:**
| Property | Value |
|----------|-------|
| Padding | 40px 30px 30px |
| Display | flex, column |
| Align | center |

---

### SketchButton

**File**: `components/SketchButton.vue`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | String | '' | Button style: '', 'primary', 'secondary' |

**Events:**
| Event | Description |
|-------|-------------|
| `click` | Button clicked |

**Slots:**
| Slot | Description |
|------|-------------|
| `default` | Button text |

**Usage:**
```vue
<SketchButton type="primary" @click="startGame">开始游戏</SketchButton>
<SketchButton type="secondary" @click="cancel">退出</SketchButton>
<SketchButton @click="restart">再来一局</SketchButton>
```

**Base Styling:**
| Property | Value |
|----------|-------|
| Padding | 12px 28px |
| Background | #fff |
| Border | 2px solid #333 |
| Border-radius | 8px |
| Font-size | 16px |
| Font-weight | bold |
| Box-shadow | 3px 3px 0 rgba(0,0,0,0.1) |

**Modifiers:**
| Modifier | Background |
|----------|------------|
| `.primary` | #facc15 (yellow) |
| `.secondary` | #f3f4f6 (gray) |
| (default) | #fff (white) |

---

## Screen Components

### AuthScreen

**File**: `components/screens/AuthScreen.vue`

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `isRegister` | Boolean | true = register mode, false = recover mode |
| `tempName` | String | v-model for name input (register mode) |
| `backupCodeInput` | String | v-model for backup code input (recover mode) |
| `error` | String | Error message to display |
| `success` | String | Success message to display |

**Events:**
| Event | Description |
|-------|-------------|
| `update:tempName` | Name input changed |
| `update:backupCodeInput` | Backup code input changed |
| `submit` | Submit button clicked |
| `switch` | Switch mode link clicked |

**Used In**: `gameStatus === 'auth'`

---

### BackupScreen

**File**: `components/screens/BackupScreen.vue`

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `backupCode` | String | The backup code to display |

**Events:**
| Event | Description |
|-------|-------------|
| `continue` | Continue button clicked |

**Used In**: `gameStatus === 'backup'`

**Backup Code Styling:**
| Property | Value |
|----------|-------|
| Background | #facc15 |
| Padding | 20px 40px |
| Border | 3px solid #333 |
| Border-radius | 8px |
| Font | monospace, 32px, bold |
| Letter-spacing | 4px |

---

### HomeScreen

**File**: `components/screens/HomeScreen.vue`

**Events:**
| Event | Description |
|-------|-------------|
| `select` | Category selected (emits category type) |
| `showHistory` | History icon clicked |
| `toggleSound` | Sound icon clicked |
| `openSettings` | Settings icon clicked |
| `addEnergy` | Add energy button clicked |

**Used In**: `gameStatus === 'home'`

**Structure:**
```
[EnergyPill]
[RightMenu]
[Category Scroll]
  - Left Arrow ⟨
  - Category Card (active): "成语"
  - Category Card (placeholder): "1", "2"
  - Right Arrow ⟩
```

**Active Card Styling:**
| Property | Value |
|----------|-------|
| Size | 200px × 140px |
| Background | #fff9e6 (light yellow) |
| Border | 3px solid #333 |
| Border-radius | 16px |
| Transform | rotate(-2deg) |
| Shadow | 4px 4px 0 rgba(0,0,0,0.1) |

**Placeholder Card:**
| Property | Value |
|----------|-------|
| Border-style | dashed |
| Opacity | 0.6 |
| Transform | rotate(-1deg) |

**Title Text:**
| Property | Value |
|----------|-------|
| Font-size | 48px |
| Font-weight | bold |
| Text-align | center |

---

### SetupScreen

**File**: `components/screens/SetupScreen.vue`

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `selectedTime` | Number | v-model for selected time (60, 120, 180) |

**Events:**
| Event | Description |
|-------|-------------|
| `update:selectedTime` | Time selection changed |
| `start` | Start game button clicked |
| `cancel` | Cancel link clicked |

**Used In**: `gameStatus === 'setup'`

**Time Item Styling:**
| State | Style |
|-------|-------|
| Default | color: #666 |
| Active | color: #f97316, font-weight: bold |

**Checkbox:**
- ☐ (unchecked): `checkbox` class, font-size: 18px
- ☑ (checked): Same, selected time

---

### GameScreen

**File**: `components/screens/GameScreen.vue`

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `timeLeft` | Number | Seconds remaining |
| `score` | Number | Current score |
| `currentWord` | String | Current word to display |

**Events:**
| Event | Description |
|-------|-------------|
| `quit` | Quit button clicked |

**Used In**: `gameStatus === 'playing'`

**Header Styling:**
| Property | Value |
|----------|-------|
| Position | absolute, top: 20px |
| Left/Right | 40px |
| Display | flex, space-between |

**Info Label:**
| Property | Value |
|----------|-------|
| Font-size | 14px |
| Color | #666 |
| Display | block |

**Info Value:**
| Property | Value |
|----------|-------|
| Font-size | 32px |
| Font-weight | bold |
| Color | #333 |

**Word Card:**
| Property | Value |
|----------|-------|
| Width | 80% (max 500px) |
| Min-height | 200px |
| Background | #fff |
| Border | 3px solid #333 |
| Border-radius | 16px |
| Transform | rotate(-0.5deg) |
| Shadow | 6px 6px 0 rgba(0,0,0,0.08) |

**Quit Button:**
| Property | Value |
|----------|-------|
| Position | absolute, bottom: 30px, right: 30px |
| Size | 40px × 40px |
| Background | rgba(255,255,255,0.8) |
| Border | 2px solid #333 |
| Border-radius | 50% |
| Font-size | 18px |
| Color | #666 |

---

### ResultScreen

**File**: `components/screens/ResultScreen.vue`

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `score` | Number | Final score to display |
| `submitStatus` | String | Upload status message |

**Events:**
| Event | Description |
|-------|-------------|
| `restart` | Play again button clicked |
| `home` | Exit button clicked |
| `submit` | Submit score button clicked |

**Used In**: `gameStatus === 'result'`

---

### HistoryScreen

**File**: `components/screens/HistoryScreen.vue`

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `history` | Array | List of score records |
| `loading` | Boolean | Loading state |

**Events:**
| Event | Description |
|-------|-------------|
| `refresh` | Refresh button clicked |
| `close` | Close link clicked |

**Methods:**
| Method | Description |
|--------|-------------|
| `formatDate(dateString)` | Formats ISO date to "MM-DD HH:mm" |

**Used In**: `gameStatus === 'history'`

---

## Component Relationships

```
index.vue (orchestrator)
├── AuthScreen (auth)
├── BackupScreen (backup)
├── HomeScreen (home)
│   ├── EnergyPill
│   └── RightMenu
├── SetupScreen (setup)
│   └── PaperCard
│       └── SketchButton
├── GameScreen (playing)
├── ResultScreen (result)
│   └── PaperCard
│       └── SketchButton
└── HistoryScreen (history)
    └── PaperCard
        └── SketchButton
```

**Reusable Components:**
- `PaperCard` - Used by: AuthScreen, BackupScreen, SetupScreen, ResultScreen, HistoryScreen
- `SketchButton` - Used by: AuthScreen, BackupScreen, SetupScreen, ResultScreen, HistoryScreen
- `EnergyPill` - Used by: HomeScreen
- `RightMenu` - Used by: HomeScreen

**History Item:**
| Property | Value |
|----------|-------|
| Display | flex |
| Padding | 10px 15px |
| Border-bottom | 1px dashed rgba(0,0,0,0.1) |

**Columns:**
| Column | Width | Style |
|--------|-------|-------|
| # | 30px | 16px, bold, #666 |
| Date | flex: 1 | 14px, #999, center |
| Score | 60px | 18px, bold, #333, right |

---

## Layout Specifications

### Z-Index Layers

| Element | Z-Index |
|---------|---------|
| Grid background | 0 |
| Screen content | 1 |
| Energy pill | 10 |
| Right menu | 10 |
| Modal overlay | 50 |

### Responsive Breakpoints

The app is designed for mobile portrait orientation:
- Target width: 375px - 428px
- Modal max-width: 85% (420px cap)

### Safe Areas

| Side | Padding |
|------|---------|
| Left | 20px - 40px |
| Right | 20px - 40px |
| Top | 20px |
| Bottom | 20px - 30px |

---

## Animation Specifications

### Screen Transitions

Current implementation uses immediate switching via `v-if`:
- No transition animations defined
- Future: Could add fade/slide transitions

### Motion Feedback

| Action | Feedback |
|--------|----------|
| Correct answer | Vibrate short + next word |
| Wrong answer | Vibrate short + next word |
| Game end | Vibrate long |
| Button press | None (visual feedback only) |

---

## Form Specifications

### Input Fields

**Name Input:**
| Property | Value |
|----------|-------|
| Width | 80% (max 220px) |
| Padding | 12px 15px |
| Border | 2px solid #333 |
| Border-radius | 8px |
| Font-size | 16px |
| Text-align | center |

**Backup Code Input:**
Additional styles:
| Property | Value |
|----------|-------|
| Font-family | monospace |
| Font-size | 18px |
| Letter-spacing | 2px |
| Max-length | 8 |

### Validation Messages

| Type | Color | Usage |
|------|-------|-------|
| Error | #dc2626 (red) | Validation failures |
| Success | #16a34a (green) | Successful operations |
| Hint | #999 (gray) | Helper text |
| Warning | #ea580c (orange) | Important notices |

---

## Color Reference

### Primary Colors
```css
--color-paper: #f8f6f0;
--color-ink: #333;
--color-accent: #facc15;
--color-sky: #7dd3fc;
```

### Neutral Colors
```css
--color-white: #fff;
--color-gray-100: #f3f4f6;
--color-gray-400: #999;
--color-gray-600: #666;
--color-gray-800: #333;
```

### Semantic Colors
```css
--color-success: #16a34a;
--color-error: #dc2626;
--color-warning: #ea580c;
--color-info: #7dd3fc;
```
