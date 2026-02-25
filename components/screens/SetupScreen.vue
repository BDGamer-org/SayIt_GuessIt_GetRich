<template>
  <view class="modal-overlay">
    <view class="setup-container">
      <!-- Background image -->
      <image class="bg-image" :src="bgImage" mode="widthFix" />

      <!-- Overlay content positioned on top of the background -->
      <view class="overlay-content">
        <!-- "请选择游戏时间" text + time options -->
        <text class="time-label">请选择游戏时间</text>
        <view class="time-options">
          <view class="time-item" :class="{active: selectedTime===60}" @click="$emit('update:selectedTime', 60)">
            <view class="checkbox">{{ selectedTime===60 ? '☑' : '☐' }}</view>
            <text>60s</text>
          </view>
          <view class="time-item" :class="{active: selectedTime===90}" @click="$emit('update:selectedTime', 90)">
            <view class="checkbox">{{ selectedTime===90 ? '☑' : '☐' }}</view>
            <text>90s</text>
          </view>
          <view class="time-item" :class="{active: selectedTime===120}" @click="$emit('update:selectedTime', 120)">
            <view class="checkbox">{{ selectedTime===120 ? '☑' : '☐' }}</view>
            <text>120s</text>
          </view>
        </view>

        <!-- Buttons -->
        <view class="card-buttons">
          <view class="btn btn-start" @click="$emit('start')">开始游戏</view>
          <view class="btn btn-cancel" @click="$emit('cancel')">取消</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    selectedTime: Number,
    categoryLabel: {
      type: String,
      default: '成语'
    }
  },
  emits: ['update:selectedTime', 'start', 'cancel'],
  computed: {
    bgImage() {
      return this.categoryLabel === '日常生活'
        ? '/static/Setuplife.png'
        : '/static/Setupscreen_2.png';
    }
  }
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

.setup-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.bg-image {
  width: 100%;
  position: absolute;
  top: 0;
  left: 5%;
}

/* ======== Overlay content: positioned over the paper area ======== */
.overlay-content {
  position: absolute;
  top: 32%;
  left: 20%;
  right: 17%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.time-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.time-options {
  display: flex;
  justify-content: center;
  gap: 25px;
  margin-bottom: 30px;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  color: #666;
}

.time-item.active {
  color: #f97316;
  font-weight: bold;
}

.checkbox {
  font-size: 18px;
}

/* ======== Buttons ======== */
.card-buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 30px;
  width: 100%;
}

.btn {
  padding: var(--sketch-btn-pad-y, 12px) var(--sketch-btn-pad-x, 28px);
  border: 2px solid #333;
  border-radius: 8px;
  font-size: var(--sketch-btn-font-size, 16px);
  font-weight: bold;
  color: #333;
  box-shadow: 3px 3px 0 rgba(0,0,0,0.1);
  text-align: center;
}

.btn-start {
  background: #77bae6d0;
}

.btn-cancel {
  background: #fef3c7;
}
</style>
