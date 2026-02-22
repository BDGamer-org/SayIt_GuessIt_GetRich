<template>
  <view class="energy-pill">
    <view class="circle-btn left-btn">
      <image class="icon-img" src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23FFFFFF' stroke='%23000000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M13 2L3 14h9l-1 8 10-12h-9l1-8z'/%3E%3C/svg%3E"></image>
    </view>
    <view class="center-tube">
      <text class="energy-count">{{ count }}</text>
    </view>
    <view class="circle-btn right-btn" @click="$emit('add')">
      <image class="icon-img" src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpolygon fill='%23FFFFFF' stroke='%23000000' stroke-width='2' stroke-linejoin='round' points='9,2 15,2 15,9 22,9 22,15 15,15 15,22 9,22 9,15 2,15 2,9 9,9'/%3E%3C/svg%3E"></image>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    count: {
      type: Number,
      default: 5
    }
  },
  emits: ['add']
}
</script>

<style scoped>
.energy-pill {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 48rpx;
  position: relative;
}

.circle-btn {
  width: 34rpx;
  height: 34rpx;
  background-color: #77bae6d0;
  border: 3rpx solid #000000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 1rpx 1rpx 0px rgba(0,0,0,0.2);
  flex-shrink: 0;
}

.left-btn {
  margin-right: -20rpx;
}

.right-btn {
  margin-left: -20rpx;
}

.icon-img {
  width: 20rpx;
  height: 20rpx;
}

.plus-icon {
  font-size: 36rpx;
  line-height: 1;
  color: #FFFFFF;
  font-weight: 900;
  -webkit-text-stroke: 3rpx #000000;
  margin-top: -2rpx;
}

.center-tube {
  height: 34rpx;
  min-width: 56rpx;
  padding: 0 16rpx;
  background-color: #FFFFFF;
  border-top: 3rpx solid #000000;
  border-bottom: 3rpx solid #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.energy-count {
  font-family: 'Long Cang', 'Rubik', 'PingFang SC', sans-serif;
  font-size: 22rpx;
  color: #333;
  font-weight: 900;
}
</style>
