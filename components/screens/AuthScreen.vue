<template>
  <view class="auth-bg">
    <image class="auth-bg-img" src="/static/getstart.png" mode="aspectFill" />
    <view class="auth-content">
      <text class="card-main-title">{{ isRegister ? '注册' : '登录' }}</text>

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
      </view>

      <text v-if="error" class="auth-error">{{ error }}</text>
      <text v-if="success" class="auth-success">{{ success }}</text>

      <view class="card-buttons">
        <view class="button-row">
          <SketchButton type="primary" @click="$emit('submit')">
            {{ isRegister ? '注册' : '登录' }}
          </SketchButton>
          <text class="switch-link" @click="$emit('switch')">
            {{ isRegister ? '已有账号? 点击登录' : '新玩家? 点击注册' }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import SketchButton from '../SketchButton.vue';

export default {
  components: { SketchButton },
  props: {
    isRegister: Boolean,
    username: String,
    password: String,
    error: String,
    success: String
  },
  emits: ['update:username', 'update:password', 'submit', 'switch']
}
</script>

<style scoped>
.auth-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  background-color: #f8f6f0;
  background-image:
    linear-gradient(rgba(200, 200, 200, 0.3) 1px, transparent 1px),
    linear-gradient(90deg, rgba(200, 200, 200, 0.3) 1px, transparent 1px);
  background-size: 20px 20px;
}

.auth-bg-img {
  position: absolute;
  width: 120%;
  height: 100%;
  top: 3%;
  left: -6%;
  z-index: 0;
}

.auth-content {
  position: relative;
  z-index: 1;
  width: min(420px, 85%);
  padding: 40px 30px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: transparent;
}

.card-main-title {
  font-family: 'NanBeiSong', 'PingFang SC', sans-serif;
  font-size: var(--modal-title-size, 32px);
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
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
  margin-top: 10px;
}

.button-row {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 42px;
}

.switch-link {
  position: absolute;
  top: 50%;
  left: calc(50% + 60px);
  transform: translateY(-50%);
  white-space: nowrap;
  color: #999;
  font-size: 13px;
  text-decoration: underline;
}
</style>
