<template>
  <view class="container">
    <!-- Auth Screen -->
    <AuthScreen
      v-if="gameStatus === 'auth'"
      :is-register="authMode === 'register'"
      v-model:temp-name="tempName"
      v-model:backup-code-input="backupCodeInput"
      :error="authError"
      :success="authSuccess"
      @submit="handleAuthSubmit"
      @switch="switchAuthMode"
    />

    <!-- Backup Code Screen -->
    <BackupScreen
      v-if="gameStatus === 'backup'"
      :backup-code="backupCode"
      @continue="goHome"
    />

    <!-- Home Screen -->
    <HomeScreen
      v-if="gameStatus === 'home'"
      @select="selectCategory"
      @show-history="showUserHistory"
      @toggle-sound="toggleSound"
      @open-settings="openSettings"
    />

    <!-- Setup Screen -->
    <SetupScreen
      v-if="gameStatus === 'setup'"
      v-model:selected-time="selectedTime"
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
      :submit-status="submitStatus"
      @restart="restartGame"
      @home="goHome"
      @submit="submitScore"
    />

    <!-- History Screen -->
    <HistoryScreen
      v-if="gameStatus === 'history'"
      :history="userHistory"
      :loading="loading"
      @refresh="refreshHistory"
      @close="gameStatus = 'home'"
    />
  </view>
</template>

<script>
import AuthScreen from '@/components/screens/AuthScreen.vue';
import BackupScreen from '@/components/screens/BackupScreen.vue';
import HomeScreen from '@/components/screens/HomeScreen.vue';
import SetupScreen from '@/components/screens/SetupScreen.vue';
import GameScreen from '@/components/screens/GameScreen.vue';
import ResultScreen from '@/components/screens/ResultScreen.vue';
import HistoryScreen from '@/components/screens/HistoryScreen.vue';
import { useGameApi } from '@/composables/useGameApi.js';
import { useGameLogic } from '@/composables/useGameLogic.js';

export default {
  components: {
    AuthScreen,
    BackupScreen,
    HomeScreen,
    SetupScreen,
    GameScreen,
    ResultScreen,
    HistoryScreen
  },

  setup() {
    const { register, recover, fetchHistory, submitScore: apiSubmitScore } = useGameApi();
    const { fetchWords, startMotion, stopMotion, handleTilt } = useGameLogic();

    return {
      register,
      recover,
      fetchHistory,
      apiSubmitScore,
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
    };
  },

  mounted() {
    this.checkAuth();
  },

  onUnload() {
    this.stopAll();
  },

  methods: {
    // Auth
    checkAuth() {
      try {
        this.playerId = uni.getStorageSync('playerId') || '';
        this.playerName = uni.getStorageSync('playerName') || '';
        this.backupCode = uni.getStorageSync('backupCode') || '';
        this.gameStatus = this.playerId ? 'home' : 'auth';
      } catch (e) {
        this.gameStatus = 'auth';
      }
    },

    handleAuthSubmit() {
      if (this.authMode === 'register') {
        this.handleRegister();
      } else {
        this.handleRecover();
      }
    },

    handleRegister() {
      if (!this.tempName.trim()) {
        this.authError = '请输入名字';
        return;
      }
      this.authError = '';

      this.register(
        this.tempName,
        (data) => {
          this.playerId = data.player_id;
          this.playerName = data.player_name;
          this.backupCode = data.backup_code;

          uni.setStorageSync('playerId', this.playerId);
          uni.setStorageSync('playerName', this.playerName);
          uni.setStorageSync('backupCode', this.backupCode);

          this.gameStatus = 'backup';
        },
        (error) => {
          this.authError = error;
        }
      );
    },

    handleRecover() {
      if (!this.backupCodeInput.trim()) {
        this.authError = '请输入备份码';
        return;
      }
      this.authError = '';

      this.recover(
        this.backupCodeInput,
        (data) => {
          this.playerId = data.player_id;
          this.playerName = data.player_name;

          uni.setStorageSync('playerId', this.playerId);
          uni.setStorageSync('playerName', this.playerName);

          this.authSuccess = '恢复成功!';
          setTimeout(() => this.goHome(), 1000);
        },
        (error) => {
          this.authError = error;
        }
      );
    },

    switchAuthMode() {
      this.authMode = this.authMode === 'register' ? 'recover' : 'register';
      this.authError = '';
      this.authSuccess = '';
    },

    // Navigation
    goHome() {
      this.submitStatus = '';
      this.authSuccess = '';
      this.authError = '';
      this.tempName = '';
      this.backupCodeInput = '';
      this.gameStatus = 'home';
    },

    selectCategory(type) {
      if (type === 'idiom') {
        this.gameStatus = 'setup';
      }
    },

    toggleSound() {
      uni.showToast({ title: '声音开关', icon: 'none' });
    },

    openSettings() {
      uni.showToast({ title: '设置', icon: 'none' });
    },

    // Game
    startGame(time) {
      this.lastTime = time;
      this.timeLeft = time;
      this.score = 0;
      this.submitStatus = '';
      this.gameStatus = 'playing';
      this.isLocked = false;

      this.wordList = this.fetchWords();
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
      this.submitStatus = '';
      this.startGame(this.lastTime);
    },

    stopAll() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.stopMotion();
    },

    endGame() {
      this.stopAll();
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

    // API
    submitScore() {
      if (!this.playerId) {
        this.submitStatus = '请先登录';
        return;
      }

      this.submitStatus = '上传中...';

      this.apiSubmitScore(
        this.playerId,
        this.score,
        () => {
          this.submitStatus = '上传成功!';
          setTimeout(() => this.showUserHistory(), 1000);
        },
        (error) => {
          this.submitStatus = error;
        }
      );
    },

    fetchUserHistory() {
      if (!this.playerId) {
        this.userHistory = [];
        return;
      }

      this.loading = true;
      this.fetchHistory(
        this.playerId,
        (data) => {
          this.userHistory = data;
          this.loading = false;
        },
        (error) => {
          uni.showToast({ title: error, icon: 'none' });
          this.loading = false;
        }
      );
    },

    showUserHistory() {
      this.gameStatus = 'history';
      this.fetchUserHistory();
    },

    refreshHistory() {
      this.fetchUserHistory();
    }
  }
};
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
</style>
