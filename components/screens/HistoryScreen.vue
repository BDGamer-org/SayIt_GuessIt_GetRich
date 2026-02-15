<template>
  <view class="modal-overlay">
    <PaperCard modifier="history">
      <text class="card-main-title">我的记录</text>
      <text class="card-subtitle">最近 10 场游戏</text>

      <view v-if="loading" class="loading-text">加载中...</view>

      <scroll-view v-else class="history-list" scroll-y="true">
        <view v-for="(item, index) in history" :key="item.id" class="history-item">
          <text class="history-num">{{ index + 1 }}</text>
          <text class="history-date">{{ formatDate(item.created_at) }}</text>
          <text class="history-score">{{ item.score }}分</text>
        </view>
        <view v-if="history.length === 0" class="empty-text">
          暂无游戏记录
        </view>
      </scroll-view>

      <view class="card-buttons">
        <SketchButton @click="$emit('refresh')">刷新</SketchButton>
        <view class="cancel-link" @click="$emit('close')">关闭</view>
      </view>
    </PaperCard>
  </view>
</template>

<script>
import PaperCard from '../PaperCard.vue';
import SketchButton from '../SketchButton.vue';

export default {
  components: { PaperCard, SketchButton },
  props: {
    history: Array,
    loading: Boolean
  },
  emits: ['refresh', 'close'],
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
  background: rgba(248, 246, 240, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.card-main-title {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.card-subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 25px;
}

.history-list {
  width: 100%;
  max-height: 280px;
  margin: 15px 0;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px dashed rgba(0,0,0,0.1);
}

.history-item:last-child {
  border-bottom: none;
}

.history-num {
  width: 30px;
  font-size: 16px;
  font-weight: bold;
  color: #666;
}

.history-date {
  flex: 1;
  font-size: 14px;
  color: #999;
  text-align: center;
}

.history-score {
  width: 60px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  text-align: right;
}

.loading-text,
.empty-text {
  font-size: 16px;
  color: #999;
  padding: 30px;
  text-align: center;
}

.card-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 15px;
}

.cancel-link {
  color: #999;
  font-size: 14px;
  text-decoration: underline;
}
</style>
