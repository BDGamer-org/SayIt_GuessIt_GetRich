<template>
  <view class="countdown-screen">
    <!-- Background image -->
    <image class="bg-image" src="/static/wait.png" mode="widthFix" />

    <!-- Countdown number -->
    <text class="countdown-number">{{ count }}</text>

    <!-- Instruction texts -->
    <view class="instructions">
      <text class="instruction-text left">跳过向上翻手机</text>
      <text class="instruction-text right">答对向下翻手机</text>
    </view>
  </view>
</template>

<script>
export default {
  emits: ['done'],
  data() {
    return {
      count: 3
    };
  },
  mounted() {
    this.timer = setInterval(() => {
      this.count--;
      if (this.count <= 0) {
        clearInterval(this.timer);
        this.$emit('done');
      }
    }, 1000);
  },
  beforeUnmount() {
    if (this.timer) clearInterval(this.timer);
  }
}
</script>

<style scoped>
.countdown-screen {
  width: 100%;
  height: 100%;
  position: relative;
}

.countdown-number {
  position: absolute;
  top: 5%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 120px;
  font-weight: 900;
  color: #f9d2a8;
  text-shadow: 3px 3px 0 rgba(0,0,0,0.08);
  animation: pulse 1s ease-in-out infinite;
}

.bg-image {
  position: absolute;
  top: 5%;
  left: 52%;
  transform: translateX(-50%);
  width: 100%;
}

@keyframes pulse {
  0% { transform: scale(0.6); opacity: 0.3; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
}

.instructions {
  position: absolute;
  bottom: 18%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 10%;
}

.instruction-text {
  font-size: 15px;
  font-weight: bold;
  color: #666;
}
</style>
