<template>
  <view class="right-menu">
    <view class="menu-icon" @click="$emit('history')">📋</view>
    <view class="menu-icon" @click="$emit('sound')">🔊</view>
    <view class="menu-icon" @click="$emit('settings')">⚙️</view>
    <view class="menu-icon logout" @click="$emit('logout')">🚪</view>
  </view>
</template>

<script>
export default {
  emits: ['history', 'sound', 'settings', 'logout']
}
</script>

<style scoped>
.right-menu {
  position: absolute;
  right: var(--menu-right, 20px);
  bottom: var(--menu-bottom, 20px);
  display: flex;
  flex-direction: column;
  gap: var(--menu-gap, 12px);
  z-index: 10;
}

.menu-icon {
  width: var(--menu-icon-size, 44px);
  height: var(--menu-icon-size, 44px);
  background: #fff;
  border: 2px solid #333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--menu-icon-font-size, 20px);
  box-shadow: 2px 2px 0 rgba(0,0,0,0.1);
}
</style>
