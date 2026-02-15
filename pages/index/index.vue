<template>
  <view class="container">

    <!-- ENERGY PILL (Home & Setup) -->
    <view v-if="gameStatus === 'home' || gameStatus === 'setup'" class="energy-pill">
      <text class="icon-flash">⚡</text>
      <text class="energy-count">5</text>
      <view class="plus-btn">+</view>
    </view>

    <!-- RIGHT SIDE MENU (Home only) -->
    <view v-if="gameStatus === 'home'" class="right-menu">
      <view class="menu-icon" @click="toggleSound">🔊</view>
      <view class="menu-icon" @click="openSettings">⚙️</view>
      <view class="menu-icon" @click="share">⤴️</view>
    </view>

    <!-- === HOME SCREEN === -->
    <view v-if="gameStatus === 'home'" class="home-screen">
      <view class="scroll-area">
        <text class="arrow left">⟨</text>
        <scroll-view class="category-scroll" scroll-x="true" show-scrollbar="false">
          <view class="card-container">
            <!-- Active Category -->
            <view class="category-card active" @click="selectCategory('idiom')">
              <view class="card-sketch">
                <text class="card-title">成语</text>
              </view>
            </view>
            <!-- Placeholder 1 -->
            <view class="category-card placeholder">
              <view class="card-sketch dashed">
                <text class="card-title">1</text>
              </view>
            </view>
            <!-- Placeholder 2 -->
            <view class="category-card placeholder">
              <view class="card-sketch dashed">
                <text class="card-title">2</text>
              </view>
            </view>
          </view>
        </scroll-view>
        <text class="arrow right">⟩</text>
      </view>
    </view>

    <!-- === SETUP MODAL === -->
    <view v-if="gameStatus === 'setup'" class="modal-overlay">
      <view class="paper-card">
        <!-- Binder clips -->
        <view class="clips">
          <view class="clip"></view>
          <view class="clip"></view>
        </view>

        <view class="card-content">
          <text class="card-main-title">成语</text>
          <text class="card-subtitle">一人答题 · 一人描述</text>

          <view class="time-section">
            <text class="time-label">选择游戏时间</text>
            <view class="time-options">
              <view class="time-item" :class="{active: selectedTime===60}" @click="selectedTime=60">
                <view class="checkbox">{{ selectedTime===60 ? '☑' : '☐' }}</view>
                <text>60s</text>
              </view>
              <view class="time-item" :class="{active: selectedTime===120}" @click="selectedTime=120">
                <view class="checkbox">{{ selectedTime===120 ? '☑' : '☐' }}</view>
                <text>120s</text>
              </view>
              <view class="time-item" :class="{active: selectedTime===180}" @click="selectedTime=180">
                <view class="checkbox">{{ selectedTime===180 ? '☑' : '☐' }}</view>
                <text>180s</text>
              </view>
            </view>
          </view>

          <view class="card-buttons">
            <view class="sketch-btn primary" @click="startGame(selectedTime)">开始游戏</view>
            <view class="cancel-link" @click="gameStatus='home'">Cancel</view>
          </view>
        </view>
      </view>
    </view>

    <!-- === GAME SCREEN === -->
    <view v-if="gameStatus === 'playing'" class="game-screen">
      <!-- Top Info Bar -->
      <view class="game-header">
        <view class="info-item">
          <text class="info-label">剩余 秒</text>
          <text class="info-value">{{ timeLeft }}</text>
        </view>
        <view class="info-item right">
          <text class="info-label">答对数量</text>
          <text class="info-value">{{ score }}</text>
        </view>
      </view>

      <!-- Main Word Card -->
      <view class="word-card">
        <text class="word-text">{{ currentWord }}</text>
      </view>

      <!-- Quit button -->
      <view class="quit-btn" @click="quitGame">✕</view>
    </view>

    <!-- === RESULT MODAL === -->
    <view v-if="gameStatus === 'result'" class="modal-overlay">
      <view class="paper-card result">
        <!-- Binder clips -->
        <view class="clips">
          <view class="clip"></view>
          <view class="clip"></view>
        </view>

        <view class="card-content">
          <text class="card-main-title">结算</text>

          <view class="result-section">
            <text class="result-label">答对总数:</text>
            <text class="result-value">{{ score }}</text>
          </view>

          <view class="result-buttons">
            <view class="sketch-btn" @click="restartGame">再来一局</view>
            <view class="sketch-btn secondary" @click="gameStatus='home'">退出</view>
          </view>
        </view>
      </view>
    </view>

  </view>
</template>

<script>
  import idiomData from '@/static/data/idioms.js';

  export default {
    data() {
      return {
        gameStatus: 'home',
        score: 0,
        timeLeft: 60,
        selectedTime: 120,
        lastTime: 120,
        currentWord: '准备',
        wordList: [],
        isLocked: false,
        timerInterval: null
      }
    },
    onUnload() {
      this.stopAll();
    },
    methods: {
      toggleSound() {
        uni.showToast({ title: '声音开关', icon: 'none' });
      },
      openSettings() {
        uni.showToast({ title: '设置', icon: 'none' });
      },
      share() {
        uni.showToast({ title: '分享', icon: 'none' });
      },
      selectCategory(type) {
        if (type === 'idiom') {
          this.gameStatus = 'setup';
        }
      },
      async startGame(time) {
        this.lastTime = time;
        this.timeLeft = time;
        this.score = 0;
        this.gameStatus = 'playing';
        this.isLocked = false;

        await this.fetchWords();
        this.nextWord();
        this.startTimer();
        this.startMotion();
      },
      quitGame() {
        this.stopAll();
        this.gameStatus = 'home';
      },
      restartGame() {
        this.startGame(this.lastTime);
      },
      stopAll() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (uni.stopAccelerometer) {
          uni.stopAccelerometer();
        }
      },
      endGame() {
        this.stopAll();
        this.$nextTick(() => {
          this.gameStatus = 'result';
        });
        uni.vibrateLong();
      },
      async fetchWords() {
        let allWords = [...idiomData];
        this.wordList = allWords.sort(() => Math.random() - 0.5);
      },
      nextWord() {
        if (this.wordList.length === 0) {
          this.endGame();
          return;
        }
        const w = this.wordList.pop();
        this.currentWord = w.word || w.w;
      },
      startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
          this.timeLeft--;
          if (this.timeLeft <= 0) {
            this.endGame();
          }
        }, 1000);
      },
      startMotion() {
        if (uni.stopAccelerometer) uni.stopAccelerometer();

        uni.startAccelerometer({
          interval: 'game',
          success: () => {
            uni.onAccelerometerChange((res) => {
              this.handleAccelerometer(res);
            });
          },
          fail: (err) => {
            console.error('Failed to start accelerometer', err);
          }
        });
      },
      handleAccelerometer(res) {
        if (this.gameStatus !== 'playing') return;
        const z = res.z;

        if (this.isLocked) {
          if (z > -2 && z < 5) {
            this.isLocked = false;
          }
          return;
        }

        // Face Down: Correct (z < -5)
        if (z < -5) {
          this.triggerResult(true);
        }
        // Face Up: Skip (z > 7)
        else if (z > 7) {
          this.triggerResult(false);
        }
      },
      triggerResult(isCorrect) {
        this.isLocked = true;
        uni.vibrateShort();

        if (isCorrect) {
          this.score++;
        }

        setTimeout(() => {
          this.nextWord();
        }, 800);
      }
    }
  }
</script>

<style>
  /* === Grid Background === */
  .container {
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow: hidden;
    background-color: #f8f6f0;
    background-image:
      linear-gradient(rgba(200, 200, 200, 0.3) 1px, transparent 1px),
      linear-gradient(90deg, rgba(200, 200, 200, 0.3) 1px, transparent 1px);
    background-size: 20px 20px;
  }

  /* === Energy Pill === */
  .energy-pill {
    position: absolute;
    top: 20px;
    left: 20px;
    display: flex;
    align-items: center;
    background: #7dd3fc;
    border: 2px solid #333;
    border-radius: 25px;
    padding: 6px 12px;
    box-shadow: 3px 3px 0 rgba(0,0,0,0.15);
    z-index: 10;
  }
  .icon-flash {
    font-size: 18px;
    margin-right: 4px;
  }
  .energy-count {
    font-size: 20px;
    font-weight: bold;
    color: #fff;
    -webkit-text-stroke: 1px #333;
    margin-right: 10px;
  }
  .plus-btn {
    width: 22px;
    height: 22px;
    background: #333;
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: bold;
  }

  /* === Right Menu === */
  .right-menu {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 12px;
    z-index: 10;
  }
  .menu-icon {
    width: 44px;
    height: 44px;
    background: #fff;
    border: 2px solid #333;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    box-shadow: 2px 2px 0 rgba(0,0,0,0.1);
  }

  /* === Home Screen === */
  .home-screen {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 60px;
  }
  .scroll-area {
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 600px;
  }
  .arrow {
    font-size: 28px;
    color: #999;
    padding: 0 15px;
    font-family: monospace;
  }
  .category-scroll {
    flex: 1;
    white-space: nowrap;
  }
  .card-container {
    display: flex;
    gap: 20px;
    padding: 10px 0;
  }
  .category-card {
    display: inline-block;
  }
  .card-sketch {
    width: 140px;
    height: 100px;
    background: #fff;
    border: 3px solid #333;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 4px 4px 0 rgba(0,0,0,0.1);
    transform: rotate(-1deg);
  }
  .card-sketch.dashed {
    border-style: dashed;
    opacity: 0.6;
  }
  .category-card.active .card-sketch {
    background: #fff9e6;
    transform: rotate(-2deg);
  }
  .card-title {
    font-size: 36px;
    font-weight: bold;
    color: #333;
  }

  /* === Modal Overlay === */
  .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(248, 246, 240, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
  }

  /* === Paper Card (Sketch Style) === */
  .paper-card {
    width: 420px;
    max-width: 85%;
    background: #fff;
    border: 3px solid #333;
    border-radius: 8px;
    position: relative;
    box-shadow:
      4px 4px 0 rgba(0,0,0,0.1),
      inset 0 0 40px rgba(0,0,0,0.02);
    transform: rotate(0.5deg);
  }
  .paper-card::before {
    content: '';
    position: absolute;
    top: 5px;
    left: 5px;
    right: 5px;
    bottom: 5px;
    border: 1px dashed rgba(0,0,0,0.2);
    border-radius: 4px;
    pointer-events: none;
  }
  .paper-card.result {
    transform: rotate(-0.5deg);
  }

  /* Binder Clips */
  .clips {
    position: absolute;
    top: -12px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 80px;
  }
  .clip {
    width: 14px;
    height: 28px;
    background: #555;
    border-radius: 8px;
    border: 2px solid #333;
    position: relative;
  }
  .clip::after {
    content: '';
    position: absolute;
    top: 50%;
    left: -2px;
    right: -2px;
    height: 2px;
    background: #333;
  }

  .card-content {
    padding: 40px 30px 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .card-main-title {
    font-size: 32px;
    font-weight: bold;
    color: #333;
    margin-bottom: 8px;
  }
  .card-subtitle {
    font-size: 14px;
    color: #666;
    margin-bottom: 30px;
  }

  /* === Time Selection === */
  .time-section {
    width: 100%;
    margin-bottom: 30px;
  }
  .time-label {
    display: block;
    text-align: center;
    font-size: 14px;
    color: #666;
    margin-bottom: 15px;
  }
  .time-options {
    display: flex;
    justify-content: center;
    gap: 25px;
  }
  .time-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 16px;
    color: #666;
    cursor: pointer;
  }
  .time-item.active {
    color: #f97316;
    font-weight: bold;
  }
  .checkbox {
    font-size: 18px;
  }

  /* === Buttons === */
  .card-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
  .sketch-btn {
    padding: 12px 40px;
    background: #fff;
    border: 2px solid #333;
    border-radius: 8px;
    font-size: 18px;
    font-weight: bold;
    color: #333;
    box-shadow: 3px 3px 0 rgba(0,0,0,0.1);
  }
  .sketch-btn.primary {
    background: #facc15;
  }
  .sketch-btn.secondary {
    background: #f3f4f6;
  }
  .cancel-link {
    color: #999;
    font-size: 14px;
    text-decoration: underline;
  }

  /* === Result Screen === */
  .result-section {
    margin: 30px 0;
    text-align: center;
  }
  .result-label {
    font-size: 18px;
    color: #666;
    display: block;
    margin-bottom: 10px;
  }
  .result-value {
    font-size: 72px;
    font-weight: 900;
    color: #333;
    line-height: 1;
  }
  .result-buttons {
    display: flex;
    gap: 20px;
    margin-top: 20px;
  }

  /* === Game Screen === */
  .game-screen {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px 40px;
  }
  /* Motion status indicator - shown during gameplay */
  .motion-status {
    margin-top: 30px;
    padding: 10px 30px;
    border-radius: 50px;
    background: rgba(255,255,255,0.8);
    font-size: 18px;
    color: #666;
  }
  .game-header {
    position: absolute;
    top: 20px;
    left: 40px;
    right: 40px;
    display: flex;
    justify-content: space-between;
  }
  .info-item {
    text-align: left;
  }
  .info-item.right {
    text-align: right;
  }
  .info-label {
    font-size: 14px;
    color: #666;
    display: block;
  }
  .info-value {
    font-size: 32px;
    font-weight: bold;
    color: #333;
  }
  .word-card {
    width: 80%;
    max-width: 500px;
    min-height: 200px;
    background: #fff;
    border: 3px solid #333;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 6px 6px 0 rgba(0,0,0,0.08);
    transform: rotate(-0.5deg);
  }
  .word-text {
    font-size: 56px;
    font-weight: bold;
    color: #333;
    letter-spacing: 8px;
  }
  .quit-btn {
    position: absolute;
    bottom: 30px;
    right: 30px;
    width: 40px;
    height: 40px;
    background: rgba(255,255,255,0.8);
    border: 2px solid #333;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: #666;
  }
</style>
