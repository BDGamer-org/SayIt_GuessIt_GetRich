<template>
  <view class="energy-pill">
    <text class="icon-flash">⚡</text>
    <text class="energy-count">{{ count }}</text>
    <view class="plus-btn" @click="$emit('add')">+</view>
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
  position: absolute;
  top: 20px;
  left: 40px;
  display: flex;
  align-items: center;
  background: #7dd3fc;
  border: 2px solid #333;
  border-radius: 25px;
  padding: 6px 12px;
  box-shadow: 3px 3px 0 rgba(0,0,0,0.15);
  z-index: 10;
}

.icon-flash {
  font-size: 18px;
  margin-right: 4px;
}

.energy-count {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  -webkit-text-stroke: 1px #333;
  margin-right: 10px;
}

.plus-btn {
  width: 22px;
  height: 22px;
  background: #333;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
}
</style>
