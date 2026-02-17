<template>
  <view class="modal-overlay">
    <PaperCard modifier="auth">
      <text class="card-main-title">{{ isRegister ? '注册' : '登录' }}</text>
      <text class="card-subtitle">{{ isRegister ? '创建你的游戏账号' : '欢迎回来' }}</text>

      <view class="auth-form">
        <text class="input-label">用户名:</text>
        <input
          class="name-input"
          :value="username"
          @input="$emit('update:username', $event.detail.value)"
          placeholder="输入用户名"
          maxlength="20"
        />

        <text class="input-label" style="margin-top: 10px;">密码:</text>
        <input
          class="name-input"
          :value="password"
          @input="$emit('update:password', $event.detail.value)"
          placeholder="输入密码"
          maxlength="32"
          password
        />

        <!-- Confirm password for register mode -->
        <template v-if="isRegister">
          <text class="input-label" style="margin-top: 10px;">确认密码:</text>
          <input
            class="name-input"
            :value="confirmPassword"
            @input="$emit('update:confirmPassword', $event.detail.value)"
            placeholder="再次输入密码"
            maxlength="32"
            password
          />
        </template>
      </view>

      <text v-if="error" class="auth-error">{{ error }}</text>
      <text v-if="success" class="auth-success">{{ success }}</text>

      <view class="card-buttons">
        <SketchButton type="primary" @click="$emit('submit')">
          {{ isRegister ? '注册' : '登录' }}
        </SketchButton>
        <view class="cancel-link" @click="$emit('switch')">
          {{ isRegister ? '已有账号? 点击登录' : '新玩家? 点击注册' }}
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
    username: String,
    password: String,
    confirmPassword: String,
    error: String,
    success: String
  },
  emits: ['update:username', 'update:password', 'update:confirmPassword', 'submit', 'switch']
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
  margin-bottom: 12px;
}

.auth-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 8px 0;
}

.input-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 6px;
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

.auth-error {
  color: #dc2626;
  font-size: 13px;
  margin: 6px 0;
}

.auth-success {
  color: #16a34a;
  font-size: 13px;
  margin: 6px 0;
}

.card-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.cancel-link {
  color: #999;
  font-size: 14px;
  text-decoration: underline;
}
</style>
