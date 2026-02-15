<template>
  <view class="home-screen">
    <EnergyPill :count="5" @add="$emit('addEnergy')" />
    <RightMenu @history="$emit('showHistory')" @sound="$emit('toggleSound')" @settings="$emit('openSettings')" />

    <view class="scroll-area">
      <text class="arrow left">⟨</text>
      <scroll-view class="category-scroll" scroll-x="true" show-scrollbar="false">
        <view class="card-container">
          <view class="category-card active" @click="$emit('select', 'idiom')">
            <view class="card-sketch">
              <text class="card-title">成语</text>
            </view>
          </view>
          <view class="category-card placeholder">
            <view class="card-sketch dashed">
              <text class="card-title">1</text>
            </view>
          </view>
          <view class="category-card placeholder">
            <view class="card-sketch dashed">
              <text class="card-title">2</text>
            </view>
          </view>
        </view>
      </scroll-view>
      <text class="arrow right">⟩</text>
    </view>
  </view>
</template>

<script>
import EnergyPill from '../EnergyPill.vue';
import RightMenu from '../RightMenu.vue';

export default {
  components: { EnergyPill, RightMenu },
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
  padding: 0 20px;
}

.scroll-area {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 800px;
}

.arrow {
  font-size: 24px;
  color: #999;
  padding: 0 8px;
  font-family: monospace;
  flex-shrink: 0;
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
  gap: 24px;
  padding: 10px 0;
}

.category-card {
  display: flex;
  flex-shrink: 0;
}

.card-sketch {
  width: 200px;
  height: 140px;
  background: #fff;
  border: 3px solid #333;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 4px 4px 0 rgba(0,0,0,0.1);
  transform: rotate(-1deg);
}

.card-sketch.dashed {
  border-style: dashed;
  opacity: 0.6;
}

.category-card.active .card-sketch {
  background: #fff9e6;
  transform: rotate(-2deg);
}

.card-title {
  font-size: 48px;
  font-weight: bold;
  color: #333;
  text-align: center;
  line-height: 1;
}
</style>
