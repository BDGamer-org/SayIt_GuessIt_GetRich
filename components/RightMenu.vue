<template>
  <view class="right-menu">
    <view class="menu-icon" @click="$emit('history')">📋</view>
    <view class="menu-icon" @click="$emit('sound')">🔊</view>

    <view class="menu-icon logout" @click="$emit('logout')">🚪</view>
  </view>
</template>

<script>
export default {
  emits: ['history', 'sound', 'logout']
}
</script>

<style scoped>
.right-menu {
  position: absolute;
  right: calc(2% + var(--menu-right, 20px));
  bottom: var(--menu-bottom, 20px);
  display: flex;
  flex-direction: column;
  gap: var(--menu-gap, 12px);
  z-index: 10;
}

.menu-icon {
  width: var(--menu-icon-size, 44px);
  height: var(--menu-icon-size, 44px);
  background: transparent;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0;
}
</style>
