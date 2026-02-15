# Component Specification

## Global Components

### EnergyPill

**Location**: Fixed top-left of Home and Setup screens

**Structure:**
```vue
<view class="energy-pill">
  <text class="icon-flash">⚡</text>
  <text class="energy-count">5</text>
  <view class="plus-btn">+</view>
</view>
```

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

**Location**: Fixed right side of Home screen

**Structure:**
```vue
<view class="right-menu">
  <view class="menu-icon" @click="showUserHistory">📋</view>
  <view class="menu-icon" @click="toggleSound">🔊</view>
  <view class="menu-icon" @click="openSettings">⚙️</view>
</view>
```

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

**Usage**: Modal dialogs (Setup, Result, History, Auth, Backup)

**Structure:**
```vue
<view class="paper-card [modifier]">
  <view class="clips">
    <view class="clip"></view>
    <view class="clip"></view>
  </view>
  <view class="card-content">
    <!-- Content here -->
  </view>
</view>
```

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

**Usage**: Primary and secondary actions

**Structure:**
```vue
<view class="sketch-btn [modifier]">Button Text</view>
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

## Screen-Specific Components

### AuthModal

**Status**: `gameStatus === 'auth'`

**States:**
- `authMode === 'register'`: Show registration form
- `authMode === 'recover'`: Show recovery form

**Register Form:**
```
Title: "新玩家"
Subtitle: "创建你的游戏档案"
Input Label: "你的名字:"
Input: text (placeholder: "输入昵称", maxLength: 12)
Hint: "保存好你的备份码，换设备时需要用到"
[Error/Success message]
Button: "创建账号"
Link: "已有备份码? 点击恢复"
```

**Recover Form:**
```
Title: "恢复账号"
Subtitle: "输入备份码恢复记录"
Input Label: "备份码:"
Input: text (placeholder: "如: ABC12345", maxLength: 8)
Hint: "输入之前保存的8位备份码"
[Error/Success message]
Button: "恢复记录"
Link: "新玩家? 创建账号"
```

---

### BackupCodeDisplay

**Status**: `gameStatus === 'backup'`

**Structure:**
```
Title: "保存备份码"
Subtitle: "换设备或重装时需要用到"
[Yellow box with backup code - monospace, 32px, letter-spacing: 4px]
Warning: "请截图保存或记住此代码!"
Button: "我已保存，开始游戏"
```

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

### CategoryScroll

**Status**: `gameStatus === 'home'`

**Structure:**
```
[Left Arrow ⟨]
[ScrollView horizontal]
  - Category Card (active): "成语"
  - Category Card (placeholder): "1"
  - Category Card (placeholder): "2"
[Right Arrow ⟩]
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

### SetupModal

**Status**: `gameStatus === 'setup'`

**Structure:**
```
Title: "成语"
Subtitle: "一人答题 · 一人描述"

[Time Selection]
Label: "选择游戏时间"
Options:
  ☐ 60s   ☑ 120s   ☐ 180s

Buttons:
  Primary: "开始游戏"
  Link: "Cancel"
```

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

**Status**: `gameStatus === 'playing'`

**Layout:**
```
[Header - absolute top]
  Left: "剩余 秒" + timeLeft
  Right: "答对数量" + score

[Center]
  Word Card (80% width, min 200px height)
    Text: currentWord (56px, bold, letter-spacing: 8px)

[Bottom Right - absolute]
  Quit Button: ✕
```

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

### ResultModal

**Status**: `gameStatus === 'result'`

**Structure:**
```
Title: "结算"

[Result Section]
Label: "答对总数:"
Value: [score] (64px, black weight)

[Status text - optional]
"上传中..." / "上传成功!" / "网络错误"

Buttons:
  "再来一局"
  "退出" (secondary)
  "上传分数" (primary)
```

---

### HistoryModal

**Status**: `gameStatus === 'history'`

**Structure:**
```
Title: "我的记录"
Subtitle: "最近 10 场游戏"

[Loading state]
"加载中..."

[History list - scroll-view]
#1  02-15 14:30    15分
#2  02-15 13:15    12分
...

[Empty state]
"暂无游戏记录"

Buttons:
  "刷新"
  "关闭" (link)
```

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
