<template>
  <view class="right-menu">
    <view class="menu-icon" @click="$emit('history')">📋</view>
    <view class="menu-icon" @click="$emit('sound')">🔊</view>
    <view class="menu-icon" @click="$emit('settings')">⚙️</view>
  </view>
</template>

<script>
export default {
  emits: ['history', 'sound', 'settings']
}
</script>

<style scoped>
.right-menu {
  position: absolute;
  right: 20px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 10;
}

.menu-icon {
  width: 44px;
  height: 44px;
  background: #fff;
  border: 2px solid #333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 2px 2px 0 rgba(0,0,0,0.1);
}
</style>
