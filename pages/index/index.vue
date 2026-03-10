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
      :life-recovery-countdown-label="lifeRecoveryCountdownLabel"
      @select="selectCategory"
      @show-history="showUserHistory"
      @toggle-sound="toggleSound"
      @add-energy="openRecharge"
      @play-click-sound="playClickSound"
      @share="handleShare"
      @open-settings="openSettings"
      @logout="handleLogout"
    />

    <RechargeScreen
      v-if="gameStatus === 'recharge'"
      @close="closeRecharge"
      @choose="handleRechargeChoose"
    />

    <!-- Setup Screen -->
    <SetupScreen
      v-if="gameStatus === 'setup'"
      v-model:selected-time="selectedTime"
      :category-label="selectedCategory === 'life' ? '日常生活' : '成语'"
      @start="startGame(selectedTime)"
      @cancel="gameStatus = 'home'"
    />

    <!-- Countdown Screen -->
    <CountdownScreen
      v-if="gameStatus === 'countdown'"
      @done="onCountdownDone"
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
import CountdownScreen from '@/components/screens/CountdownScreen.vue';
import HistoryScreen from '@/components/screens/HistoryScreen.vue';
import RechargeScreen from '@/components/screens/RechargeScreen.vue';
import { useGameApi } from '@/composables/useGameApi.js';
import { useGameLogic } from '@/composables/useGameLogic.js';

const RECENT_WORD_LIMIT = 200;
const RECENT_WORD_STORAGE_KEY = 'recentWordIds';
const LIFE_RECOVERY_CAP = 5;
const MAX_CLIENT_LIVES = 999999;
const LIFE_SYNC_INTERVAL_MS = 15000;
const LIFE_COUNTDOWN_TICK_MS = 1000;
const SOUND_ENABLED_STORAGE_KEY = 'soundEnabled';
const CLICK_SFX_SRC = '/static/audio/button.aiff';

export default {
  components: {
    AuthScreen,
    HomeScreen,
    SetupScreen,
    GameScreen,
    ResultScreen,
    CountdownScreen,
    HistoryScreen,
    RechargeScreen
  },

  setup() {
    const {
      register,
      login,
      fetchHistory,
      submitScore: apiSubmitScore,
      fetchLives,
      consumeLife,
      createStripeCheckout,
      fetchPaymentOrderStatus,
      fetchWordBank
    } = useGameApi();
    const { fetchWords, startMotion, stopMotion, handleTilt } = useGameLogic();

    return {
      register,
      login,
      fetchHistory,
      apiSubmitScore,
      fetchLives,
      consumeLife,
      createStripeCheckout,
      fetchPaymentOrderStatus,
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
      selectedTime: 60,
      lastTime: 60,
      selectedCategory: 'idiom',
      currentWord: '准备',
      currentWordId: null,
      wordList: [],
      isLocked: false,
      timerInterval: null,
      lifeRecoveryInterval: null,
      lifeSyncInterval: null,
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
      lifeRecoveryCountdownLabel: '',
      lifeNextRecoverAtMs: null,
      authSuccess: '',

      // History
      userHistory: [],
      historyCategory: 'idiom',
      soundEnabled: false,
      clickAudio: null
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
    this.loadSoundSettings();
    this.initClickAudio();
    this.checkAuth();
    this.initializeLifeRecovery();
  },

  onUnload() {
    if (uni.offWindowResize && this._handleWindowResize) {
      uni.offWindowResize(this._handleWindowResize);
      this._handleWindowResize = null;
    }
    this.stopAll();
    this.stopLifeRecoveryTicker();
    if (this.clickAudio) {
      this.clickAudio.destroy();
      this.clickAudio = null;
    }
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

    loadSoundSettings() {
      try {
        const stored = uni.getStorageSync(SOUND_ENABLED_STORAGE_KEY);
        if (stored === '' || stored === null || stored === undefined) {
          this.soundEnabled = false;
          return;
        }
        this.soundEnabled = stored === true || stored === 'true' || stored === 1 || stored === '1';
      } catch (e) {
        this.soundEnabled = false;
      }
    },

    initClickAudio() {
      if (typeof uni.createInnerAudioContext !== 'function') return;
      this.clickAudio = uni.createInnerAudioContext();
      this.clickAudio.autoplay = false;
      this.clickAudio.loop = false;
      this.clickAudio.src = CLICK_SFX_SRC;
    },

    playClickSound() {
      if (!this.soundEnabled || !this.clickAudio) return;
      try {
        this.clickAudio.stop();
        if (typeof this.clickAudio.seek === 'function') {
          this.clickAudio.seek(0);
        }
        this.clickAudio.play();
      } catch (e) {
        // Keep click flow smooth even if audio fails.
      }
    },

    // Auth
    checkAuth() {
      try {
        this.playerId = uni.getStorageSync('playerId') || '';
        this.playerName = uni.getStorageSync('playerName') || '';
        const storedLives = Number(uni.getStorageSync('lives'));
        this.lives = Number.isFinite(storedLives)
          ? Math.max(0, Math.min(MAX_CLIENT_LIVES, Math.floor(storedLives)))
          : LIFE_RECOVERY_CAP;
        this.gameStatus = this.playerId ? 'home' : 'auth';
      } catch (e) {
        this.gameStatus = 'auth';
      }
    },

    clampLives(value) {
      const lives = Number(value);
      if (!Number.isFinite(lives)) return LIFE_RECOVERY_CAP;
      return Math.max(0, Math.min(MAX_CLIENT_LIVES, Math.floor(lives)));
    },

    parseLifePayload(payload) {
      if (payload && typeof payload === 'object') {
        const parsedLives = this.clampLives(payload.lives);
        let nextRecoverAtMs = null;

        if (typeof payload.next_recover_at === 'string' && payload.next_recover_at) {
          const parsedAtMs = Date.parse(payload.next_recover_at);
          if (Number.isFinite(parsedAtMs)) {
            nextRecoverAtMs = parsedAtMs;
          }
        }

        if (!nextRecoverAtMs) {
          const remainSeconds = Number(payload.next_recover_in_seconds);
          if (Number.isFinite(remainSeconds) && remainSeconds >= 0) {
            nextRecoverAtMs = Date.now() + (remainSeconds * 1000);
          }
        }

        return { lives: parsedLives, nextRecoverAtMs };
      }

      return { lives: this.clampLives(payload), nextRecoverAtMs: null };
    },

    applyLivesPayload(payload) {
      const { lives, nextRecoverAtMs } = this.parseLifePayload(payload);
      this.lives = lives;
      this.lifeNextRecoverAtMs = lives >= LIFE_RECOVERY_CAP ? null : nextRecoverAtMs;
      uni.setStorageSync('lives', this.lives);
      this.updateLifeRecoveryCountdownLabel();
    },

    updateLifeRecoveryCountdownLabel() {
      if (this.lives >= LIFE_RECOVERY_CAP || !this.lifeNextRecoverAtMs) {
        this.lifeRecoveryCountdownLabel = '';
        return;
      }
      const remainMs = Math.max(0, this.lifeNextRecoverAtMs - Date.now());
      const totalSeconds = Math.ceil(remainMs / 1000);
      const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
      const ss = String(totalSeconds % 60).padStart(2, '0');
      this.lifeRecoveryCountdownLabel = `${mm}:${ss}`;
    },

    syncLivesFromServer(silent = false) {
      return new Promise((resolve) => {
        if (!this.playerId) {
          resolve(false);
          return;
        }

        this.fetchLives(
          this.playerId,
          (data) => {
            this.applyLivesPayload(data);
            resolve(true);
          },
          (error) => {
            if (!silent) {
              console.error('Failed to sync lives:', error);
            }
            resolve(false);
          }
        );
      });
    },

    startLifeRecoveryTicker() {
      this.stopLifeRecoveryTicker();
      if (!this.playerId) return;
      this.lifeRecoveryInterval = setInterval(() => {
        this.updateLifeRecoveryCountdownLabel();
      }, LIFE_COUNTDOWN_TICK_MS);
      this.lifeSyncInterval = setInterval(() => {
        this.syncLivesFromServer(true);
      }, LIFE_SYNC_INTERVAL_MS);
    },

    stopLifeRecoveryTicker() {
      if (this.lifeRecoveryInterval) {
        clearInterval(this.lifeRecoveryInterval);
        this.lifeRecoveryInterval = null;
      }
      if (this.lifeSyncInterval) {
        clearInterval(this.lifeSyncInterval);
        this.lifeSyncInterval = null;
      }
    },

    initializeLifeRecovery() {
      if (!this.playerId) {
        this.stopLifeRecoveryTicker();
        this.lifeRecoveryCountdownLabel = '';
        this.lifeNextRecoverAtMs = null;
        return;
      }
      this.syncLivesFromServer(true);
      this.startLifeRecoveryTicker();
    },

    consumeLifeForGameStart() {
      return new Promise((resolve) => {
        if (!this.playerId) {
          resolve(false);
          return;
        }
        this.consumeLife(
          this.playerId,
          (lifeData) => {
            this.applyLivesPayload(lifeData);
            this.startLifeRecoveryTicker();
            resolve(true);
          },
          (error) => {
            console.error('Failed to consume life:', error);
            uni.showToast({ title: error || '体力不足', icon: 'none' });
            resolve(false);
          }
        );
      });
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
          this.applyLivesPayload(data);

          uni.setStorageSync('playerId', this.playerId);
          uni.setStorageSync('playerName', this.playerName);
          this.initializeLifeRecovery();

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
            (lifeData) => {
              this.applyLivesPayload(lifeData);
              this.initializeLifeRecovery();
            },
            () => {
              // Fallback to default
              this.lives = LIFE_RECOVERY_CAP;
              this.lifeNextRecoverAtMs = null;
              this.lifeRecoveryCountdownLabel = '';
              this.initializeLifeRecovery();
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
      this.syncLivesFromServer(true);
      this.gameStatus = 'home';
    },

    selectCategory(type) {
      if (type === 'idiom' || type === 'life') {
        this.selectedCategory = type;
        this.selectedTime = 60;
        this.gameStatus = 'setup';
      }
    },

    toggleSound() {
      this.soundEnabled = !this.soundEnabled;
      uni.setStorageSync(SOUND_ENABLED_STORAGE_KEY, this.soundEnabled);
      if (this.soundEnabled) {
        this.playClickSound();
      }
      uni.showToast({ title: this.soundEnabled ? '音效已开启' : '音效已关闭', icon: 'none' });
    },

    getShareProviderLabel(provider) {
      if (provider === 'weixin') return '微信好友';
      if (provider === 'qq') return 'QQ';
      if (provider === 'sinaweibo') return '微博';
      return provider;
    },

    handleShare() {
      const shareUrl = 'https://bdgamer-org.github.io/SayIt_GuessIt_GetRich/index.html';
      uni.setClipboardData({
        data: shareUrl,
        success: () => {
          uni.showToast({ title: '链接已复制，请到微信/QQ粘贴分享', icon: 'none' });
        },
        fail: () => {
          uni.showToast({ title: '复制失败，请稍后重试', icon: 'none' });
        }
      });
    },

    openSettings() {
      uni.showToast({ title: '设置', icon: 'none' });
    },

    openRecharge() {
      this.gameStatus = 'recharge';
    },

    closeRecharge() {
      this.gameStatus = 'home';
    },

    handleRechargeChoose({ planId, method }) {
      if (!this.playerId) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        return;
      }

      this.createStripeCheckout(
        this.playerId,
        { plan_id: planId, payment_method: method },
        (checkoutData) => {
          const checkoutUrl = checkoutData?.checkout_url;
          const orderNo = checkoutData?.order_no;
          if (!checkoutUrl || !orderNo) {
            uni.showToast({ title: '支付链接创建失败', icon: 'none' });
            return;
          }

          this.openStripeCheckout(checkoutUrl);
          this.closeRecharge();

          uni.showModal({
            title: '支付提示',
            content: '请在 Stripe 支付页完成支付，回到应用后点击“我已支付”刷新体力。',
            confirmText: '我已支付',
            cancelText: '稍后',
            success: (res) => {
              if (res.confirm) {
                this.checkPaymentOrderStatus(orderNo, 0);
              }
            }
          });
        },
        (error) => {
          uni.showToast({ title: error || '创建支付失败', icon: 'none' });
        }
      );
    },

    openStripeCheckout(url) {
      // #ifdef H5
      if (typeof window !== 'undefined') {
        window.location.href = url;
        return;
      }
      // #endif

      // #ifdef APP-PLUS
      if (typeof plus !== 'undefined' && plus.runtime && plus.runtime.openURL) {
        plus.runtime.openURL(url);
        return;
      }
      // #endif

      uni.setClipboardData({
        data: url,
        success: () => {
          uni.showToast({ title: '支付链接已复制', icon: 'none' });
        }
      });
    },

    checkPaymentOrderStatus(orderNo, attempt = 0) {
      if (!this.playerId || !orderNo) return;

      this.fetchPaymentOrderStatus(
        this.playerId,
        orderNo,
        (orderData) => {
          if (orderData?.status === 'paid') {
            if (orderData.lives_state) {
              this.applyLivesPayload(orderData.lives_state);
            } else {
              this.syncLivesFromServer(true);
            }
            this.startLifeRecoveryTicker();
            uni.showToast({ title: '充值到账', icon: 'none' });
            return;
          }

          if (attempt >= 9) {
            uni.showToast({ title: '订单未支付，可稍后重试', icon: 'none' });
            return;
          }

          setTimeout(() => {
            this.checkPaymentOrderStatus(orderNo, attempt + 1);
          }, 2000);
        },
        () => {
          if (attempt >= 2) {
            uni.showToast({ title: '查询订单失败', icon: 'none' });
            return;
          }
          setTimeout(() => {
            this.checkPaymentOrderStatus(orderNo, attempt + 1);
          }, 1500);
        }
      );
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
            this.stopLifeRecoveryTicker();
            this.lifeNextRecoverAtMs = null;
            this.lifeRecoveryCountdownLabel = '';

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
      await this.syncLivesFromServer(true);

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

      try {
        const consumed = await this.consumeLifeForGameStart();
        if (!consumed) return;

        this.lastTime = time;
        this.timeLeft = time;
        this.score = 0;
        this.isLocked = false;
        this.currentWordId = null;
        this.currentWordSource = '';

        this.wordList = await this.buildGameWords(this.selectedCategory, time);

        if (!this.wordList.length) {
          uni.showToast({ title: '词库为空', icon: 'none' });
          return;
        }

        this.gameStatus = 'countdown';
      } finally {
        this.startingGame = false;
      }
    },

    onCountdownDone() {
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

      // Switch word immediately after vibration is triggered.
      this.nextWord();
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
  --menu-top: 36px;
  --energy-align-offset: 22px;
  --energy-left: 40px;
  --energy-pill-padding-y: 10px;
  --energy-pill-padding-x: 15px;
  --energy-pill-height: 66px;
  --energy-circle-size: 48px;
  --energy-center-min-width: 102px;
  --energy-overlap: 16px;
  --energy-border-width: 3px;
  --energy-countdown-size: 14px;
  --energy-icon-size: 24px;
  --energy-count-size: 26px;
  --energy-plus-size: 22px;
  --menu-right: 36px;
  --menu-bottom: 60px;
  --menu-gap: 16rpx;
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
  --menu-top: 27px;
  --energy-align-offset: 18px;
  --energy-left: 24px;
  --energy-pill-padding-y: 8px;
  --energy-pill-padding-x: 12px;
  --energy-pill-height: 58px;
  --energy-circle-size: 42px;
  --energy-center-min-width: 90px;
  --energy-overlap: 14px;
  --energy-border-width: 2px;
  --energy-countdown-size: 12px;
  --energy-icon-size: 22px;
  --energy-count-size: 24px;
  --energy-plus-size: 20px;
  --menu-right: 28px;
  --menu-bottom: 50px;
  --menu-gap: 14rpx;
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
  --menu-top: 38px;
  --energy-align-offset: 24px;
  --energy-pill-height: 70px;
  --energy-circle-size: 52px;
  --energy-center-min-width: 108px;
  --energy-overlap: 17px;
  --energy-border-width: 3px;
  --energy-countdown-size: 15px;
  --game-word-font-size: 60px;
  --game-word-min-height: 220px;
  --game-info-value-size: 34px;
  --history-max-height: 320px;
}
</style>
