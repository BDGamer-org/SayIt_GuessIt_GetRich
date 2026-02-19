<template>
  <view class="modal-overlay">
    <view class="history-container">
      <text class="main-title">我的记录</text>

      <!-- Category Tabs -->
      <view class="category-tabs">
        <view
          class="tab"
          :class="{ active: selectedCategory === 'idiom' }"
          @click="$emit('switchCategory', 'idiom')"
        >中华成语</view>
        <view
          class="tab"
          :class="{ active: selectedCategory === 'life' }"
          @click="$emit('switchCategory', 'life')"
        >日常生活</view>
      </view>

      <text class="subtitle">最近 10 场游戏</text>

      <!-- History List -->
      <scroll-view class="history-list" scroll-y="true">
        <view v-for="(item, index) in history" :key="index" class="history-item">
          <text class="history-num">{{ index + 1 }}</text>
          <text class="history-date">{{ formatDate(item.date) }}</text>
          <text class="history-score">{{ item.score }}分</text>
        </view>
        <view v-if="history.length === 0" class="empty-text">
          暂无游戏记录
        </view>
      </scroll-view>

      <view class="close-btn" @click="$emit('close')">关闭</view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    history: {
      type: Array,
      default: () => []
    },
    selectedCategory: {
      type: String,
      default: 'idiom'
    }
  },
  emits: ['switchCategory', 'close'],
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hour = date.getHours().toString().padStart(2, '0');
      const minute = date.getMinutes().toString().padStart(2, '0');
      return `${month}-${day} ${hour}:${minute}`;
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(248, 246, 240, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.history-container {
  width: 85%;
  max-width: 480px;
  background: #fffdf8;
  border: 3px solid #333;
  border-radius: 16px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 6px 6px 0 rgba(0,0,0,0.08);
}

.main-title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

/* Category Tabs */
.category-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 10px;
  border: 2px solid #333;
  border-radius: 8px;
  overflow: hidden;
}

.tab {
  padding: 8px 20px;
  font-size: 14px;
  font-weight: bold;
  color: #666;
  background: #fff;
  border-right: 2px solid #333;
}

.tab:last-child {
  border-right: none;
}

.tab.active {
  background: #f97316;
  color: #fff;
}

.subtitle {
  font-size: 13px;
  color: #999;
  margin-bottom: 10px;
}

/* History List */
.history-list {
  width: 100%;
  max-height: var(--history-max-height, 260px);
  margin: 8px 0;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px dashed rgba(0,0,0,0.1);
}

.history-item:last-child {
  border-bottom: none;
}

.history-num {
  width: 28px;
  font-size: 15px;
  font-weight: bold;
  color: #999;
}

.history-date {
  flex: 1;
  font-size: 14px;
  color: #999;
  text-align: center;
}

.history-score {
  width: 56px;
  font-size: 17px;
  font-weight: bold;
  color: #333;
  text-align: right;
}

.empty-text {
  font-size: 15px;
  color: #bbb;
  padding: 30px;
  text-align: center;
}

.close-btn {
  margin-top: 14px;
  color: #999;
  font-size: 14px;
  text-decoration: underline;
}
</style>
