<template>
  <view class="container" :class="ratioProfile">
    <!-- Auth Screen -->
    <AuthScreen
      v-if="gameStatus === 'auth'"
      :is-register="authMode === 'register'"
      v-model:username="username"
      v-model:password="password"
      :error="authError"
      :success="authSuccess"
      @submit="handleAuthSubmit"
      @switch="switchAuthMode"
    />

    <!-- Home Screen -->
    <HomeScreen
      v-if="gameStatus === 'home'"
      :selected-category="selectedCategory"
      :lives="lives"
      @select="selectCategory"
      @show-history="showUserHistory"
      @toggle-sound="toggleSound"
      @open-settings="openSettings"
      @logout="handleLogout"
    />

    <!-- Setup Screen -->
    <SetupScreen
      v-if="gameStatus === 'setup'"
      v-model:selected-time="selectedTime"
      :category-label="selectedCategory === 'life' ? '日常生活' : '成语'"
      @start="startGame(selectedTime)"
      @cancel="gameStatus = 'home'"
    />

    <!-- Game Screen -->
    <GameScreen
      v-if="gameStatus === 'playing'"
      :time-left="timeLeft"
      :score="score"
      :current-word="currentWord"
      @quit="quitGame"
    />

    <!-- Result Screen -->
    <ResultScreen
      v-if="gameStatus === 'result'"
      :score="score"
      @restart="restartGame"
      @home="goHome"
    />

    <!-- History Screen -->
    <HistoryScreen
      v-if="gameStatus === 'history'"
      :history="userHistory"
      :selected-category="historyCategory"
      @switch-category="switchHistoryCategory"
      @close="gameStatus = 'home'"
    />
  </view>
</template>

<script>
import AuthScreen from '@/components/screens/AuthScreen.vue';
import HomeScreen from '@/components/screens/HomeScreen.vue';
import SetupScreen from '@/components/screens/SetupScreen.vue';
import GameScreen from '@/components/screens/GameScreen.vue';
import ResultScreen from '@/components/screens/ResultScreen.vue';
import HistoryScreen from '@/components/screens/HistoryScreen.vue';
import { useGameApi } from '@/composables/useGameApi.js';
import { useGameLogic } from '@/composables/useGameLogic.js';

const RECENT_WORD_LIMIT = 200;
const RECENT_WORD_STORAGE_KEY = 'recentWordIds';

export default {
  components: {
    AuthScreen,
    HomeScreen,
    SetupScreen,
    GameScreen,
    ResultScreen,
    HistoryScreen
  },

  setup() {
    const { register, login, fetchHistory, submitScore: apiSubmitScore, fetchLives, consumeLife, fetchWordBank } = useGameApi();
    const { fetchWords, startMotion, stopMotion, handleTilt } = useGameLogic();

    return {
      register,
      login,
      fetchHistory,
      apiSubmitScore,
      fetchLives,
      consumeLife,
      fetchWordBank,
      fetchWords,
      startMotion,
      stopMotion,
      handleTilt
    };
  },

  data() {
    return {
      gameStatus: 'home',
      score: 0,
      timeLeft: 60,
      selectedTime: 120,
      lastTime: 120,
      selectedCategory: 'idiom',
      currentWord: '准备',
      currentWordId: null,
      wordList: [],
      isLocked: false,
      timerInterval: null,
      recentWordIds: [],
      startingGame: false,
      currentWordSource: '',
      ratioProfile: 'ratio-19-5-9',

      // Auth
      playerId: '',
      playerName: '',
      authMode: 'login',
      username: '',
      password: '',
      authError: '',

      // Lives
      lives: 5,
      authSuccess: '',

      // History
      userHistory: [],
      historyCategory: 'idiom'
    };
  },

  mounted() {
    this.updateRatioProfile();
    if (uni.onWindowResize) {
      this._handleWindowResize = () => {
        this.updateRatioProfile();
      };
      uni.onWindowResize(this._handleWindowResize);
    }
    this.loadRecentWords();
    this.checkAuth();
  },

  onUnload() {
    if (uni.offWindowResize && this._handleWindowResize) {
      uni.offWindowResize(this._handleWindowResize);
      this._handleWindowResize = null;
    }
    this.stopAll();
  },

  methods: {
    updateRatioProfile() {
      const info = uni.getSystemInfoSync ? uni.getSystemInfoSync() : {};
      const width = Number(info.windowWidth || info.screenWidth || 0);
      const height = Number(info.windowHeight || info.screenHeight || 0);
      if (!width || !height) {
        this.ratioProfile = 'ratio-19-5-9';
        return;
      }

      const ratio = height / width;
      if (ratio <= 2.03) {
        this.ratioProfile = 'ratio-16-9';
        return;
      }
      if (ratio <= 2.195) {
        this.ratioProfile = 'ratio-19-5-9';
        return;
      }
      this.ratioProfile = 'ratio-20-9';
    },

    // Auth
    checkAuth() {
      try {
        this.playerId = uni.getStorageSync('playerId') || '';
        this.playerName = uni.getStorageSync('playerName') || '';
        this.lives = uni.getStorageSync('lives') || 5;
        this.gameStatus = this.playerId ? 'home' : 'auth';
      } catch (e) {
        this.gameStatus = 'auth';
      }
    },

    handleAuthSubmit() {
      if (this.authMode === 'register') {
        this.handleRegister();
      } else {
        this.handleLogin();
      }
    },

    handleRegister() {
      if (!this.username.trim()) {
        this.authError = '请输入用户名';
        return;
      }
      if (!this.password) {
        this.authError = '请输入密码';
        return;
      }
      if (this.password.length < 6) {
        this.authError = '密码至少需要6位';
        return;
      }
      this.authError = '';

      this.register(
        this.username,
        this.password,
        (data) => {
          this.playerId = data.player_id;
          this.playerName = data.player_name || this.username;
          this.lives = data.lives || 5;

          uni.setStorageSync('playerId', this.playerId);
          uni.setStorageSync('playerName', this.playerName);
          uni.setStorageSync('lives', this.lives);

          this.authSuccess = '注册成功!';
          setTimeout(() => this.goHome(), 1000);
        },
        (error) => {
          this.authError = error;
        }
      );
    },

    handleLogin() {
      if (!this.username.trim()) {
        this.authError = '请输入用户名';
        return;
      }
      if (!this.password) {
        this.authError = '请输入密码';
        return;
      }
      this.authError = '';

      this.login(
        this.username,
        this.password,
        (data) => {
          this.playerId = data.player_id;
          this.playerName = data.player_name || this.username;

          uni.setStorageSync('playerId', this.playerId);
          uni.setStorageSync('playerName', this.playerName);

          // Fetch lives after login
          this.fetchLives(
            this.playerId,
            (lives) => {
              this.lives = lives;
              uni.setStorageSync('lives', lives);
            },
            () => {
              // Fallback to default
              this.lives = 5;
            }
          );

          this.authSuccess = '登录成功!';
          setTimeout(() => this.goHome(), 1000);
        },
        (error) => {
          this.authError = error;
        }
      );
    },

    switchAuthMode() {
      this.authMode = this.authMode === 'register' ? 'login' : 'register';
      this.authError = '';
      this.authSuccess = '';
      this.password = '';
    },

    // Navigation
    goHome() {
      this.authSuccess = '';
      this.authError = '';
      this.username = '';
      this.password = '';
      this.gameStatus = 'home';
    },

    selectCategory(type) {
      if (type === 'idiom' || type === 'life') {
        this.selectedCategory = type;
        this.gameStatus = 'setup';
      }
    },

    toggleSound() {
      uni.showToast({ title: '声音开关', icon: 'none' });
    },

    openSettings() {
      uni.showToast({ title: '设置', icon: 'none' });
    },

    handleLogout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // Clear stored auth data
            uni.removeStorageSync('playerId');
            uni.removeStorageSync('playerName');

            // Reset state
            this.playerId = '';
            this.playerName = '';
            this.username = '';
            this.password = '';
            this.authError = '';
            this.authSuccess = '';
            this.authMode = 'login';

            // Return to auth screen
            this.gameStatus = 'auth';

            uni.showToast({ title: '已退出登录', icon: 'success' });
          }
        }
      });
    },

    loadRecentWords() {
      try {
        const saved = uni.getStorageSync(RECENT_WORD_STORAGE_KEY);
        if (Array.isArray(saved)) {
          this.recentWordIds = saved.filter((id) => Number.isFinite(id));
        }
      } catch (e) {
        this.recentWordIds = [];
      }
    },

    addRecentWordId(wordId) {
      const id = Number(wordId);
      if (!Number.isFinite(id)) return;
      const idx = this.recentWordIds.indexOf(id);
      if (idx !== -1) this.recentWordIds.splice(idx, 1);
      this.recentWordIds.push(id);
      if (this.recentWordIds.length > RECENT_WORD_LIMIT) {
        this.recentWordIds.splice(0, this.recentWordIds.length - RECENT_WORD_LIMIT);
      }
      uni.setStorageSync(RECENT_WORD_STORAGE_KEY, this.recentWordIds);
    },

    normalizeWords(items) {
      if (!Array.isArray(items)) return [];
      return items
        .map((item) => ({
          word_id: Number(item.word_id),
          word: item.word
        }))
        .filter((item) => Number.isFinite(item.word_id) && !!item.word);
    },

    getCloudFetchLimit(gameSeconds) {
      if (gameSeconds <= 60) return 220;
      if (gameSeconds <= 120) return 320;
      return 450;
    },

    fetchCloudWords(category, options = {}) {
      const { gameSeconds = 120 } = options;
      const limit = this.getCloudFetchLimit(gameSeconds);
      const excludeIds = this.recentWordIds.slice(-RECENT_WORD_LIMIT);
      return new Promise((resolve) => {
        const requestWords = (excludeList, allowRetry) => {
          this.fetchWordBank(
            category,
            { limit, excludeIds: excludeList },
            (data) => {
              const normalized = this.normalizeWords(data);
              if (normalized.length > 0) {
                resolve(normalized);
                return;
              }
              if (allowRetry && excludeList.length) {
                requestWords([], false);
                return;
              }
              resolve(null);
            },
            (error) => {
              console.error('Cloud word bank fallback:', error);
              resolve(null);
            }
          );
        };

        requestWords(excludeIds, true);
      });
    },

    async buildGameWords(category, gameSeconds) {
      const excludeIds = new Set(this.recentWordIds);
      const cloudWords = await this.fetchCloudWords(category, { gameSeconds });

      if (cloudWords && cloudWords.length > 0) {
        this.currentWordSource = 'cloud';
        console.log(`[WordBank] source=cloud category=${category} count=${cloudWords.length}`);
        return this.fetchWords({
          excludeIds,
          sourceWords: cloudWords
        });
      }

      this.currentWordSource = 'local';
      console.log(`[WordBank] source=local category=${category}`);
      return this.fetchWords({ excludeIds, category });
    },

    // Game
    async startGame(time) {
      if (this.startingGame) return;

      // Check if player has lives
      if (this.lives <= 0) {
        uni.showModal({
          title: '体力不足',
          content: '您的体力已用完，请稍后再试',
          showCancel: false,
          confirmText: '确定'
        });
        return;
      }

      this.startingGame = true;

      this.lastTime = time;
      this.timeLeft = time;
      this.score = 0;
      this.isLocked = false;
      this.currentWordId = null;
      this.currentWordSource = '';

      try {
        this.wordList = await this.buildGameWords(this.selectedCategory, time);

        if (!this.wordList.length) {
          uni.showToast({ title: '词库为空', icon: 'none' });
          return;
        }

        const categoryName = this.selectedCategory === 'life' ? '日常生活' : '中华成语';
        const sourceName = this.currentWordSource === 'cloud' ? '云端' : '本地';
        uni.showToast({ title: `${sourceName}词库 · ${categoryName}`, icon: 'none' });

        this.gameStatus = 'playing';
        this.nextWord();
        this.startTimer();

        this.startMotion((res) => {
          if (this.gameStatus !== 'playing') return;
          this.handleTilt(
            res,
            this.isLocked,
            () => this.triggerResult(true),
            () => this.triggerResult(false),
            () => { this.isLocked = false; }
          );
        });
      } finally {
        this.startingGame = false;
      }
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
      this.stopMotion();
    },

    endGame() {
      this.stopAll();

      // Consume one life
      if (this.playerId && this.lives > 0) {
        this.consumeLife(
          this.playerId,
          (remainingLives) => {
            this.lives = remainingLives;
            uni.setStorageSync('lives', remainingLives);
          },
          (error) => {
            console.error('Failed to consume life:', error);
          }
        );
      }

      // Save game record locally
      this.saveGameRecord(this.selectedCategory, this.score);

      this.$nextTick(() => {
        this.gameStatus = 'result';
      });
      uni.vibrateLong();
    },

    nextWord() {
      if (this.wordList.length === 0) {
        this.endGame();
        return;
      }
      const w = this.wordList.pop();
      this.currentWord = w.word || w.w;
      this.currentWordId = w.word_id ?? w.id ?? null;
      if (this.currentWordId !== null) {
        this.addRecentWordId(this.currentWordId);
      }
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

    // Local History
    saveGameRecord(category, score) {
      const key = `gameHistory_${category}`;
      let records = [];
      try {
        const saved = uni.getStorageSync(key);
        if (Array.isArray(saved)) records = saved;
      } catch (e) {
        records = [];
      }
      records.unshift({
        score,
        category,
        date: new Date().toISOString()
      });
      if (records.length > 10) records = records.slice(0, 10);
      uni.setStorageSync(key, records);
    },

    loadGameHistory(category) {
      const key = `gameHistory_${category}`;
      try {
        const saved = uni.getStorageSync(key);
        return Array.isArray(saved) ? saved : [];
      } catch (e) {
        return [];
      }
    },

    showUserHistory() {
      this.historyCategory = 'idiom';
      this.userHistory = this.loadGameHistory('idiom');
      this.gameStatus = 'history';
    },

    switchHistoryCategory(category) {
      this.historyCategory = category;
      this.userHistory = this.loadGameHistory(category);
    }
  }
};
</script>

<style>
/* Grid Background */
.container {
  --edge-gap: 20px;
  --edge-gap-wide: 40px;
  --modal-title-size: 32px;
  --modal-subtitle-size: 14px;
  --paper-card-width: 420px;
  --paper-card-max-height: 85%;
  --paper-card-padding-top: 40px;
  --paper-card-padding-x: 30px;
  --paper-card-padding-bottom: 30px;
  --sketch-btn-font-size: 16px;
  --sketch-btn-pad-y: 12px;
  --sketch-btn-pad-x: 28px;
  --energy-top: 20px;
  --energy-left: 40px;
  --energy-pill-padding-y: 6px;
  --energy-pill-padding-x: 12px;
  --energy-icon-size: 18px;
  --energy-count-size: 20px;
  --energy-plus-size: 22px;
  --menu-right: 36px;
  --menu-bottom: 60px;
  --menu-gap: 12px;
  --menu-icon-size: 44px;
  --menu-icon-font-size: 20px;
  --home-horizontal-padding: 20px;
  --home-card-width: 200px;
  --home-card-height: 140px;
  --home-card-title-size: 48px;
  --home-card-gap: 24px;
  --game-screen-padding-y: 20px;
  --game-screen-padding-x: 40px;
  --game-header-top: 20px;
  --game-word-font-size: 56px;
  --game-word-letter-spacing: 8px;
  --game-word-min-height: 200px;
  --game-info-value-size: 32px;
  --game-quit-size: 40px;
  --game-quit-font-size: 18px;
  --history-max-height: 280px;
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

.container.ratio-16-9 {
  --edge-gap: 14px;
  --edge-gap-wide: 26px;
  --modal-title-size: 28px;
  --modal-subtitle-size: 13px;
  --paper-card-width: 380px;
  --paper-card-padding-top: 30px;
  --paper-card-padding-x: 20px;
  --paper-card-padding-bottom: 22px;
  --sketch-btn-font-size: 15px;
  --sketch-btn-pad-y: 10px;
  --sketch-btn-pad-x: 20px;
  --energy-top: 14px;
  --energy-left: 24px;
  --energy-pill-padding-y: 5px;
  --energy-pill-padding-x: 10px;
  --energy-icon-size: 16px;
  --energy-count-size: 18px;
  --energy-plus-size: 20px;
  --menu-right: 28px;
  --menu-bottom: 50px;
  --menu-gap: 10px;
  --menu-icon-size: 40px;
  --menu-icon-font-size: 18px;
  --home-horizontal-padding: 12px;
  --home-card-width: 170px;
  --home-card-height: 118px;
  --home-card-title-size: 40px;
  --home-card-gap: 14px;
  --game-screen-padding-y: 12px;
  --game-screen-padding-x: 24px;
  --game-header-top: 12px;
  --game-word-font-size: 46px;
  --game-word-letter-spacing: 5px;
  --game-word-min-height: 170px;
  --game-info-value-size: 28px;
  --game-quit-size: 36px;
  --game-quit-font-size: 16px;
  --history-max-height: 220px;
}

.container.ratio-20-9 {
  --edge-gap: 22px;
  --edge-gap-wide: 44px;
  --modal-title-size: 34px;
  --paper-card-width: 440px;
  --paper-card-padding-top: 44px;
  --home-card-width: 208px;
  --home-card-height: 150px;
  --home-card-title-size: 50px;
  --home-card-gap: 26px;
  --game-word-font-size: 60px;
  --game-word-min-height: 220px;
  --game-info-value-size: 34px;
  --history-max-height: 320px;
}
</style>
