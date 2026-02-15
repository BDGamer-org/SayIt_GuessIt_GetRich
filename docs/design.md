# 你说我猜马上发财 - UI Design Specification

Based on sketch: `7BAF0372-466B-4727-9E1F-FEA2E1C70CAA.png`

---

## 1. Design Philosophy

### Aesthetic
- **Style**: Hand-drawn sketch aesthetic
- **Feel**: Playful, casual, paper-based game UI
- **Visual Language**: Thick borders, slight rotations, dashed lines, binder clips
- **Background**: Grid paper (graph paper) texture throughout all screens

### Core Principles
1. Every element should feel like it was drawn by hand
2. Slight imperfections (rotation, offset) add charm
3. Consistent thick borders (2-3px) on all interactive elements
4. Drop shadows are hard/sharp, not blurred

---

## 2. Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-paper` | `#f8f6f0` | Main background (warm cream) |
| `--grid-line` | `rgba(200,200,200,0.3)` | Grid lines |
| `--ink-black` | `#333333` | All borders, primary text |
| `--card-white` | `#ffffff` | Cards, modals |
| `--energy-blue` | `#7dd3fc` | Energy pill background |
| `--button-yellow` | `#facc15` | Primary action buttons |
| `--secondary-gray` | `#f3f4f6` | Secondary buttons |
| `--text-muted` | `#666666` | Secondary text, labels |
| `--text-light` | `#999999` | Disabled, hints |
| `--accent-orange` | `#f97316` | Active/selected states |

---

## 3. Typography

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Card Title | System | 36px | Bold | `--ink-black` |
| Modal Title | System | 32px | Bold | `--ink-black` |
| Score Number | System | 72px | 900 (Black) | `--ink-black` |
| Button Text | System | 18px | Bold | `--ink-black` |
| Info Value | System | 32px | Bold | `--ink-black` |
| Word Display | System | 56px | Bold | `--ink-black` |
| Label Text | System | 14px | Regular | `--text-muted` |
| Energy Number | System | 20px | Bold | White + stroke |

### Special Typography
- **Energy Count**: White text with `-webkit-text-stroke: 1px #333` for outline effect
- **Word Display**: `letter-spacing: 8px` for Chinese characters

---

## 4. Spacing & Sizing

### Border Radius Scale
| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 8px | Buttons, small elements |
| `radius-md` | 12px | Category cards |
| `radius-lg` | 16px | Word display card |
| `radius-xl` | 25px | Energy pill (pill shape) |
| `radius-full` | 50% | Circular icons |

### Border Width
- Standard: `2px solid #333`
- Thick: `3px solid #333` (cards, modals)

### Shadows
- Standard: `box-shadow: 3px 3px 0 rgba(0,0,0,0.1)`
- Medium: `box-shadow: 4px 4px 0 rgba(0,0,0,0.1)`
- Heavy: `box-shadow: 6px 6px 0 rgba(0,0,0,0.08)`

### Spacing Scale
| Token | Value |
|-------|-------|
| `space-xs` | 4px |
| `space-sm` | 6px |
| `space-md` | 12px |
| `space-lg` | 20px |
| `space-xl` | 30px |
| `space-2xl` | 40px |

---

## 5. Global Components

### 5.1 Grid Background
Applied to all screens:
```css
background-color: #f8f6f0;
background-image:
  linear-gradient(rgba(200,200,200,0.3) 1px, transparent 1px),
  linear-gradient(90deg, rgba(200,200,200,0.3) 1px, transparent 1px);
background-size: 20px 20px;
```

### 5.2 Energy Pill
**Position**: Absolute, top: 20px, left: 20px

**Structure:**
```
[⚡] [5] [+]
```

**Specs:**
- Background: `--energy-blue`
- Border: 2px solid #333
- Border-radius: 25px (pill)
- Padding: 6px 12px
- Shadow: 3px 3px 0 rgba(0,0,0,0.15)
- Z-index: 10

**Elements:**
- Lightning icon: 18px
- Number "5": 20px, bold, white with black outline
- Plus button: 22px circle, black bg, white text

**Visibility**: Home screen, Setup modal only

### 5.3 Right-Side Icon Menu
**Position**: Absolute, right: 20px, top: 50% (centered vertically)

**Structure:**
```
[🔊]
[⚙️]
[⤴️]
```

**Specs per icon:**
- Size: 44px × 44px
- Background: white
- Border: 2px solid #333
- Border-radius: 50%
- Shadow: 2px 2px 0 rgba(0,0,0,0.1)
- Gap between icons: 12px
- Icon size: 20px

**Icons (top to bottom):**
1. 🔊 Sound toggle
2. ⚙️ Settings
3. ⤴️ Share

**Visibility**: Home screen only

### 5.4 Paper Card (Modal Base)
The signature component for modals.

**Specs:**
- Width: 420px (max-width: 85%)
- Background: white
- Border: 3px solid #333
- Border-radius: 8px
- Shadow: 4px 4px 0 rgba(0,0,0,0.1)
- Transform: rotate(0.5deg) or rotate(-0.5deg) for variety

**Inner Dashed Border:**
```css
/* Pseudo-element ::before */
position: absolute;
top: 5px; left: 5px; right: 5px; bottom: 5px;
border: 1px dashed rgba(0,0,0,0.2);
border-radius: 4px;
```

**Binder Clips:**
- Position: Absolute, top: -12px, centered horizontally
- Two clips with 80px gap
- Size: 14px × 28px
- Background: #555
- Border: 2px solid #333
- Border-radius: 8px
- Horizontal line through middle (::after)

### 5.5 Sketch Button
**Primary (Yellow):**
- Background: `--button-yellow`
- Border: 2px solid #333
- Border-radius: 8px
- Padding: 12px 40px
- Shadow: 3px 3px 0 rgba(0,0,0,0.1)
- Font: 18px bold

**Secondary (Gray):**
- Background: `--secondary-gray`
- Same specs as primary

**Cancel Link:**
- Color: #999
- Underlined
- Font: 14px

### 5.6 Category Card
**Specs:**
- Width: 140px
- Height: 100px
- Background: white
- Border: 3px solid #333
- Border-radius: 12px
- Shadow: 4px 4px 0 rgba(0,0,0,0.1)
- Transform: rotate(-1deg)

**States:**
- **Active**: Background #fff9e6, rotation -2deg
- **Placeholder**: Border-style: dashed, opacity: 0.6

---

## 6. Screen Specifications

### 6.1 Home Screen

**Layout:**
- Full screen with grid background
- Energy pill (top-left)
- Right menu (right, vertically centered)
- Category scroll (center)

**Category Scroll Area:**
- Container: max-width 600px, centered
- Horizontal scroll with hidden scrollbar
- Left/Right arrows: ⟨ ⟩ (28px, monospace, #999)
- Card gap: 20px

**Cards:**
- Active: 成语 (solid border)
- Placeholders: 1, 2 (dashed border)

**Interactions:**
- Tap card → Open Setup Modal
- Scroll horizontally to see more categories

### 6.2 Setup Modal

**Trigger:** Tap category card on Home
**Overlay:** Semi-transparent paper color (rgba(248,246,240,0.85))

**Card Content:**
```
[Binder Clips]

    成语
一人答题 · 一人描述

选择游戏时间
☑ 60s  ☐ 120s  ☐ 180s

[开始游戏]
Cancel
```

**Time Selection:**
- Horizontal row, centered
- Gap: 25px between options
- Checkbox: ☑ or ☐ (18px)
- Active: Orange color (#f97316), bold
- Inactive: Gray color (#666)

**Buttons:**
- Primary: "开始游戏" (yellow)
- Cancel: "Cancel" (text link)

### 6.3 Game Screen

**Layout:**
- Full screen, no side menus
- Top info bar (absolute, top: 20px)
- Center: Large word card
- Bottom-right: Quit button

**Top Info Bar:**
```
剩余 __ 秒          答对数量
{timeLeft}          {score}
```
- Full width with 40px horizontal padding
- Labels: 14px, #666
- Values: 32px, bold, #333

**Word Card:**
- Width: 80% (max 500px)
- Min-height: 200px
- Background: white
- Border: 3px solid #333
- Border-radius: 16px
- Shadow: 6px 6px 0 rgba(0,0,0,0.08)
- Transform: rotate(-0.5deg)

**Word Text:**
- Size: 56px
- Bold
- Letter-spacing: 8px
- Color: #333

**Quit Button:**
- Position: bottom: 30px, right: 30px
- Size: 40px circle
- Background: rgba(255,255,255,0.8)
- Border: 2px solid #333
- Text: ✕ (18px, #666)

### 6.4 Result Modal

**Trigger:** Timer reaches 0
**Uses:** Paper Card component with negative rotation (-0.5deg)

**Card Content:**
```
[Binder Clips]

    结算

答对总数:
   {score}

[再来一局] [退出]
```

**Score Display:**
- Label: "答对总数:", 18px, #666
- Value: 72px, 900 weight, #333

**Buttons:**
- "再来一局" - Secondary style
- "退出" - Secondary style
- Gap: 20px

---

## 7. Interactions & Behaviors

### 7.1 Screen Flow
```
Home → Setup → Game → Result
       ↓        ↓
      Cancel  Quit → Home
```

### 7.2 Motion Controls (Game Screen Only)
Using accelerometer Z-axis:

| Action | Z Value | Result |
|--------|---------|--------|
| Face Down | z < -5 | Correct answer (+1 score) |
| Face Up | z > 7 | Skip word |
| Neutral | -2 < z < 5 | Ready for next |

**Lock Mechanism:**
- After action detected, lock for 800ms
- Unlock when phone returns to neutral position

### 7.3 Tap/Click Targets

| Element | Action |
|---------|--------|
| Category Card | Open Setup modal |
| Time Option | Select duration |
| 开始游戏 | Start game with selected time |
| Cancel | Return to Home |
| Quit (✕) | End game, return to Home |
| 再来一局 | Restart with same duration |
| 退出 | Return to Home |
| Menu Icons | Show toast (not implemented) |
| Energy + | Show toast (not implemented) |

### 7.4 Haptic Feedback
- Correct answer: Short vibration
- Skip: Short vibration
- Game end: Long vibration

---

## 8. Content/Copy

### 8.1 Static Text

**Home Screen:**
- Category: "成语"
- Placeholders: "1", "2"
- Arrows: "⟨", "⟩"

**Setup Modal:**
- Title: "成语"
- Subtitle: "一人答题 · 一人描述"
- Label: "选择游戏时间"
- Time options: "60s", "120s", "180s"
- Button: "开始游戏"
- Cancel: "Cancel"

**Game Screen:**
- Timer label: "剩余 __ 秒"
- Score label: "答对数量"
- Quit: "✕"

**Result Modal:**
- Title: "结算"
- Label: "答对总数:"
- Buttons: "再来一局", "退出"

### 8.2 Dynamic Content

| Variable | Source | Display |
|----------|--------|---------|
| {timeLeft} | Timer countdown | Integer (60, 59, 58...) |
| {score} | Correct answers count | Integer |
| {currentWord} | Random from word list | Chinese characters |

---

## 9. Assets & Icons

### 9.1 Emoji Icons Used
| Icon | Usage |
|------|-------|
| ⚡ | Energy icon |
| 🔊 | Sound toggle |
| ⚙️ | Settings |
| ⤴️ | Share |
| ✕ | Quit/Close |
| ☑ | Checked checkbox |
| ☐ | Unchecked checkbox |

### 9.2 Custom Graphics Needed
None - all UI is CSS-based shapes

---

## 10. Responsive Considerations

### Breakpoints
| Range | Adjustments |
|-------|-------------|
| < 480px | Reduce card sizes, smaller fonts |
| 480px - 768px | Default (mobile landscape) |
| > 768px | Center content, max-width containers |

### Key Constraints
- Paper card max-width: 85%
- Word card max-width: 500px
- All screens designed for landscape orientation

---

## 11. Implementation Notes

### CSS Custom Properties
Recommended to define as CSS variables for consistency:
```css
:root {
  --color-bg: #f8f6f0;
  --color-ink: #333333;
  --color-energy: #7dd3fc;
  --color-primary: #facc15;
  --border-standard: 2px solid #333;
  --border-thick: 3px solid #333;
  --shadow-standard: 3px 3px 0 rgba(0,0,0,0.1);
}
```

### Rotation Values
- Card hover/active: -2deg
- Standard card: -1deg
- Paper modal: 0.5deg or -0.5deg
- Word card: -0.5deg

### Z-Index Stack
| Element | Z-Index |
|---------|---------|
| Grid background | 0 |
| Content | 1-5 |
| Energy pill | 10 |
| Right menu | 10 |
| Modal overlay | 50 |
| Paper card | 51 |
| Binder clips | 52 |
