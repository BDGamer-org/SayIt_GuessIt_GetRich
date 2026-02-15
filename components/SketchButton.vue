<template>
  <view class="sketch-btn" :class="type" @click="$emit('click')">
    <slot />
  </view>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: '' // '', 'primary', 'secondary'
    }
  },
  emits: ['click']
}
</script>

<style scoped>
.sketch-btn {
  padding: 12px 28px;
  background: #fff;
  border: 2px solid #333;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  box-shadow: 3px 3px 0 rgba(0,0,0,0.1);
  text-align: center;
}

.sketch-btn.primary {
  background: #facc15;
}

.sketch-btn.secondary {
  background: #f3f4f6;
}
</style>
