<template>
  <view class="container" :style="{backgroundColor: bgColor}">

    <view v-if="gameStatus === 'home'" class="center-box">
      <text class="app-title">你说我猜马上发财</text>
      <text class="sub-title">请选择游戏模式</text>
      
      <view class="btn-group">
        <button class="main-btn" @click="selectCategory('idiom')">成语猜猜</button>
        <button class="main-btn disabled">常识猜猜 (画饼中)</button>
      </view>
    </view>

    <view v-if="gameStatus === 'setup'" class="center-box">
      <text class="sub-title">当前模式：成语猜猜</text>
      <text class="hint">请选择游戏时长</text>
      
      <view class="time-options">
        <button class="time-btn" @click="startGame(60)">60 秒</button>
        <button class="time-btn" @click="startGame(120)">120 秒</button>
		<button class="time-btn" @click="startGame(120)">180 秒</button>
      </view>
      
      <text class="back-text" @click="gameStatus = 'home'">返回上一级</text>
    </view>

    <view v-if="gameStatus === 'playing'" class="game-area">
      <view class="exit-btn" @click="quitGame">❌ 退出</view>

      <text class="timer-text">{{ timeLeft }}s</text>
      
      <text class="word-text">{{ currentWord }}</text>
      
      <view class="debug-info">
        <text>{{ motionStatus }}</text>
        <text style="font-size: 12px; opacity: 0.7;">{{ debugValue }}</text>
      </view>
    </view>

    <view v-if="gameStatus === 'result'" class="center-box">
      <text class="result-title">时间到！</text>
      <text class="score-text">最终得分: {{ score }}</text>
      
      <view class="btn-group">
        <button class="main-btn" @click="restartGame">再来一局</button>
        <button class="sub-btn" @click="gameStatus = 'home'">回到首页</button>
      </view>
    </view>

  </view>
</template>

<script>
  import idiomData from '@/static/data/idioms.js';

  export default {
    data() {
      return {
        gameStatus: 'home', // home, setup, playing, result
        score: 0,
        timeLeft: 60,
        lastTime: 60,       // 记住上次选的时间
        currentWord: '准备...',
        wordList: [],
        
        // 传感器相关
        isLocked: false,
        bgColor: '#3b82f6', // 默认蓝色
        
        // 调试相关
        motionStatus: '等待信号...',
        debugValue: '传感器初始化中...',
        
        // 定时器引用
        timerInterval: null
      }
    },
    onUnload() {
      this.stopAll();
    },
    methods: {
      // --- 流程控制 ---
      selectCategory(type) {
        this.gameStatus = 'setup';
      },

      async startGame(time) {
        this.lastTime = time; // 记住时间
        this.timeLeft = time;
        this.score = 0;
        this.gameStatus = 'playing';
        this.bgColor = '#3b82f6';
        this.motionStatus = '请将手机举至额头';
        
        await this.fetchWords();
        this.nextWord();
        
        this.startTimer();
        this.startMotion(); // 启动核心
      },

      // 【新增】中途退出
      quitGame() {
        // 弹窗确认一下
        uni.showModal({
          title: '退出游戏',
          content: '确定要结束这一局吗？',
          success: (res) => {
            if (res.confirm) {
              this.stopAll();
              this.gameStatus = 'home';
            }
          }
        });
      },

      // 【修复】再来一局
      restartGame() {
        this.startGame(this.lastTime);
      },

      stopAll() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        uni.stopDeviceMotionListening();
      },

      endGame() {
        this.stopAll();
        // 强制确保状态切换
        this.$nextTick(() => {
          this.gameStatus = 'result';
        });
        // 震动提示结束
        uni.vibrateLong();
      },

      // --- 核心逻辑 ---
      async fetchWords() {
        let allWords = [...idiomData];
        // 简单洗牌
        this.wordList = allWords.sort(() => Math.random() - 0.5);
      },

      nextWord() {
        if (this.wordList.length === 0) {
          this.endGame();
          return;
        }
        const w = this.wordList.pop();
        // 兼容你的数据字段 (word / word_id)
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

      // --- 传感器逻辑 (重写增强版) ---
      startMotion() {
        // 1. 先停止之前的，防止冲突
        uni.stopDeviceMotionListening();

        // 2. 启动监听
        // 安卓建议用 'game' 频率，兼容性更好
        uni.startDeviceMotionListening({
          interval: 'game', 
          success: () => {
            console.log('传感器启动成功');
            this.debugValue = '传感器已启动，等待数据...';
            
            uni.onDeviceMotionChange((res) => {
              this.handleSensor(res);
            });
          },
          fail: (err) => {
            console.error('传感器启动失败', err);
            this.debugValue = '启动失败: ' + JSON.stringify(err);
            uni.showToast({ title: '传感器启动失败，请检查权限', icon: 'none' });
          }
        });
      },

      handleSensor(res) {
        if (this.gameStatus !== 'playing') return;

        // 打印两个轴的数据，让你看清楚
        const beta = res.beta || 0;
        const gamma = res.gamma || 0;
        
        // 实时显示在屏幕上
        this.debugValue = `B:${beta.toFixed(0)} | G:${gamma.toFixed(0)}`;

        // --- 这里请根据你刚才记录的数值修改 ---
        // 只要数值在变，就说明通了！
        
        // 下面是一个通用的猜测逻辑 (你可以根据实际显示的数值改)
        // 假设看 Beta 轴
        const val = beta; 

        if (this.isLocked) {
          // 归位检测 (假设归位是 90度)
          if (val > 70 && val < 110) {
            this.isLocked = false;
            this.motionStatus = '准备就绪';
            this.bgColor = '#3b82f6'; // 变回蓝
          }
          return;
        }

        // 判定逻辑
        // 向下扣 (假设 > 150)
        if (val > 150) {
          this.triggerResult(true);
        } 
        // 向上仰 (假设 < 30)
        else if (val < 30) {
          this.triggerResult(false);
        }
      },

      triggerResult(isCorrect) {
        this.isLocked = true;
        uni.vibrateShort();

        if (isCorrect) {
          this.score++;
          this.motionStatus = '正确! (+1)';
          this.bgColor = '#22c55e'; // 绿
        } else {
          this.motionStatus = '跳过';
          this.bgColor = '#f59e0b'; // 黄
        }

        setTimeout(() => {
          this.nextWord();
          // 颜色恢复蓝色移到这里，防止闪烁
          // this.bgColor = '#3b82f6'; 
        }, 800);
      }
    }
  }
</script>

<style>
  /* 基础布局 */
  .container {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    transition: background-color 0.3s;
  }
  
  .center-box {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* 游戏区域 */
  .game-area {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  /* 退出按钮 */
  .exit-btn {
    position: absolute;
    top: 20px;
    left: 20px;
    background: rgba(0,0,0,0.3);
    padding: 8px 15px;
    border-radius: 20px;
    font-size: 14px;
    z-index: 100;
  }

  .timer-text {
    position: absolute;
    top: 20px;
    right: 20px;
    font-size: 24px;
    font-weight: bold;
  }

  .word-text {
    font-size: 80px;
    font-weight: bold;
    text-align: center;
    line-height: 1.2;
    padding: 0 20px;
  }

  .debug-info {
    position: absolute;
    bottom: 20px;
    text-align: center;
    display: flex;
    flex-direction: column;
  }

  /* 按钮样式 */
  .btn-group { display: flex; gap: 20px; margin-top: 30px; }
  .time-options { display: flex; gap: 20px; margin: 30px 0; }
  
  .main-btn, .time-btn, .sub-btn {
    background: white;
    color: #333;
    border: none;
    padding: 10px 30px;
    border-radius: 50px;
    font-size: 18px;
  }
  
  .sub-btn { background: rgba(255,255,255,0.8); }
  .disabled { opacity: 0.5; }
  
  .app-title { font-size: 40px; font-weight: bold; margin-bottom: 10px; }
  .result-title { font-size: 40px; margin-bottom: 20px; }
  .score-text { font-size: 60px; font-weight: bold; color: #fbbf24; }
  .back-text { text-decoration: underline; opacity: 0.8; margin-top: 10px;}
</style>