<template>
  <view class="recharge-bg">
    <view class="recharge-content">

      <view class="recharge-header">
        <SketchButton type="secondary" @click="$emit('close')">返回</SketchButton>
        <view class="header-spacer"></view>
      </view>

      <view class="plans-area">
        <image class="pay-overlay" src="/static/pay.png" mode="widthFix" />
        
        <view class="plan-container">
          <view
            v-for="plan in plans"
            :key="plan.id"
            class="plan-card"
          >
            <view class="price-row">
              <view class="price-main-block">
                <view class="price-main-row">
                  <text class="price-text">{{ plan.priceMain }}</text>
                  <text v-if="plan.priceSuffix" class="price-month">{{ plan.priceSuffix }}</text>
                </view>
                <text v-if="plan.promoText" class="price-promo">{{ plan.promoText }}</text>
              </view>
            </view>

            <text class="get-line">得</text>
            <text class="value-line" :class="{ long: plan.longValue }">
              <text
                v-for="(seg, idx) in plan.valueSegments"
                :key="`${plan.id}-${idx}`"
                :class="{ 'benefit-bold': seg.bold }"
              >{{ seg.text }}</text>
            </text>

            <SketchButton type="primary" @click="choosePlan(plan)">选择</SketchButton>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import SketchButton from '../SketchButton.vue';

export default {
  components: { SketchButton },
  data() {
    return {
      plans: [
        {
          id: 'p1',
          priceMain: '¥6',
          valueSegments: [
            { text: '20', bold: true },
            { text: '生命值' }
          ]
        },
        {
          id: 'p6',
          priceMain: '¥6',
          promoText: '限时优惠！',
          valueSegments: [
            { text: '40', bold: true },
            { text: '生命值' }
          ]
        },
        {
          id: 'p12',
          priceMain: '¥12',
          valueSegments: [
            { text: '120' },
            { text: '生命值' }
          ]
        },
        {
          id: 'p20_month',
          priceMain: '¥20',
          priceSuffix: '/月',
          valueSegments: [
            { text: '一个月无限生命值' }
          ],
          longValue: true
        },
        {
          id: 'p68_permanent',
          priceMain: '¥68',
          valueSegments: [
            { text: '永久无限生命值' }
          ],
          longValue: true
        }
      ]
    };
  },
  methods: {
    choosePlan(plan) {
      this.$emit('choose', { planId: plan.id, method: 'stripe_checkout' });
    }
  },
  emits: ['close', 'choose']
}
</script>

<style scoped>

.recharge-bg,
.recharge-bg view,
.recharge-bg text {
  font-family: 'NanBeiSong', 'PingFang SC', sans-serif !important;
}

.recharge-bg :deep(.sketch-btn) {
  font-family: 'NanBeiSong', 'PingFang SC', sans-serif !important;
}

.recharge-bg {
  position: absolute;
  inset: 0;
  z-index: 40;
  background-color: #f8f6f0;
  background-image:
    linear-gradient(rgba(200, 200, 200, 0.3) 1px, transparent 1px),
    linear-gradient(90deg, rgba(200, 200, 200, 0.3) 1px, transparent 1px);
  background-size: 20px 20px;
  overflow: hidden;
}

.pay-overlay {
  width: 100%; 
  display: block;
  pointer-events: none;
}

.recharge-content {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-top: 28px;
}

.recharge-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-spacer {
  width: 88px;
}

.plans-area {
  position: absolute;
  top: -30%;
  left: 50%;
  width: 130%;
  transform: translateX(-50%);
  z-index: 1;
}

.plan-container {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(5, 1fr); 
  gap: 0; 
  align-items: center; 
  justify-items: center;
  padding-top: 8%; 
  padding-bottom: 15%; 
  padding-left: 21%;
  padding-right: 16%;
}

.plan-card {
  flex: 1 1 0;
  min-width: 0;
  width: auto;
  min-height: clamp(160px, 35vh, 220px);
  padding: clamp(10px, 1.66vh, 15px) clamp(8px, 1.24vw, 12px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  background-color: transparent;
  transform-origin: center center;
}

.price-row {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.price-main-block {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.price-main-row {
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.price-text {
  font-family: 'NanBeiSong', 'PingFang SC', sans-serif;
  font-size: clamp(20px, 2.5vw, 24px);
  font-weight: bold;
  color: #222;
}

.price-promo {
  margin-top: 2px;
  font-family: 'LongCang', 'PingFang SC', sans-serif;
  font-size: clamp(12px, 1.4vw, 14px);
  line-height: 1;
  color: #d93025;
}

.price-month {
  font-size: clamp(18px, 2.2vw, 22px);
  margin-left: 2px;
  color: #333;
}

.get-line {
  margin: 4px 0 2px;
  font-size: clamp(16px, 2.1vw, 20px);
  line-height: 1.2;
  color: #333;
}

.benefit-bold {
  font-weight: 900;
}

.value-line {
  margin: 2px 0 14px;
  font-size: clamp(20px, 2.5vw, 24px);
  font-weight: 500;
  line-height: 1.25;
  color: #333;
}

.value-line.long {
  font-size: clamp(12px, 1.5vw, 14px);
  font-weight: 600;
  line-height: 1.35;
  color: #333;
}

.plan-card :deep(.sketch-btn) {
  padding: calc(var(--sketch-btn-pad-y, 12px) * 0.9) calc(var(--sketch-btn-pad-x, 28px) * 0.9);
  font-size: calc(var(--sketch-btn-font-size, 16px) * 0.9);
  box-shadow: none !important; 
}

.recharge-header :deep(.sketch-btn) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  font-size: 22px !important; 
  color: #333 !important;
  transform: none !important; 
}

.plan-card:nth-child(1) {
  transform: skewY(3deg) rotate(0.5deg); 
}

.plan-card:nth-child(2) {
  transform: skewY(-3deg) rotate(0.5deg); 
}

.plan-card:nth-child(4) {
  transform: skewY(3deg) rotate(0.5deg); 
}

.plan-card:nth-child(5) {
  transform: skewY(-3deg) rotate(-0.5deg); 
}
</style>
