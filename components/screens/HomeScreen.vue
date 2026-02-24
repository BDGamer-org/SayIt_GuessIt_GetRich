<template>
  <view class="home-screen">
    <image class="bg-image" src="/static/button.png" mode="widthFix" />
    <image class="direction-left-image" src="/static/directionLeft.png" mode="widthFix" />
    <image class="direction-image" src="/static/direction.png" mode="widthFix" />
    <view class="energy-pill-wrapper">
      <EnergyPill :count="lives" @add="$emit('addEnergy')" />
    </view>
    <RightMenu
      @history="$emit('showHistory')"
      @sound="$emit('toggleSound')"
      @share="$emit('share')"
      @logout="$emit('logout')"
    />

    <view class="scroll-area">
      <view
        class="slide-handle left"
        :class="{ disabled: startIndex <= 0 }"
        @click="slideToPrev"
      >
        <text class="rounded-chevron">&lt;</text>
      </view>
      <scroll-view
        class="category-scroll"
        scroll-x="true"
        show-scrollbar="false"
        scroll-with-animation="true"
        :scroll-left="scrollLeft"
        @scroll="onCategoryScroll"
      >
        <view class="card-container">
          <view
            v-for="(item, index) in categories"
            :id="`category-${index}`"
            :key="item.key"
            class="category-card"
            :class="{
              active: item.enabled && selectedCategory === item.key,
              placeholder: !item.enabled
            }"
            @click="handleCategoryClick(item)"
          >
            <view class="card-sketch" :class="{ dashed: !item.enabled }">
              <text class="card-title">{{ item.label }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
      <view
        class="slide-handle right"
        :class="{ disabled: startIndex >= maxStartIndex }"
        @click="slideToNext"
      >
        <text class="rounded-chevron">&gt;</text>
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
  data() {
    return {
      startIndex: 0,
      visibleCardCount: 3,
      scrollLeft: 0,
      cardStepPx: 240,
      categories: [
        { key: 'idiom', label: '中华成语', enabled: true },
        { key: 'life', label: '日常生活', enabled: true },
        { key: 'star', label: '明星艺人', enabled: false },
        { key: 'city', label: '猜猜城市', enabled: false },
        { key: 'movie', label: '影视作品', enabled: false }
      ]
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.measureCardStep();
    });
  },
  computed: {
    maxStartIndex() {
      return Math.max(0, this.categories.length - 1);
    }
  },
  methods: {
    measureCardStep() {
      if (typeof uni.createSelectorQuery !== 'function') return;
      const query = uni.createSelectorQuery().in(this);
      query.select('.category-card').boundingClientRect();
      query.select('.card-container').fields({ computedStyle: ['gap'] });
      query.exec((res = []) => {
        const cardRect = res[0];
        const styleInfo = res[1] || {};
        const gapValue = Number.parseFloat((styleInfo.computedStyle && styleInfo.computedStyle.gap) || '40');
        if (cardRect && cardRect.width) {
          this.cardStepPx = cardRect.width + (Number.isFinite(gapValue) ? gapValue : 40);
        }
      });
    },
    handleCategoryClick(item) {
      if (!item.enabled) return;
      this.$emit('select', item.key);
    },
    onCategoryScroll(event) {
      const left = Number(event && event.detail ? event.detail.scrollLeft : 0);
      if (!Number.isFinite(left)) return;
      this.scrollLeft = left;
      if (!this.cardStepPx) return;
      const nextIndex = Math.max(0, Math.min(this.maxStartIndex, Math.round(left / this.cardStepPx)));
      if (nextIndex !== this.startIndex) {
        this.startIndex = nextIndex;
      }
    },

    slideToNext() {
      if (this.startIndex >= this.maxStartIndex) return;
      const nextIndex = Math.min(this.startIndex + this.visibleCardCount, this.maxStartIndex);
      this.startIndex = nextIndex;
      this.scrollLeft = this.cardStepPx * nextIndex;
    },
    slideToPrev() {
      if (this.startIndex <= 0) return;
      const nextIndex = Math.max(this.startIndex - this.visibleCardCount, 0);
      this.startIndex = nextIndex;
      this.scrollLeft = this.cardStepPx * nextIndex;
    }
  },
  emits: ['select', 'showHistory', 'toggleSound', 'share', 'addEnergy', 'logout']
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
  bottom: 15%;
  right: -3%;
  width: 75%;
  z-index: 0;
  pointer-events: none;
}

.direction-image {
  position: absolute;
  bottom: 10%;
  right: -51%;
  width: 75%;
  z-index: 1;
  pointer-events: none;
}

.direction-left-image {
  position: absolute;
  bottom: 10%;
  left: -3%;
  width: 75%;
  z-index: 1;
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
  position: relative;
  z-index: 2;
}

.slide-handle {
  width: 68px;
  height: var(--home-card-height, 140px);
  background: transparent;
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 8px;
  flex-shrink: 0;
}

.slide-handle.left {
  left: 0;
}

.slide-handle.disabled {
  opacity: 0.45;
}

.rounded-chevron {
  font-size: 70px;
  font-weight: 900;
  line-height: 1;
  color: #333;
  font-family: 'Arial Rounded MT Bold', 'PingFang SC', sans-serif;
}

.slide-handle.right .rounded-chevron {
  color: transparent;
}

.slide-handle.left .rounded-chevron {
  color: transparent;
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
  justify-content: flex-start;
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
