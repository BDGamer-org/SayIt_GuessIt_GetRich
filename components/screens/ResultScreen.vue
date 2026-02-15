<template>
  <view class="modal-overlay">
    <PaperCard modifier="result">
      <text class="card-main-title">结算</text>

      <view class="result-section">
        <text class="result-label">答对总数:</text>
        <text class="result-value">{{ score }}</text>
      </view>

      <text v-if="submitStatus" class="submit-status">{{ submitStatus }}</text>

      <view class="result-buttons">
        <SketchButton @click="$emit('restart')">再来一局</SketchButton>
        <SketchButton type="secondary" @click="$emit('home')">退出</SketchButton>
        <SketchButton type="primary" @click="$emit('submit')">上传分数</SketchButton>
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
    score: Number,
    submitStatus: String
  },
  emits: ['restart', 'home', 'submit']
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
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.result-section {
  margin: 15px 0;
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

.submit-status {
  font-size: 14px;
  color: #666;
  margin: 10px 0;
}

.result-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}
</style>
