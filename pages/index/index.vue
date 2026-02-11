<template>
  <view class="container" :style="{backgroundColor: bgColor}">

    <view v-if="gameStatus === 'home'" class="center-box">
      <text class="app-title">你说我猜马上发财</text>
      <text class="sub-title">请选择游戏模式</text>
      <view class="btn-group">
        <button class="main-btn" @click="selectCategory('idiom')">成语猜猜</button>
		<button class="main-btn">生活猜猜（画饼中）</button>
		<button class="main-btn">艺人猜猜（画饼中）</button>
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
      <view class="exit-btn" @click="quitGame">退出</view>

      <text class="timer-text">{{ timeLeft }}s</text>
      <text class="word-text">{{ currentWord }}</text>
      
      <view class="debug-info">
        <text style="font-size: 20px; font-weight: bold;">{{ motionStatus }}</text>
        <text style="font-size: 14px; opacity: 0.8; margin-top: 5px;">{{ debugValue }}</text>
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
        gameStatus: 'home',
        score: 0,
        timeLeft: 60,
        lastTime: 60,
        currentWord: '准备...',
        wordList: [],
        
        isLocked: false,  
        bgColor: '#3b82f6', 
        
        // 调试显示
        //motionStatus: '请将手机横屏举至额头',
        //debugValue: '传感器准备中...',
        
        // 定时器
        timerInterval: null
      }
    },
    onUnload() {
      this.stopAll();
    },
    methods: {
      selectCategory(type) {
        this.gameStatus = 'setup';
      },

      async startGame(time) {
        this.lastTime = time;
        this.timeLeft = time;
        this.score = 0;
        this.gameStatus = 'playing';
        this.bgColor = '#3b82f6';
        this.motionStatus = '请将手机举至额头';
        this.isLocked = false;
        
        await this.fetchWords();
        this.nextWord();
        
        this.startTimer();
        this.startMotion();
      },

      quitGame() {
        uni.showModal({
          title: '退出',
          content: '确定要结束吗？',
          success: (res) => {
            if (res.confirm) {
              this.stopAll();
              this.gameStatus = 'home';
            }
          }
        });
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
        if(uni.stopAccelerometer) uni.stopAccelerometer();

        // 启动加速度监听
        uni.startAccelerometer({
          interval: 'game',
          success: () => {
            console.log('加速度计启动成功');
            this.debugValue = '正在读取数据...';
            
            // 监听数据变化
            uni.onAccelerometerChange((res) => {
              this.handleAccelerometer(res);
            });
          },
          fail: (err) => {
            console.error('启动失败', err);
            this.debugValue = '启动失败: ' + JSON.stringify(err);
            uni.showToast({title: '请检查手机权限', icon:'none'});
          }
        });
      },

 handleAccelerometer(res) {
         if (this.gameStatus !== 'playing') return;
 
         const z = res.z;
         
         //this.debugValue = `Z轴读数: ${z.toFixed(1)}`;

         if (this.isLocked) {
            if (z > -2 && z < 5) {
              this.isLocked = false;
              this.motionStatus = '请出题...';
              this.bgColor = '#3b82f6';
            }
            return;
         }
         
         //向下扣：正确
         if (z < -5) {
           this.triggerResult(true);
         }
         
         // 向上仰：跳过
         else if (z > 7) {
           this.triggerResult(false);
         }
       },

      triggerResult(isCorrect) {
        this.isLocked = true;
        uni.vibrateShort();

        if (isCorrect) {
          this.score++;
          this.motionStatus = '回答正确! (+1)';
          this.bgColor = '#22c55e';
        } else {
          this.motionStatus = '跳过';
          this.bgColor = '#f59e0b';
        }

        // 延迟切题
        setTimeout(() => {
          this.nextWord();
        }, 500);
      }
    }
  }
</script>

<style>
  .container {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    transition: background-color 0.3s;
    /* 防止刘海屏遮挡 */
    padding-left: 50px; 
    padding-right: 50px;
  }
  
  .center-box, .game-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .exit-btn {
    position: absolute;
    top: 20px;
    left: 20px;
    background: rgba(0,0,0,0.3);
    padding: 8px 15px;
    border-radius: 20px;
    font-size: 14px;
    z-index: 999;
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
    margin-bottom: 40px;
  }

  .debug-info {
    position: absolute;
    bottom: 20px;
    text-align: center;
    display: flex;
    flex-direction: column;
  }

  /* 按钮通用 */
  .btn-group { display: flex; gap: 20px; margin-top: 30px; }
  .time-options { display: flex; gap: 20px; margin: 30px 0; }
  
  .main-btn, .time-btn, .sub-btn {
    background: white;
    color: #333;
    border: none;
    padding: 10px 30px;
    border-radius: 50px;
    font-size: 18px;
    font-weight: bold;
  }
  
  .sub-btn { background: rgba(255,255,255,0.8); }
  
  .app-title { font-size: 40px; font-weight: bold; margin-bottom: 10px; }
  .result-title { font-size: 40px; margin-bottom: 20px; }
  .score-text { font-size: 60px; font-weight: bold; color: #fbbf24; }
  .back-text { text-decoration: underline; opacity: 0.8; margin-top: 10px;}
</style>