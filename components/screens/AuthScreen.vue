<template>
  <view class="modal-overlay">
    <PaperCard modifier="auth">
      <text class="card-main-title">{{ isRegister ? '新玩家' : '恢复账号' }}</text>
      <text class="card-subtitle">{{ isRegister ? '创建你的游戏档案' : '输入备份码恢复记录' }}</text>

      <!-- Register Mode -->
      <view v-if="isRegister" class="auth-form">
        <text class="input-label">你的名字:</text>
        <input class="name-input" :value="tempName" @input="$emit('update:tempName', $event.detail.value)" placeholder="输入昵称" maxlength="12" />
        <text class="input-hint">保存好你的备份码，换设备时需要用到</text>
      </view>

      <!-- Recover Mode -->
      <view v-else class="auth-form">
        <text class="input-label">备份码:</text>
        <input class="name-input backup-input" :value="backupCodeInput" @input="$emit('update:backupCodeInput', $event.detail.value)" placeholder="如: ABC12345" maxlength="8" />
        <text class="input-hint">输入之前保存的8位备份码</text>
      </view>

      <text v-if="error" class="auth-error">{{ error }}</text>
      <text v-if="success" class="auth-success">{{ success }}</text>

      <view class="card-buttons">
        <SketchButton type="primary" @click="$emit('submit')">
          {{ isRegister ? '创建账号' : '恢复记录' }}
        </SketchButton>
        <view class="cancel-link" @click="$emit('switch')">
          {{ isRegister ? '已有备份码? 点击恢复' : '新玩家? 创建账号' }}
        </view>
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
    isRegister: Boolean,
    tempName: String,
    backupCodeInput: String,
    error: String,
    success: String
  },
  emits: ['update:tempName', 'update:backupCodeInput', 'submit', 'switch']
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

.auth-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 15px 0;
}

.input-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.name-input {
  width: 80%;
  max-width: 220px;
  padding: 12px 15px;
  border: 2px solid #333;
  border-radius: 8px;
  font-size: 16px;
  text-align: center;
  background: #fff;
}

.backup-input {
  font-family: monospace;
  font-size: 18px;
  letter-spacing: 2px;
}

.input-hint {
  font-size: 12px;
  color: #999;
  margin-top: 10px;
  text-align: center;
}

.auth-error {
  color: #dc2626;
  font-size: 14px;
  margin: 10px 0;
}

.auth-success {
  color: #16a34a;
  font-size: 14px;
  margin: 10px 0;
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
