<template>
  <view class="modal-overlay">
    <view class="result-container">
      <!-- Background image -->
      <image class="bg-image" src="/static/result.png" mode="widthFix" />

      <!-- Overlay content -->
      <view class="overlay-content">
        <view class="result-section">
          <text class="result-label">答对总数:</text>
          <text class="result-value">{{ score }}</text>
        </view>

        <view class="result-buttons">
          <view class="btn btn-restart" @click="$emit('restart')">再来一局</view>
          <view class="btn btn-home" @click="$emit('home')">退出</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    score: Number
  },
  emits: ['restart', 'home']
}
</script>

<style scoped>
.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 50;
}

.result-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.bg-image {
  width: 100%;
  position: absolute;
  top: 0;
  left: 8%;
}

/* ======== Overlay content ======== */
.overlay-content {
  position: absolute;
  top: 30%;
  left: 20%;
  right: 15%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.result-section {
  margin-bottom: 15px;
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

/* ======== Buttons ======== */
.result-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 15px;
}

.btn {
  padding: 10px 24px;
  border: 2px solid #333;
  border-radius: 8px;
  font-size: 15px;
  font-weight: bold;
  color: #333;
  box-shadow: 3px 3px 0 rgba(0,0,0,0.1);
  text-align: center;
}

.btn-restart {
  background: #77bae6d0;
}

.btn-home {
  background: #fef3c7;
}

</style>
