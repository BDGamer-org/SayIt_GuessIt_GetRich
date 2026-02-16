<template>
  <view class="home-screen">
    <EnergyPill :count="5" @add="$emit('addEnergy')" />
    <RightMenu @history="$emit('showHistory')" @sound="$emit('toggleSound')" @settings="$emit('openSettings')" />

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
    }
  },
  emits: ['select', 'showHistory', 'toggleSound', 'openSettings', 'addEnergy']
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
  width: 34px;
  height: var(--home-card-height, 140px);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 8px;
  flex-shrink: 0;
}

.rounded-chevron {
  position: relative;
  width: 22px;
  height: 34px;
}

.rounded-chevron::before,
.rounded-chevron::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 20px;
  background: #333;
  border-radius: 999px;
}

.rounded-chevron.left::before {
  left: 8px;
  top: -1px;
  transform-origin: left center;
  transform: rotate(45deg);
}

.rounded-chevron.left::after {
  left: 8px;
  bottom: -1px;
  transform-origin: left center;
  transform: rotate(-45deg);
}

.rounded-chevron.right::before {
  right: 8px;
  top: -1px;
  transform-origin: right center;
  transform: rotate(-45deg);
}

.rounded-chevron.right::after {
  right: 8px;
  bottom: -1px;
  transform-origin: right center;
  transform: rotate(45deg);
}

.category-scroll {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
}

.card-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 10px 0;
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
  border-radius: 16px;
  border: 2px solid #333;
  background-color: rgba(200, 200, 200, 0.3);
  background-image: repeating-linear-gradient(
    -60deg,
    rgba(0, 0, 0, 0.35) 0 1.5px,
    transparent 1.5px 8px
  );
  z-index: 0;
  pointer-events: none;
}

.card-sketch {
  width: var(--home-card-width, 200px);
  height: var(--home-card-height, 140px);
  background: #fff;
  border: 3px solid #333;
  border-radius: 16px;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
  transform: none;
}

.card-sketch.dashed {
  border-style: dashed;
  opacity: 0.6;
}

.category-card.active .card-sketch {
  background: #fff;
  transform: none;
}

.card-title {
  font-size: var(--home-card-title-size, 48px);
  font-weight: bold;
  color: #333;
  text-align: center;
  line-height: 1;
}
</style>
