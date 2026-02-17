<template>
  <view class="paper-card" :class="modifier">
    <view class="clips">
      <view class="clip"></view>
      <view class="clip"></view>
    </view>
    <view class="card-content">
      <slot />
    </view>
  </view>
</template>

<script>
export default {
  props: {
    modifier: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.paper-card {
  width: var(--paper-card-width, 420px);
  max-width: 85%;
  background: #fff;
  border: 3px solid #333;
  border-radius: 8px;
  position: relative;
  box-shadow: 4px 4px 0 rgba(0,0,0,0.1), inset 0 0 40px rgba(0,0,0,0.02);
  transform: rotate(0.5deg);
}

.paper-card.result {
  transform: rotate(-0.5deg);
}

.paper-card.history,
.paper-card.auth,
.paper-card.backup {
  transform: rotate(0.3deg);
}

.paper-card.auth .card-content {
  padding-top: 25px;
  padding-bottom: 20px;
}

.paper-card::before {
  content: '';
  position: absolute;
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 5px;
  border: 1px dashed rgba(0,0,0,0.2);
  border-radius: 4px;
  pointer-events: none;
}

.clips {
  position: absolute;
  top: -12px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 80px;
}

.clip {
  width: 14px;
  height: 28px;
  background: #555;
  border-radius: 8px;
  border: 2px solid #333;
  position: relative;
}

.clip::after {
  content: '';
  position: absolute;
  top: 50%;
  left: -2px;
  right: -2px;
  height: 2px;
  background: #333;
}

.card-content {
  padding:
    var(--paper-card-padding-top, 40px)
    var(--paper-card-padding-x, 30px)
    var(--paper-card-padding-bottom, 30px);
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
