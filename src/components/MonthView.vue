<!--
 * 月度视图组件
 * 功能：以月为维度展示和管理工作计划
 * 作者：AI Assistant
 * 创建时间：2024
-->
<template>
  <div class="month-view-container">
    <!-- 标题栏 -->
    <div class="header">
      <h1 class="title">月度工作计划</h1>
      <div class="month-navigation">
        <button @click="previousMonth" class="nav-btn">‹ 上月</button>
        <span class="current-month">{{ currentMonthText }}</span>
        <button @click="nextMonth" class="nav-btn">下月 ›</button>
      </div>
    </div>

    <!-- 月度计划表格 -->
    <div class="month-table">
      <table>
        <thead>
          <tr>
            <th class="week-column">周次</th>
            <th class="goals-section">月度目标</th>
            <th class="tasks-section">重点任务</th>
            <th class="progress-section">进度跟踪</th>
            <th class="summary-section">月度总结</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(week, index) in monthWeeks" :key="index" class="week-row">
            <!-- 周次列 -->
            <td class="week-cell">
              <div class="week-info">
                <div class="week-number">第{{ index + 1 }}周</div>
                <div class="week-dates">{{ week.dateRange }}</div>
              </div>
            </td>
            
            <!-- 月度目标 -->
            <td class="goals-cell" v-if="index === 0" :rowspan="monthWeeks.length">
              <div class="goals-content">
                <h4>本月主要目标</h4>
                <textarea 
                  v-model="monthData.goals" 
                  class="goals-textarea"
                  placeholder="设定本月的主要目标和期望成果..."
                ></textarea>
                
                <h4>关键指标</h4>
                <div class="metrics-list">
                  <div v-for="(metric, idx) in monthData.metrics" :key="idx" class="metric-item">
                    <input 
                      v-model="metric.name" 
                      type="text" 
                      placeholder="指标名称"
                      class="metric-name"
                    />
                    <input 
                      v-model="metric.target" 
                      type="text" 
                      placeholder="目标值"
                      class="metric-target"
                    />
                    <input 
                      v-model="metric.current" 
                      type="text" 
                      placeholder="当前值"
                      class="metric-current"
                    />
                    <button @click="removeMetric(idx)" class="remove-metric">×</button>
                  </div>
                  <button @click="addMetric" class="add-metric">+ 添加指标</button>
                </div>
              </div>
            </td>
            
            <!-- 重点任务 -->
            <td class="tasks-cell">
              <div class="tasks-grid">
                <div class="task-row" v-for="n in 3" :key="n">
                  <div class="priority-indicator">
                    <select v-model="week.tasks[n-1].priority" class="priority-select">
                      <option value="high">高</option>
                      <option value="medium">中</option>
                      <option value="low">低</option>
                    </select>
                  </div>
                  <input 
                    v-model="week.tasks[n-1].task" 
                    type="text" 
                    class="task-input"
                    :placeholder="`重点任务 ${n}`"
                  />
                  <div class="task-status">
                    <select v-model="week.tasks[n-1].status" class="status-select">
                      <option value="pending">待开始</option>
                      <option value="in-progress">进行中</option>
                      <option value="completed">已完成</option>
                      <option value="delayed">延期</option>
                    </select>
                  </div>
                </div>
              </div>
            </td>
            
            <!-- 进度跟踪 -->
            <td class="progress-cell">
              <div class="progress-content">
                <div class="progress-bar">
                  <div class="progress-label">完成度</div>
                  <input 
                    v-model.number="week.progress" 
                    type="range" 
                    min="0" 
                    max="100" 
                    class="progress-slider"
                  />
                  <span class="progress-value">{{ week.progress }}%</span>
                </div>
                
                <textarea 
                  v-model="week.notes" 
                  class="progress-notes"
                  placeholder="本周进展说明..."
                ></textarea>
              </div>
            </td>
            
            <!-- 月度总结 -->
            <td class="summary-cell" v-if="index === monthWeeks.length - 1" :rowspan="monthWeeks.length">
              <div class="summary-content">
                <h4>月度回顾</h4>
                <textarea 
                  v-model="monthData.summary.achievements" 
                  class="summary-textarea"
                  placeholder="本月主要成就和亮点..."
                ></textarea>
                
                <h4>问题与挑战</h4>
                <textarea 
                  v-model="monthData.summary.challenges" 
                  class="summary-textarea"
                  placeholder="遇到的问题和挑战..."
                ></textarea>
                
                <h4>改进计划</h4>
                <textarea 
                  v-model="monthData.summary.improvements" 
                  class="summary-textarea"
                  placeholder="下月改进计划..."
                ></textarea>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <button @click="saveData(true)" class="save-btn">保存数据</button>
      <button @click="exportData" class="export-btn">导出数据</button>
      <button @click="clearData" class="clear-btn">清空本月</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

/**
 * 组件属性定义
 */
const props = defineProps({
  enterAction: {
    type: Object,
    default: () => ({})
  }
})

/**
 * 响应式数据定义
 */
const currentMonth = ref(new Date())
const monthDataStore = ref({})

/**
 * 计算属性：当前月份文本
 */
const currentMonthText = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth() + 1
  return `${year}年${month}月`
})

/**
 * 计算属性：当前月份的周数组
 */
const monthWeeks = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  
  // 获取当月第一天和最后一天
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  // 获取第一周的周一
  const firstMonday = new Date(firstDay)
  const dayOfWeek = firstDay.getDay()
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  firstMonday.setDate(firstDay.getDate() - daysToMonday)
  
  const weeks = []
  let currentWeekStart = new Date(firstMonday)
  
  while (currentWeekStart <= lastDay) {
    const weekEnd = new Date(currentWeekStart)
    weekEnd.setDate(currentWeekStart.getDate() + 6)
    
    const dateRange = `${formatDate(currentWeekStart)} - ${formatDate(weekEnd)}`
    
    weeks.push({
      dateRange,
      tasks: initializeWeekTasks(),
      progress: 0,
      notes: ''
    })
    
    currentWeekStart.setDate(currentWeekStart.getDate() + 7)
  }
  
  return weeks
})

/**
 * 计算属性：当前月份数据
 */
const monthData = computed(() => {
  const monthKey = getMonthKey(currentMonth.value)
  
  if (!monthDataStore.value[monthKey]) {
    monthDataStore.value[monthKey] = initializeMonthData()
  }
  
  return monthDataStore.value[monthKey]
})

/**
 * 方法：初始化周任务
 */
const initializeWeekTasks = () => {
  return Array.from({ length: 3 }, () => ({
    task: '',
    priority: 'medium',
    status: 'pending'
  }))
}

/**
 * 方法：初始化月度数据
 */
const initializeMonthData = () => {
  return {
    goals: '',
    metrics: [
      { name: '', target: '', current: '' },
      { name: '', target: '', current: '' },
      { name: '', target: '', current: '' }
    ],
    summary: {
      achievements: '',
      challenges: '',
      improvements: ''
    }
  }
}

/**
 * 方法：获取月份键
 */
const getMonthKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * 方法：格式化日期
 */
const formatDate = (date) => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}

/**
 * 方法：上一个月
 */
const previousMonth = () => {
  const newDate = new Date(currentMonth.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentMonth.value = newDate
}

/**
 * 方法：下一个月
 */
const nextMonth = () => {
  const newDate = new Date(currentMonth.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentMonth.value = newDate
}

/**
 * 方法：添加指标
 */
const addMetric = () => {
  monthData.value.metrics.push({ name: '', target: '', current: '' })
}

/**
 * 方法：移除指标
 */
const removeMetric = (index) => {
  monthData.value.metrics.splice(index, 1)
}

/**
 * 方法：保存数据到uTools数据库
 * @param {boolean} showNotification - 是否显示保存通知
 */
const saveData = (showNotification = true) => {
  try {
    if (window.utools && window.utools.db) {
      // 获取现有文档以保留_rev字段
      const existingDoc = window.utools.db.get('calendar_month_data')
      const docToSave = {
        _id: 'calendar_month_data',
        data: monthDataStore.value,
        lastModified: new Date().toISOString()
      }
      
      // 如果文档已存在，保留_rev字段
      if (existingDoc && existingDoc._rev) {
        docToSave._rev = existingDoc._rev
      }
      
      window.utools.db.put(docToSave)
      
      if (showNotification && window.utools.showNotification) {
        window.utools.showNotification('月度数据保存成功')
      }
    } else {
      localStorage.setItem('calendar_month_data', JSON.stringify(monthDataStore.value))
      if (showNotification) {
        alert('数据保存成功！')
      }
    }
  } catch (error) {
    console.error('保存数据失败:', error)
    if (showNotification) {
      if (window.utools && window.utools.showNotification) {
        window.utools.showNotification('保存失败，请重试')
      } else {
        alert('保存数据失败，请重试')
      }
    }
  }
}

/**
 * 方法：从uTools数据库加载数据
 */
const loadData = () => {
  try {
    if (window.utools && window.utools.db) {
      const doc = window.utools.db.get('calendar_month_data')
      if (doc && doc.data) {
        monthDataStore.value = doc.data
      }
    } else {
      const data = localStorage.getItem('calendar_month_data')
      if (data) {
        monthDataStore.value = JSON.parse(data)
      }
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

/**
 * 方法：导出数据
 */
const exportData = () => {
  const monthKey = getMonthKey(currentMonth.value)
  const data = monthDataStore.value[monthKey]
  
  if (!data) {
    alert('暂无数据可导出')
    return
  }
  
  const exportContent = `月度工作计划 - ${currentMonthText.value}\n\n` +
    `月度目标：\n${data.goals}\n\n` +
    `关键指标：\n${data.metrics.map(m => `${m.name}: ${m.current}/${m.target}`).join('\n')}\n\n` +
    `月度总结：\n成就：${data.summary.achievements}\n挑战：${data.summary.challenges}\n改进：${data.summary.improvements}`
  
  const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `月度计划_${currentMonthText.value}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * 方法：清空数据
 */
const clearData = () => {
  if (confirm('确定要清空本月数据吗？此操作不可恢复。')) {
    const monthKey = getMonthKey(currentMonth.value)
    monthDataStore.value[monthKey] = initializeMonthData()
    saveData()
  }
}

/**
 * 监听月份变化，切换时自动保存数据
 */
watch(currentMonth, () => {
  saveData(false) // 不显示通知的自动保存
})

/**
 * 监听月度数据变化，自动保存
 */
watch(monthDataStore, () => {
  saveData(false) // 不显示通知的自动保存
}, { deep: true })

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.month-view-container {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

/* 标题栏样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;
}

.title {
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: 15px;
}

.nav-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.nav-btn:hover {
  background: #45a049;
}

.current-month {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  min-width: 120px;
  text-align: center;
}

/* 表格样式 */
.month-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
}

th, td {
  border: 1px solid #e0e0e0;
  padding: 12px;
  vertical-align: top;
}

th {
  background: #f5f5f5;
  font-weight: 600;
  text-align: center;
  color: #2c3e50;
}

/* 列宽设置 */
.week-column {
  width: 120px;
}

.goals-section {
  width: 250px;
}

.tasks-section {
  width: 300px;
}

.progress-section {
  width: 200px;
}

.summary-section {
  width: 250px;
}

/* 周次单元格样式 */
.week-cell {
  text-align: center;
  background: #f8f9fa;
}

.week-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.week-number {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
}

.week-dates {
  font-size: 12px;
  color: #666;
}

/* 目标单元格样式 */
.goals-cell {
  background: #f9f9f9;
}

.goals-content h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 14px;
}

.goals-textarea {
  width: 100%;
  height: 80px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  font-size: 12px;
  resize: vertical;
  margin-bottom: 15px;
}

.metrics-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-item {
  display: flex;
  gap: 5px;
  align-items: center;
}

.metric-name, .metric-target, .metric-current {
  flex: 1;
  padding: 4px 6px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 11px;
}

.remove-metric {
  width: 20px;
  height: 20px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}

.add-metric {
  padding: 6px 10px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 11px;
}

/* 任务单元格样式 */
.tasks-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-row {
  display: flex;
  align-items: center;
  gap: 5px;
}

.priority-select, .status-select {
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 11px;
}

.priority-select {
  width: 50px;
}

.status-select {
  width: 70px;
}

.task-input {
  flex: 1;
  padding: 4px 6px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 12px;
}

/* 进度单元格样式 */
.progress-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-bar {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.progress-label {
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
}

.progress-slider {
  width: 100%;
}

.progress-value {
  font-size: 12px;
  color: #4CAF50;
  font-weight: 600;
  text-align: center;
}

.progress-notes {
  width: 100%;
  height: 60px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px;
  font-size: 11px;
  resize: vertical;
}

/* 总结单元格样式 */
.summary-cell {
  background: #f9f9f9;
}

.summary-content h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 14px;
}

.summary-textarea {
  width: 100%;
  height: 60px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px;
  font-size: 11px;
  resize: vertical;
  margin-bottom: 10px;
}

/* 操作按钮样式 */
.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  padding: 20px;
}

.save-btn, .export-btn, .clear-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.save-btn {
  background: #4CAF50;
  color: white;
}

.save-btn:hover {
  background: #45a049;
}

.export-btn {
  background: #2196F3;
  color: white;
}

.export-btn:hover {
  background: #1976D2;
}

.clear-btn {
  background: #f44336;
  color: white;
}

.clear-btn:hover {
  background: #d32f2f;
}

/* 行样式 */
.week-row:nth-child(even) {
  background: #fafafa;
}

.week-row:hover {
  background: #f0f8ff;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .month-view-container {
    padding: 15px;
  }
  
  .goals-section, .summary-section {
    width: 200px;
  }
  
  .tasks-section {
    width: 250px;
  }
}

@media (max-width: 1200px) {
  .header {
    flex-direction: column;
    gap: 15px;
  }
  
  .month-table {
    overflow-x: auto;
  }
}
</style>