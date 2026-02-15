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
      <view class="menu-icon" @click="showUserHistory">📋</view>
      <view class="menu-icon" @click="toggleSound">🔊</view>
      <view class="menu-icon" @click="openSettings">⚙️</view>
    </view>

    <!-- === AUTH MODAL (First time or Recover) === -->
    <view v-if="gameStatus === 'auth'" class="modal-overlay">
      <view class="paper-card auth">
        <view class="clips">
          <view class="clip"></view>
          <view class="clip"></view>
        </view>

        <view class="card-content">
          <text class="card-main-title">{{ authMode === 'register' ? '新玩家' : '恢复账号' }}</text>
          <text class="card-subtitle">{{ authMode === 'register' ? '创建你的游戏档案' : '输入备份码恢复记录' }}</text>

          <!-- Register Mode -->
          <view v-if="authMode === 'register'" class="auth-form">
            <text class="input-label">你的名字:</text>
            <input class="name-input" v-model="tempName" placeholder="输入昵称" maxlength="12" />
            <text class="input-hint">保存好你的备份码，换设备时需要用到</text>
          </view>

          <!-- Recover Mode -->
          <view v-else class="auth-form">
            <text class="input-label">备份码:</text>
            <input class="name-input backup-input" v-model="backupCodeInput" placeholder="如: ABC12345" maxlength="8" />
            <text class="input-hint">输入之前保存的8位备份码</text>
          </view>

          <text v-if="authError" class="auth-error">{{ authError }}</text>
          <text v-if="authSuccess" class="auth-success">{{ authSuccess }}</text>

          <view class="card-buttons">
            <view class="sketch-btn primary" @click="authMode === 'register' ? register() : recover()">
              {{ authMode === 'register' ? '创建账号' : '恢复记录' }}
            </view>
            <view class="cancel-link" @click="switchAuthMode">
              {{ authMode === 'register' ? '已有备份码? 点击恢复' : '新玩家? 创建账号' }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- === BACKUP CODE DISPLAY (After Register) === -->
    <view v-if="gameStatus === 'backup'" class="modal-overlay">
      <view class="paper-card backup">
        <view class="clips">
          <view class="clip"></view>
          <view class="clip"></view>
        </view>

        <view class="card-content">
          <text class="card-main-title">保存备份码</text>
          <text class="card-subtitle">换设备或重装时需要用到</text>

          <view class="backup-code-display">
            <text class="backup-code">{{ backupCode }}</text>
          </view>

          <text class="input-hint warning">请截图保存或记住此代码!</text>

          <view class="card-buttons">
            <view class="sketch-btn primary" @click="goHome">我已保存，开始游戏</view>
          </view>
        </view>
      </view>
    </view>

    <!-- === HOME SCREEN === -->
    <view v-if="gameStatus === 'home'" class="home-screen">
      <view class="scroll-area">
        <text class="arrow left">⟨</text>
        <scroll-view class="category-scroll" scroll-x="true" show-scrollbar="false">
          <view class="card-container">
            <view class="category-card active" @click="selectCategory('idiom')">
              <view class="card-sketch">
                <text class="card-title">成语</text>
              </view>
            </view>
            <view class="category-card placeholder">
              <view class="card-sketch dashed">
                <text class="card-title">1</text>
              </view>
            </view>
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

      <view class="word-card">
        <text class="word-text">{{ currentWord }}</text>
      </view>

      <view class="quit-btn" @click="quitGame">✕</view>
    </view>

    <!-- === RESULT MODAL === -->
    <view v-if="gameStatus === 'result'" class="modal-overlay">
      <view class="paper-card result">
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

          <text v-if="submitStatus" class="submit-status">{{ submitStatus }}</text>

          <view class="result-buttons">
            <view class="sketch-btn" @click="restartGame">再来一局</view>
            <view class="sketch-btn secondary" @click="goHome">退出</view>
            <view class="sketch-btn primary" @click="submitScore">上传分数</view>
          </view>
        </view>
      </view>
    </view>

    <!-- === USER HISTORY MODAL === -->
    <view v-if="gameStatus === 'history'" class="modal-overlay">
      <view class="paper-card history">
        <view class="clips">
          <view class="clip"></view>
          <view class="clip"></view>
        </view>

        <view class="card-content">
          <text class="card-main-title">我的记录</text>
          <text class="card-subtitle">最近 10 场游戏</text>

          <view v-if="loading" class="loading-text">加载中...</view>

          <scroll-view v-else class="history-list" scroll-y="true">
            <view v-for="(item, index) in userHistory" :key="item.id" class="history-item">
              <text class="history-num">{{ index + 1 }}</text>
              <text class="history-date">{{ formatDate(item.created_at) }}</text>
              <text class="history-score">{{ item.score }}分</text>
            </view>
            <view v-if="userHistory.length === 0" class="empty-text">
              暂无游戏记录
            </view>
          </scroll-view>

          <view class="card-buttons">
            <view class="sketch-btn" @click="refreshHistory">刷新</view>
            <view class="cancel-link" @click="gameStatus='home'">关闭</view>
          </view>
        </view>
      </view>
    </view>

  </view>
</template>

<script>
  import idiomData from '@/static/data/idioms.js';

  const API_BASE_URL = 'https://sgit-api.bdgamer.org';

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
        timerInterval: null,

        // Auth
        playerId: '',
        playerName: '',
        backupCode: '',
        authMode: 'register',
        tempName: '',
        backupCodeInput: '',
        authError: '',
        authSuccess: '',

        // History
        userHistory: [],
        loading: false,
        submitStatus: ''
      }
    },
    mounted() {
      this.checkAuth();
    },
    onUnload() {
      this.stopAll();
    },
    methods: {
      // ============================================
      // AUTH
      // ============================================
      checkAuth() {
        try {
          const playerId = uni.getStorageSync('playerId');
          const playerName = uni.getStorageSync('playerName');
          const backupCode = uni.getStorageSync('backupCode');

          if (playerId) {
            this.playerId = playerId;
            this.playerName = playerName || 'Player';
            this.backupCode = backupCode || '';
            this.gameStatus = 'home';
          } else {
            this.gameStatus = 'auth';
          }
        } catch (e) {
          this.gameStatus = 'auth';
        }
      },

      register() {
        if (!this.tempName.trim()) {
          this.authError = '请输入名字';
          return;
        }

        this.authError = '';

        uni.request({
          url: `${API_BASE_URL}/api/register`,
          method: 'POST',
          header: { 'Content-Type': 'application/json' },
          data: { player_name: this.tempName.trim() },
          success: (res) => {
            if (res.statusCode === 200) {
              const data = res.data;
              this.playerId = data.player_id;
              this.playerName = data.player_name;
              this.backupCode = data.backup_code;

              uni.setStorageSync('playerId', this.playerId);
              uni.setStorageSync('playerName', this.playerName);
              uni.setStorageSync('backupCode', this.backupCode);

              this.gameStatus = 'backup';
            } else {
              this.authError = res.data.error || '注册失败';
            }
          },
          fail: (err) => {
            console.error('Register error:', err);
            this.authError = '网络错误';
          }
        });
      },

      recover() {
        if (!this.backupCodeInput.trim()) {
          this.authError = '请输入备份码';
          return;
        }

        this.authError = '';

        uni.request({
          url: `${API_BASE_URL}/api/recover`,
          method: 'POST',
          header: { 'Content-Type': 'application/json' },
          data: { backup_code: this.backupCodeInput.trim().toUpperCase() },
          success: (res) => {
            if (res.statusCode === 200) {
              const data = res.data;
              this.playerId = data.player_id;
              this.playerName = data.player_name;

              uni.setStorageSync('playerId', this.playerId);
              uni.setStorageSync('playerName', this.playerName);

              this.authSuccess = '恢复成功!';
              setTimeout(() => this.goHome(), 1000);
            } else {
              this.authError = res.data.error || '无效的备份码';
            }
          },
          fail: (err) => {
            console.error('Recover error:', err);
            this.authError = '网络错误';
          }
        });
      },

      switchAuthMode() {
        this.authMode = this.authMode === 'register' ? 'recover' : 'register';
        this.authError = '';
        this.authSuccess = '';
      },

      // ============================================
      // GAME
      // ============================================
      toggleSound() {
        uni.showToast({ title: '声音开关', icon: 'none' });
      },
      openSettings() {
        uni.showToast({ title: '设置', icon: 'none' });
      },
      selectCategory(type) {
        if (type === 'idiom') {
          this.gameStatus = 'setup';
        }
      },
      startGame(time) {
        this.lastTime = time;
        this.timeLeft = time;
        this.score = 0;
        this.submitStatus = '';
        this.gameStatus = 'playing';
        this.isLocked = false;

        this.fetchWords();
        this.nextWord();
        this.startTimer();
        this.startMotion();
      },
      quitGame() {
        this.stopAll();
        this.gameStatus = 'home';
      },
      restartGame() {
        this.submitStatus = '';
        this.startGame(this.lastTime);
      },
      goHome() {
        this.submitStatus = '';
        this.authSuccess = '';
        this.gameStatus = 'home';
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
      fetchWords() {
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

        if (z < -5) {
          this.triggerResult(true);
        } else if (z > 7) {
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
      },

      // ============================================
      // API
      // ============================================
      submitScore() {
        if (!this.playerId) {
          this.submitStatus = '请先登录';
          return;
        }

        this.submitStatus = '上传中...';

        uni.request({
          url: `${API_BASE_URL}/api/score`,
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'X-Player-ID': this.playerId
          },
          data: { score: this.score },
          success: (res) => {
            if (res.statusCode === 200) {
              this.submitStatus = '上传成功!';
              setTimeout(() => this.showUserHistory(), 1000);
            } else {
              this.submitStatus = res.data.error || '上传失败';
            }
          },
          fail: (err) => {
            console.error('Submit error:', err);
            this.submitStatus = '网络错误';
          }
        });
      },

      fetchUserHistory() {
        if (!this.playerId) {
          this.userHistory = [];
          return;
        }

        this.loading = true;
        uni.request({
          url: `${API_BASE_URL}/api/history`,
          header: {
            'X-Player-ID': this.playerId
          },
          success: (res) => {
            if (res.statusCode === 200) {
              this.userHistory = res.data;
            } else {
              uni.showToast({ title: '加载失败', icon: 'none' });
            }
          },
          fail: (err) => {
            console.error('Fetch error:', err);
            uni.showToast({ title: '网络错误', icon: 'none' });
          },
          complete: () => {
            this.loading = false;
          }
        });
      },

      showUserHistory() {
        this.gameStatus = 'history';
        this.fetchUserHistory();
      },

      refreshHistory() {
        this.fetchUserHistory();
      },

      formatDate(dateString) {
        const date = new Date(dateString);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');
        return `${month}-${day} ${hour}:${minute}`;
      }
    }
  }
</script>

<style>
  /* Grid Background */
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

  /* Energy Pill */
  .energy-pill {
    position: absolute;
    top: 20px;
    left: 40px;
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

  /* Right Menu */
  .right-menu {
    position: absolute;
    right: 20px;
    bottom: 20px;
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

  /* Home Screen */
  .home-screen {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 0 20px;
  }
  .scroll-area {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 800px;
  }
  .arrow {
    font-size: 24px;
    color: #999;
    padding: 0 8px;
    font-family: monospace;
    flex-shrink: 0;
  }
  .category-scroll {
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
  }
  .card-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 24px;
    padding: 10px 0;
  }
  .category-card {
    display: flex;
    flex-shrink: 0;
  }
  .card-sketch {
    width: 200px;
    height: 140px;
    background: #fff;
    border: 3px solid #333;
    border-radius: 16px;
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
    font-size: 48px;
    font-weight: bold;
    color: #333;
    text-align: center;
    line-height: 1;
  }

  /* Modal Overlay */
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

  /* Paper Card */
  .paper-card {
    width: 420px;
    max-width: 85%;
    background: #fff;
    border: 3px solid #333;
    border-radius: 8px;
    position: relative;
    box-shadow: 4px 4px 0 rgba(0,0,0,0.1), inset 0 0 40px rgba(0,0,0,0.02);
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
  .paper-card.history,
  .paper-card.auth,
  .paper-card.backup {
    transform: rotate(0.3deg);
    max-height: 85%;
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
    margin-bottom: 25px;
  }

  /* Auth Form */
  .auth-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 15px 0;
  }
  .input-label {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
  }
  .name-input {
    width: 80%;
    max-width: 220px;
    padding: 12px 15px;
    border: 2px solid #333;
    border-radius: 8px;
    font-size: 16px;
    text-align: center;
    background: #fff;
  }
  .backup-input {
    font-family: monospace;
    font-size: 18px;
    letter-spacing: 2px;
  }
  .input-hint {
    font-size: 12px;
    color: #999;
    margin-top: 10px;
    text-align: center;
  }
  .input-hint.warning {
    color: #ea580c;
    font-weight: bold;
  }
  .auth-error {
    color: #dc2626;
    font-size: 14px;
    margin: 10px 0;
  }
  .auth-success {
    color: #16a34a;
    font-size: 14px;
    margin: 10px 0;
  }

  /* Backup Code Display */
  .backup-code-display {
    background: #facc15;
    padding: 20px 40px;
    border: 3px solid #333;
    border-radius: 8px;
    margin: 20px 0;
  }
  .backup-code {
    font-family: monospace;
    font-size: 32px;
    font-weight: bold;
    color: #333;
    letter-spacing: 4px;
  }

  /* Time Selection */
  .time-section {
    width: 100%;
    margin-bottom: 25px;
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

  /* Buttons */
  .card-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-top: 15px;
  }
  .result-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    margin-top: 15px;
  }
  .sketch-btn {
    padding: 12px 28px;
    background: #fff;
    border: 2px solid #333;
    border-radius: 8px;
    font-size: 16px;
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

  /* Result Screen */
  .result-section {
    margin: 15px 0;
    text-align: center;
  }
  .result-label {
    font-size: 18px;
    color: #666;
    display: block;
    margin-bottom: 8px;
  }
  .result-value {
    font-size: 64px;
    font-weight: 900;
    color: #333;
    line-height: 1;
  }
  .submit-status {
    font-size: 14px;
    color: #666;
    margin: 10px 0;
  }

  /* History */
  .history-list {
    width: 100%;
    max-height: 280px;
    margin: 15px 0;
  }
  .history-item {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    border-bottom: 1px dashed rgba(0,0,0,0.1);
  }
  .history-item:last-child {
    border-bottom: none;
  }
  .history-num {
    width: 30px;
    font-size: 16px;
    font-weight: bold;
    color: #666;
  }
  .history-date {
    flex: 1;
    font-size: 14px;
    color: #999;
    text-align: center;
  }
  .history-score {
    width: 60px;
    font-size: 18px;
    font-weight: bold;
    color: #333;
    text-align: right;
  }
  .loading-text,
  .empty-text {
    font-size: 16px;
    color: #999;
    padding: 30px;
    text-align: center;
  }

  /* Game Screen */
  .game-screen {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px 40px;
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
