<template>
  <view class="modal-overlay">
    <PaperCard modifier="backup">
      <text class="card-main-title">保存备份码</text>
      <text class="card-subtitle">换设备或重装时需要用到</text>

      <view class="backup-code-display">
        <text class="backup-code">{{ backupCode }}</text>
      </view>

      <text class="input-hint warning">请截图保存或记住此代码!</text>

      <view class="card-buttons">
        <SketchButton type="primary" @click="$emit('continue')">
          我已保存，开始游戏
        </SketchButton>
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
    backupCode: String
  },
  emits: ['continue']
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

.card-subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 25px;
}

.backup-code-display {
  background: #facc15;
  padding: 20px 40px;
  border: 3px solid #333;
  border-radius: 8px;
  margin: 20px 0;
}

.backup-code {
  font-family: monospace;
  font-size: 32px;
  font-weight: bold;
  color: #333;
  letter-spacing: 4px;
}

.input-hint {
  font-size: 12px;
  color: #999;
  margin-top: 10px;
  text-align: center;
}

.input-hint.warning {
  color: #ea580c;
  font-weight: bold;
}

.card-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 15px;
}
</style>
