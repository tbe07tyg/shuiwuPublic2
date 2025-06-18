<template>
  <div class="dashboard-bg">
    <StatScheme2 />

    <!-- 逾期任务横幅 -->
    <div v-if="overdueTasks.length" class="dashboard-banner">
      <span class="banner-label">逾期任务：</span>
      <a-badge status="error" v-for="task in overdueTasks" :key="task.id" :text="task.name" class="banner-task" />
      <span class="banner-tip">（请尽快处理，横幅持续闪烁）</span>
    </div>

    <!-- 主区两栏布局 -->
    <div class="dashboard-main-flex">
      <div class="dashboard-main-left">
        <!-- 待办事项列表 -->
        <a-card class="dashboard-todo-card" title="待办事项">
          <a-list :dataSource="todoList" bordered>
            <template #renderItem="{ item }">
              <a-list-item :class="['todo-item', item.urgent && 'urgent']">
                <a-badge :status="item.urgent ? 'error' : 'processing'" />
                <span class="todo-title">{{ item.title }}</span>
                <span class="todo-time">{{ item.time }}</span>
                <a-button type="link" size="small">处理</a-button>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
        <!-- 日历区 -->
        <div class="dashboard-calendar-large">
          <CalendarScheme3 />
        </div>
      </div>
      <div class="dashboard-main-right">
        <a-card class="dashboard-warning-card" title="项目预警">
          <div v-for="warn in warningList" :key="warn.id" class="warning-item">
            <a-badge :color="warn.level==='red' ? '#ff4d4f' : warn.level==='yellow' ? '#faad14' : '#52c41a'" />
            <span class="warning-title">{{ warn.title }}</span>
            <a-button type="link" size="small">详情</a-button>
          </div>
        </a-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import dayjs from 'dayjs'
import CalendarScheme3 from '@/views/设计方案/工作台方案/日历方案3.vue'
import StatScheme2 from '@/views/设计方案/顶部统计圆环方案/方案2.vue'

// 逾期任务横幅数据
const overdueTasks = [
  { id: 1, name: '项目A文档提交' },
  { id: 2, name: '项目B经费审批' }
]

// 待办事项列表
const todoList = [
  { id: 1, title: '项目A立项审批', time: '09:00', urgent: true },
  { id: 2, title: '项目B合同签署', time: '10:30', urgent: false },
  { id: 3, title: '项目C进度汇报', time: '14:00', urgent: false },
  { id: 4, title: '项目D风险评估', time: '16:00', urgent: true }
]

// 项目预警列表
const warningList = [
  { id: 1, title: '项目A进度滞后', level: 'red' },
  { id: 2, title: '项目B预算超支', level: 'yellow' },
  { id: 3, title: '项目C节点临近', level: 'green' }
]

// 日历相关
const calendarValue = ref(dayjs())
const calendarEvents = [
  { id: 1, date: '2024-06-10', title: '项目A会议', type: 'meeting' },
  { id: 2, date: '2024-06-12', title: '项目B截止', type: 'deadline' }
]
function getCalendarEvents(current) {
  return calendarEvents.filter(e => dayjs(e.date).isSame(current, 'day'))
}
function onCalendarSelect(date) {
  // 双击可新建会议/任务，后续可扩展
}

function syncWarningCardHeight() {
  nextTick(() => {
    const left = document.querySelector('.dashboard-main-left')
    const right = document.querySelector('.dashboard-main-right')
    const rightCard = document.querySelector('.dashboard-warning-card')
    if (left && right && rightCard) {
      right.style.height = left.offsetHeight + 'px'
      rightCard.style.height = '100%'
    }
  })
}

onMounted(() => {
  syncWarningCardHeight()
  window.addEventListener('resize', syncWarningCardHeight)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', syncWarningCardHeight)
})
</script>

<style scoped>
.dashboard-bg {
  min-height: 100vh;
  background: #f5f8ff;
  padding: 32px 0 32px 0;
}
.dashboard-banner {
  background: #fffbe6;
  border-radius: 8px;
  padding: 8px 24px;
  margin-bottom: 20px;
  font-size: 15px;
  color: #faad14;
  display: flex;
  align-items: center;
  animation: banner-blink 1s infinite alternate;
}
@keyframes banner-blink {
  0% { box-shadow: 0 0 0 0 #faad14; }
  100% { box-shadow: 0 0 8px 2px #faad14; }
}
.banner-label {
  font-weight: bold;
  margin-right: 8px;
}
.banner-task {
  margin-right: 12px;
}
.banner-tip {
  margin-left: 12px;
  color: #faad14;
  font-size: 13px;
}
.dashboard-main-flex {
  display: flex;
  align-items: stretch;
  gap: 24px;
  margin-bottom: 24px;
  height: auto;
}
.dashboard-main-left {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 0;
}
.dashboard-main-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.dashboard-todo-card, .dashboard-warning-card {
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(35,79,162,0.08);
}
.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  padding: 8px 0;
}
.todo-item.urgent {
  color: #ff4d4f;
  font-weight: bold;
}
.todo-title {
  flex: 1;
}
.todo-time {
  color: #999;
  margin-right: 16px;
}
.warning-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  margin-bottom: 12px;
}
.dashboard-calendar-large {
  margin-top: 0;
  width: 100%;
  display: flex;
  justify-content: center;
}
.dashboard-calendar-large :deep(.calendar-scheme3) {
  width: 100%;
  max-width: 1000px;
  min-width: 600px;
  padding: 40px 48px;
}
.dashboard-warning-card {
  flex: 1 1 0%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
</style> 