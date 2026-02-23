<template>
  <view class="right-menu">
    <view class="menu-icon" @click="$emit('share')"></view>
    <view class="menu-icon" @click="$emit('history')"></view>
    <view class="menu-icon" @click="$emit('sound')"></view>
    <view class="menu-icon logout" @click="$emit('logout')"></view>
  </view>
</template>

<script>
export default {
  emits: ['history', 'sound', 'share', 'logout']
}
</script>

<style scoped>
.right-menu {
  position: absolute;
  top: 24rpx;
  right: 7%;
  display: flex;
  flex-direction: row;
  gap: var(--menu-gap, 25rpx);
  align-items: center;
  z-index: 10;
}

.menu-icon {
  width: var(--menu-icon-size, 44px);
  height: var(--menu-icon-size, 44px);
  background: transparent;
  border: none;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--menu-icon-font-size, 20px);
  line-height: 1;
}

.menu-icon.logout {
  margin-left: var(--menu-logout-extra-gap, 16rpx);
}
</style>
