<template>
  <view class="game-screen">
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

    <view class="quit-btn" @click="$emit('quit')">✕</view>
  </view>
</template>

<script>
export default {
  props: {
    timeLeft: Number,
    score: Number,
    currentWord: String
  },
  emits: ['quit']
}
</script>

<style scoped>
.game-screen {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--game-screen-padding-y, 20px) var(--game-screen-padding-x, 40px);
}

.game-header {
  position: absolute;
  top: var(--game-header-top, 20px);
  left: var(--game-screen-padding-x, 40px);
  right: var(--game-screen-padding-x, 40px);
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
  font-size: var(--game-info-value-size, 32px);
  font-weight: bold;
  color: #333;
}

.word-card {
  width: 80%;
  max-width: 500px;
  min-height: var(--game-word-min-height, 200px);
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
  font-size: var(--game-word-font-size, 56px);
  font-weight: bold;
  color: #333;
  letter-spacing: var(--game-word-letter-spacing, 8px);
}

.quit-btn {
  position: absolute;
  bottom: calc(var(--edge-gap, 20px) + 10px);
  right: calc(var(--edge-gap, 20px) + 10px);
  width: var(--game-quit-size, 40px);
  height: var(--game-quit-size, 40px);
  background: rgba(255,255,255,0.8);
  border: 2px solid #333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--game-quit-font-size, 18px);
  color: #666;
}
</style>
