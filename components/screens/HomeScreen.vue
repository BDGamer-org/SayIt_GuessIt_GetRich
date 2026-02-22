<template>
  <view class="home-screen">
    <image class="bg-image" src="/static/button.png" mode="widthFix" />
    <view class="energy-pill-wrapper">
      <EnergyPill :count="lives" @add="$emit('addEnergy')" />
    </view>
    <RightMenu @history="$emit('showHistory')" @sound="$emit('toggleSound')" @logout="$emit('logout')" />

    <view class="scroll-area">
      <view class="slide-handle left">
        <view class="rounded-chevron left"></view>
      </view>
      <scroll-view class="category-scroll" scroll-x="true" show-scrollbar="false">
        <view class="card-container">
          <view
            class="category-card"
            :class="{ active: selectedCategory === 'idiom' }"
            @click="$emit('select', 'idiom')"
          >
            <view class="card-sketch">
              <text class="card-title">中华成语</text>
            </view>
          </view>
          <view
            class="category-card"
            :class="{ active: selectedCategory === 'life' }"
            @click="$emit('select', 'life')"
          >
            <view class="card-sketch">
              <text class="card-title">日常生活</text>
            </view>
          </view>
          <view class="category-card placeholder">
            <view class="card-sketch dashed">
              <text class="card-title">明星艺人</text>
            </view>
          </view>
        </view>
      </scroll-view>
      <view class="slide-handle right">
        <view class="rounded-chevron right"></view>
      </view>
    </view>
  </view>
</template>

<script>
import EnergyPill from '../EnergyPill.vue';
import RightMenu from '../RightMenu.vue';

export default {
  components: { EnergyPill, RightMenu },
  props: {
    selectedCategory: {
      type: String,
      default: 'idiom'
    },
    lives: {
      type: Number,
      default: 5
    }
  },
  emits: ['select', 'showHistory', 'toggleSound', 'addEnergy', 'logout']
}
</script>

<style scoped>
.home-screen {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0 var(--home-horizontal-padding, 20px);
  position: relative;
}

.bg-image {
  position: absolute;
  bottom: 10px;
  right: -7%;
  width: 75%;
  z-index: 0;
  pointer-events: none;
}

.energy-pill-wrapper {
  position: absolute;
  top: 24rpx;
  left: 24rpx;
  z-index: 10;
}

.scroll-area {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 800px;
  padding: 0 16px;
}

.slide-handle {
  width: 68px;
  height: var(--home-card-height, 140px);
  background: transparent;
  position: relative;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 8px;
  flex-shrink: 0;
}

.rounded-chevron {
  position: relative;
  width: 52px;
  height: 68px;
}

.rounded-chevron::before,
.rounded-chevron::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 38px;
  box-sizing: border-box;
  background: #fff;
  border: 4px solid #333;
  border-radius: 999px;
}

.rounded-chevron.left::before {
  left: 14px;
  top: 0;
  transform-origin: left center;
  transform: rotate(42deg);
}

.rounded-chevron.left::after {
  left: 14px;
  bottom: 0;
  transform-origin: left center;
  transform: rotate(-48deg);
}

.rounded-chevron.right::before {
  right: 14px;
  top: 0;
  transform-origin: right center;
  transform: rotate(-42deg);
}

.rounded-chevron.right::after {
  right: 14px;
  bottom: 0;
  transform-origin: right center;
  transform: rotate(48deg);
}

.category-scroll {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  position: relative;
  z-index: 1;
}

.card-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 40px;
  padding: 10px 28px;
}

.category-card {
  position: relative;
  display: flex;
  flex-shrink: 0;
  z-index: 0;
}

.category-card::before {
  content: '';
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  transform: translate(-8px, 8px);
  border: 2px solid #333;
  border-radius: 14px;
  background-color: rgba(200, 200, 200, 0.3);
  background-image: repeating-linear-gradient(
    -60deg,
    rgba(0, 0, 0, 0.35) 0 1.5px,
    transparent 1.5px 8px
  );
  pointer-events: none;
  z-index: 0;
}

.card-sketch {
  width: var(--home-card-width, 200px);
  height: var(--home-card-height, 140px);
  background: #fff;
  border: 3px solid #333;
  border-radius: 14px;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: none;
  transform: none;
}

.card-sketch::after {
  content: '';
  position: absolute;
  left: 3px;
  right: 3px;
  top: 3px;
  bottom: 3px;
  background-image:
    repeating-linear-gradient(
      to bottom,
      #f97316 0 10px,
      transparent 10px 15px,
      #f97316 15px 32px,
      transparent 32px 38px,
      #f97316 38px 44px,
      transparent 44px 50px,
      #f97316 50px 67px,
      transparent 67px 72px,
      #f97316 72px 82px,
      transparent 82px 88px
    ),
    repeating-linear-gradient(
      to right,
      transparent 0 14px,
      #f97316 14px 24px,
      transparent 24px 29px,
      #f97316 29px 46px,
      transparent 46px 52px,
      #f97316 52px 58px,
      transparent 58px 64px,
      #f97316 64px 81px,
      transparent 81px 86px,
      #f97316 86px 96px,
      transparent 96px 102px
    );
  background-size: 2px 100%, 100% 2px;
  background-position: left top, left bottom;
  background-repeat: no-repeat, no-repeat;
  pointer-events: none;
}

.card-sketch::before {
  content: '';
  position: absolute;
  left: 3px;
  bottom: 3px;
  width: 12px;
  height: 12px;
  border-left: 2px solid #f97316;
  border-bottom: 2px solid #f97316;
  border-bottom-left-radius: 12px;
  pointer-events: none;
}

.card-sketch.dashed {
  border-style: dashed;
  opacity: 0.6;
}

.card-sketch.dashed::after {
  display: none;
}

.category-card.active .card-sketch {
  background: #fff;
  transform: none;
}

.card-title {
  font-family: 'Long Cang', 'PingFang SC', sans-serif;
  font-size: var(--home-card-title-size, 48px);
  font-weight: bold;
  color: #333;
  text-align: center;
  line-height: 1;
}
</style>
