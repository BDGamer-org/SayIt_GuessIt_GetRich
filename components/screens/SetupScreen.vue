<template>
  <view class="modal-overlay">
    <PaperCard>
      <text class="card-main-title">{{ categoryLabel }}</text>
      <text class="card-subtitle">一人答题 · 一人描述</text>

      <view class="time-section">
        <text class="time-label">选择游戏时间</text>
        <view class="time-options">
          <view class="time-item" :class="{active: selectedTime===60}" @click="$emit('update:selectedTime', 60)">
            <view class="checkbox">{{ selectedTime===60 ? '☑' : '☐' }}</view>
            <text>60s</text>
          </view>
          <view class="time-item" :class="{active: selectedTime===120}" @click="$emit('update:selectedTime', 120)">
            <view class="checkbox">{{ selectedTime===120 ? '☑' : '☐' }}</view>
            <text>120s</text>
          </view>
          <view class="time-item" :class="{active: selectedTime===180}" @click="$emit('update:selectedTime', 180)">
            <view class="checkbox">{{ selectedTime===180 ? '☑' : '☐' }}</view>
            <text>180s</text>
          </view>
        </view>
      </view>

      <view class="card-buttons">
        <SketchButton type="primary" @click="$emit('start')">开始游戏</SketchButton>
        <view class="cancel-link" @click="$emit('cancel')">Cancel</view>
      </view>
    </PaperCard>
  </view>
</template>

<script>
import PaperCard from '../PaperCard.vue';
import SketchButton from '../SketchButton.vue';

export default {
  components: { PaperCard, SketchButton },
  props: {
    selectedTime: Number,
    categoryLabel: {
      type: String,
      default: '成语'
    }
  },
  emits: ['update:selectedTime', 'start', 'cancel']
}
</script>

<style scoped>
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

.card-main-title {
  font-size: var(--modal-title-size, 32px);
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.card-subtitle {
  font-size: var(--modal-subtitle-size, 14px);
  color: #666;
  margin-bottom: 25px;
}

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
}

.time-item.active {
  color: #f97316;
  font-weight: bold;
}

.checkbox {
  font-size: 18px;
}

.card-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 15px;
}

.cancel-link {
  color: #999;
  font-size: 14px;
  text-decoration: underline;
}
</style>
