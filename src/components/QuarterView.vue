<!--
 * 季度视图组件
 * 功能：以季度为维度展示和管理工作计划
 * 作者：AI Assistant
 * 创建时间：2024
-->
<template>
  <div class="quarter-view-container">
    <!-- 标题栏 -->
    <div class="header">
      <h1 class="title">季度工作规划</h1>
      <div class="quarter-navigation">
        <button @click="previousQuarter" class="nav-btn">‹ 上季度</button>
        <span class="current-quarter">{{ currentQuarterText }}</span>
        <button @click="nextQuarter" class="nav-btn">下季度 ›</button>
      </div>
    </div>

    <!-- 季度规划表格 -->
    <div class="quarter-table">
      <table>
        <thead>
          <tr>
            <th class="month-column">月份</th>
            <th class="strategy-section">季度战略</th>
            <th class="objectives-section">月度目标</th>
            <th class="milestones-section">关键里程碑</th>
            <th class="review-section">季度回顾</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(month, index) in quarterMonths" :key="index" class="month-row">
            <!-- 月份列 -->
            <td class="month-cell">
              <div class="month-info">
                <div class="month-name">{{ month.name }}</div>
                <div class="month-period">{{ month.period }}</div>
              </div>
            </td>
            
            <!-- 季度战略 -->
            <td class="strategy-cell" v-if="index === 0" :rowspan="3">
              <div class="strategy-content">
                <h4>季度愿景</h4>
                <textarea 
                  v-model="quarterData.vision" 
                  class="strategy-textarea"
                  placeholder="描述本季度的整体愿景和方向..."
                ></textarea>
                
                <h4>核心战略</h4>
                <div class="strategies-list">
                  <div v-for="(strategy, idx) in quarterData.strategies" :key="idx" class="strategy-item">
                    <input 
                      v-model="strategy.title" 
                      type="text" 
                      placeholder="战略主题"
                      class="strategy-title"
                    />
                    <textarea 
                      v-model="strategy.description" 
                      placeholder="战略描述"
                      class="strategy-desc"
                    ></textarea>
                    <div class="strategy-priority">
                      <label>优先级：</label>
                      <select v-model="strategy.priority" class="priority-select">
                        <option value="critical">关键</option>
                        <option value="high">高</option>
                        <option value="medium">中</option>
                        <option value="low">低</option>
                      </select>
                    </div>
                    <button @click="removeStrategy(idx)" class="remove-strategy">删除</button>
                  </div>
                  <button @click="addStrategy" class="add-strategy">+ 添加战略</button>
                </div>
                
                <h4>资源配置</h4>
                <textarea 
                  v-model="quarterData.resources" 
                  class="strategy-textarea"
                  placeholder="人力、财力、时间等资源配置计划..."
                ></textarea>
              </div>
            </td>
            
            <!-- 月度目标 -->
            <td class="objectives-cell">
              <div class="objectives-content">
                <h5>{{ month.name }}目标</h5>
                <div class="objectives-list">
                  <div v-for="(objective, idx) in month.objectives" :key="idx" class="objective-item">
                    <input 
                      v-model="objective.title" 
                      type="text" 
                      placeholder="目标标题"
                      class="objective-title"
                    />
                    <div class="objective-details">
                      <input 
                        v-model="objective.metric" 
                        type="text" 
                        placeholder="衡量指标"
                        class="objective-metric"
                      />
                      <input 
                        v-model="objective.target" 
                        type="text" 
                        placeholder="目标值"
                        class="objective-target"
                      />
                    </div>
                    <div class="objective-progress">
                      <label>完成度：</label>
                      <input 
                        v-model.number="objective.progress" 
                        type="range" 
                        min="0" 
                        max="100" 
                        class="progress-slider"
                      />
                      <span class="progress-value">{{ objective.progress }}%</span>
                    </div>
                    <button @click="removeObjective(month, idx)" class="remove-objective">×</button>
                  </div>
                  <button @click="addObjective(month)" class="add-objective">+ 添加目标</button>
                </div>
              </div>
            </td>
            
            <!-- 关键里程碑 -->
            <td class="milestones-cell">
              <div class="milestones-content">
                <div class="milestones-list">
                  <div v-for="(milestone, idx) in month.milestones" :key="idx" class="milestone-item">
                    <input 
                      v-model="milestone.title" 
                      type="text" 
                      placeholder="里程碑标题"
                      class="milestone-title"
                    />
                    <input 
                      v-model="milestone.date" 
                      type="date" 
                      class="milestone-date"
                    />
                    <select v-model="milestone.status" class="milestone-status">
                      <option value="planned">计划中</option>
                      <option value="in-progress">进行中</option>
                      <option value="completed">已完成</option>
                      <option value="delayed">延期</option>
                      <option value="cancelled">取消</option>
                    </select>
                    <textarea 
                      v-model="milestone.notes" 
                      placeholder="备注"
                      class="milestone-notes"
                    ></textarea>
                    <button @click="removeMilestone(month, idx)" class="remove-milestone">×</button>
                  </div>
                  <button @click="addMilestone(month)" class="add-milestone">+ 添加里程碑</button>
                </div>
              </div>
            </td>
            
            <!-- 季度回顾 -->
            <td class="review-cell" v-if="index === 2" :rowspan="3">
              <div class="review-content">
                <h4>成果总结</h4>
                <textarea 
                  v-model="quarterData.review.achievements" 
                  class="review-textarea"
                  placeholder="本季度主要成果和突破..."
                ></textarea>
                
                <h4>数据分析</h4>
                <div class="metrics-summary">
                  <div v-for="(metric, idx) in quarterData.review.metrics" :key="idx" class="metric-summary">
                    <input 
                      v-model="metric.name" 
                      type="text" 
                      placeholder="指标名称"
                      class="metric-name"
                    />
                    <input 
                      v-model="metric.planned" 
                      type="text" 
                      placeholder="计划值"
                      class="metric-planned"
                    />
                    <input 
                      v-model="metric.actual" 
                      type="text" 
                      placeholder="实际值"
                      class="metric-actual"
                    />
                    <span class="metric-variance" :class="getVarianceClass(metric)">{{ getVariance(metric) }}</span>
                    <button @click="removeReviewMetric(idx)" class="remove-metric">×</button>
                  </div>
                  <button @click="addReviewMetric" class="add-metric">+ 添加指标</button>
                </div>
                
                <h4>经验教训</h4>
                <textarea 
                  v-model="quarterData.review.lessons" 
                  class="review-textarea"
                  placeholder="经验总结和教训反思..."
                ></textarea>
                
                <h4>下季度展望</h4>
                <textarea 
                  v-model="quarterData.review.outlook" 
                  class="review-textarea"
                  placeholder="下季度重点方向和改进计划..."
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
      <button @click="clearData" class="clear-btn">清空本季度</button>
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
const currentQuarter = ref(new Date())
const quarterDataStore = ref({})

/**
 * 计算属性：当前季度文本
 */
const currentQuarterText = computed(() => {
  const year = currentQuarter.value.getFullYear()
  const quarter = Math.floor(currentQuarter.value.getMonth() / 3) + 1
  return `${year}年第${quarter}季度`
})

/**
 * 计算属性：当前季度的月份数组
 */
const quarterMonths = computed(() => {
  const year = currentQuarter.value.getFullYear()
  const quarterNum = Math.floor(currentQuarter.value.getMonth() / 3)
  const startMonth = quarterNum * 3
  
  const months = []
  for (let i = 0; i < 3; i++) {
    const monthIndex = startMonth + i
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    
    months.push({
      name: monthNames[monthIndex],
      period: `${year}年${monthIndex + 1}月`,
      objectives: initializeObjectives(),
      milestones: initializeMilestones()
    })
  }
  
  return months
})

/**
 * 计算属性：当前季度数据
 */
const quarterData = computed(() => {
  const quarterKey = getQuarterKey(currentQuarter.value)
  
  if (!quarterDataStore.value[quarterKey]) {
    quarterDataStore.value[quarterKey] = initializeQuarterData()
  }
  
  return quarterDataStore.value[quarterKey]
})

/**
 * 方法：初始化目标
 */
const initializeObjectives = () => {
  return Array.from({ length: 2 }, () => ({
    title: '',
    metric: '',
    target: '',
    progress: 0
  }))
}

/**
 * 方法：初始化里程碑
 */
const initializeMilestones = () => {
  return Array.from({ length: 2 }, () => ({
    title: '',
    date: '',
    status: 'planned',
    notes: ''
  }))
}

/**
 * 方法：初始化季度数据
 */
const initializeQuarterData = () => {
  return {
    vision: '',
    strategies: [
      { title: '', description: '', priority: 'high' },
      { title: '', description: '', priority: 'medium' }
    ],
    resources: '',
    review: {
      achievements: '',
      metrics: [
        { name: '', planned: '', actual: '' },
        { name: '', planned: '', actual: '' }
      ],
      lessons: '',
      outlook: ''
    }
  }
}

/**
 * 方法：获取季度键
 */
const getQuarterKey = (date) => {
  const year = date.getFullYear()
  const quarter = Math.floor(date.getMonth() / 3) + 1
  return `${year}-Q${quarter}`
}

/**
 * 方法：上一个季度
 */
const previousQuarter = () => {
  const newDate = new Date(currentQuarter.value)
  newDate.setMonth(newDate.getMonth() - 3)
  currentQuarter.value = newDate
}

/**
 * 方法：下一个季度
 */
const nextQuarter = () => {
  const newDate = new Date(currentQuarter.value)
  newDate.setMonth(newDate.getMonth() + 3)
  currentQuarter.value = newDate
}

/**
 * 方法：添加战略
 */
const addStrategy = () => {
  quarterData.value.strategies.push({ title: '', description: '', priority: 'medium' })
}

/**
 * 方法：移除战略
 */
const removeStrategy = (index) => {
  quarterData.value.strategies.splice(index, 1)
}

/**
 * 方法：添加目标
 */
const addObjective = (month) => {
  month.objectives.push({ title: '', metric: '', target: '', progress: 0 })
}

/**
 * 方法：移除目标
 */
const removeObjective = (month, index) => {
  month.objectives.splice(index, 1)
}

/**
 * 方法：添加里程碑
 */
const addMilestone = (month) => {
  month.milestones.push({ title: '', date: '', status: 'planned', notes: '' })
}

/**
 * 方法：移除里程碑
 */
const removeMilestone = (month, index) => {
  month.milestones.splice(index, 1)
}

/**
 * 方法：添加回顾指标
 */
const addReviewMetric = () => {
  quarterData.value.review.metrics.push({ name: '', planned: '', actual: '' })
}

/**
 * 方法：移除回顾指标
 */
const removeReviewMetric = (index) => {
  quarterData.value.review.metrics.splice(index, 1)
}

/**
 * 方法：获取差异值
 */
const getVariance = (metric) => {
  const planned = parseFloat(metric.planned) || 0
  const actual = parseFloat(metric.actual) || 0
  if (planned === 0) return '-'
  const variance = ((actual - planned) / planned * 100).toFixed(1)
  return `${variance > 0 ? '+' : ''}${variance}%`
}

/**
 * 方法：获取差异样式类
 */
const getVarianceClass = (metric) => {
  const planned = parseFloat(metric.planned) || 0
  const actual = parseFloat(metric.actual) || 0
  if (planned === 0) return 'neutral'
  const variance = (actual - planned) / planned
  if (variance > 0.1) return 'positive'
  if (variance < -0.1) return 'negative'
  return 'neutral'
}

/**
 * 方法：保存数据到uTools数据库
 * @param {boolean} showNotification - 是否显示保存通知
 */
const saveData = (showNotification = true) => {
  try {
    if (window.utools && window.utools.db) {
      // 获取现有文档以保留_rev字段
      const existingDoc = window.utools.db.get('calendar_quarter_data')
      const docToSave = {
        _id: 'calendar_quarter_data',
        data: quarterDataStore.value,
        lastModified: new Date().toISOString()
      }
      
      // 如果文档已存在，保留_rev字段
      if (existingDoc && existingDoc._rev) {
        docToSave._rev = existingDoc._rev
      }
      
      window.utools.db.put(docToSave)
      
      if (showNotification && window.utools.showNotification) {
        window.utools.showNotification('季度数据保存成功')
      }
    } else {
      localStorage.setItem('calendar_quarter_data', JSON.stringify(quarterDataStore.value))
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
      const doc = window.utools.db.get('calendar_quarter_data')
      if (doc && doc.data) {
        quarterDataStore.value = doc.data
      }
    } else {
      const data = localStorage.getItem('calendar_quarter_data')
      if (data) {
        quarterDataStore.value = JSON.parse(data)
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
  const quarterKey = getQuarterKey(currentQuarter.value)
  const data = quarterDataStore.value[quarterKey]
  
  if (!data) {
    alert('暂无数据可导出')
    return
  }
  
  const exportContent = `季度工作规划 - ${currentQuarterText.value}\n\n` +
    `季度愿景：\n${data.vision}\n\n` +
    `核心战略：\n${data.strategies.map(s => `${s.title}: ${s.description}`).join('\n')}\n\n` +
    `资源配置：\n${data.resources}\n\n` +
    `季度回顾：\n成果：${data.review.achievements}\n教训：${data.review.lessons}\n展望：${data.review.outlook}`
  
  const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `季度规划_${currentQuarterText.value}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * 方法：清空数据
 */
const clearData = () => {
  if (confirm('确定要清空本季度数据吗？此操作不可恢复。')) {
    const quarterKey = getQuarterKey(currentQuarter.value)
    quarterDataStore.value[quarterKey] = initializeQuarterData()
    saveData()
  }
}

/**
 * 监听季度变化，切换时自动保存数据
 */
watch(currentQuarter, () => {
  saveData(false) // 不显示通知的自动保存
})

/**
 * 监听季度数据变化，自动保存
 */
watch(quarterDataStore, () => {
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
.quarter-view-container {
  padding: 16px;
  background: #f5f5f5;
  min-height: 100vh;
}

@media (max-width: 1400px) {
  .quarter-view-container {
    padding: 12px;
  }
}

@media (max-width: 1200px) {
  .quarter-view-container {
    padding: 8px;
    min-height: calc(100vh - 200px);
  }
}

/* 标题栏样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 8px;
}

@media (max-width: 1400px) {
  .header {
    margin-bottom: 12px;
    padding: 0 6px;
  }
}

@media (max-width: 1200px) {
  .header {
    margin-bottom: 8px;
    padding: 0 4px;
    flex-direction: column;
    gap: 8px;
  }
}

.title {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
}

@media (max-width: 1400px) {
  .title {
    font-size: 18px;
  }
}

@media (max-width: 1200px) {
  .title {
    font-size: 16px;
  }
}

.quarter-navigation {
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

.current-quarter {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  min-width: 150px;
  text-align: center;
}

/* 表格样式 */
.quarter-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 16px;
  overflow-x: auto;
}

@media (max-width: 1400px) {
  .quarter-table {
    margin-bottom: 12px;
  }
}

@media (max-width: 1200px) {
  .quarter-table {
    margin-bottom: 8px;
  }
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1400px;
}

th, td {
  border: 1px solid #e0e0e0;
  padding: 8px;
  vertical-align: top;
  font-size: 12px;
}

@media (max-width: 1400px) {
  th, td {
    padding: 6px;
    font-size: 11px;
  }
}

@media (max-width: 1200px) {
  th, td {
    padding: 4px;
    font-size: 10px;
  }
}

th {
  background: #f5f5f5;
  font-weight: 600;
  text-align: center;
  color: #2c3e50;
}

/* 列宽设置 */
.month-column {
  width: 100px;
}

.strategy-section {
  width: 300px;
}

.objectives-section {
  width: 250px;
}

.milestones-section {
  width: 250px;
}

.review-section {
  width: 300px;
}

/* 月份单元格样式 */
.month-cell {
  text-align: center;
  background: #f8f9fa;
}

.month-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.month-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
}

.month-period {
  font-size: 11px;
  color: #666;
}

/* 战略单元格样式 */
.strategy-cell {
  background: #f9f9f9;
}

.strategy-content h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 14px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 5px;
}

.strategy-textarea {
  width: 100%;
  height: 50px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px;
  font-size: 10px;
  resize: vertical;
  margin-bottom: 12px;
}

@media (max-width: 1400px) {
  .strategy-textarea {
    height: 40px;
    padding: 3px;
    font-size: 9px;
    margin-bottom: 8px;
  }
}

@media (max-width: 1200px) {
  .strategy-textarea {
    height: 30px;
    padding: 2px;
    font-size: 8px;
    margin-bottom: 6px;
  }
}

.strategies-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.strategy-item {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 8px;
  background: white;
}

.strategy-title {
  width: 100%;
  padding: 4px 6px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 12px;
  margin-bottom: 5px;
  font-weight: 600;
}

.strategy-desc {
  width: 100%;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 4px 6px;
  font-size: 11px;
  resize: vertical;
  margin-bottom: 5px;
}

.strategy-priority {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 5px;
}

.strategy-priority label {
  font-size: 11px;
  color: #666;
}

.priority-select {
  padding: 2px 4px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 11px;
}

.remove-strategy, .add-strategy {
  padding: 4px 8px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 11px;
}

.remove-strategy {
  background: #ff4444;
  color: white;
}

.add-strategy {
  background: #4CAF50;
  color: white;
}

/* 目标单元格样式 */
.objectives-content h5 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 13px;
  text-align: center;
  background: #f0f0f0;
  padding: 5px;
  border-radius: 3px;
}

.objectives-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.objective-item {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 8px;
  background: #fafafa;
}

.objective-title {
  width: 100%;
  padding: 4px 6px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 12px;
  margin-bottom: 5px;
  font-weight: 600;
}

.objective-details {
  display: flex;
  gap: 5px;
  margin-bottom: 5px;
}

.objective-metric, .objective-target {
  flex: 1;
  padding: 3px 5px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 11px;
}

.objective-progress {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 5px;
}

.objective-progress label {
  font-size: 11px;
  color: #666;
}

.progress-slider {
  flex: 1;
}

.progress-value {
  font-size: 11px;
  color: #4CAF50;
  font-weight: 600;
  min-width: 35px;
}

.remove-objective, .add-objective {
  padding: 3px 6px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 11px;
}

.remove-objective {
  background: #ff4444;
  color: white;
  float: right;
}

.add-objective {
  background: #4CAF50;
  color: white;
  width: 100%;
}

/* 里程碑单元格样式 */
.milestones-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.milestone-item {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 8px;
  background: #fafafa;
}

.milestone-title {
  width: 100%;
  padding: 4px 6px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 12px;
  margin-bottom: 5px;
  font-weight: 600;
}

.milestone-date {
  width: 100%;
  padding: 3px 5px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 11px;
  margin-bottom: 5px;
}

.milestone-status {
  width: 100%;
  padding: 3px 5px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 11px;
  margin-bottom: 5px;
}

.milestone-notes {
  width: 100%;
  height: 30px;
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 3px 5px;
  font-size: 11px;
  resize: vertical;
  margin-bottom: 5px;
}

.remove-milestone, .add-milestone {
  padding: 3px 6px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 11px;
}

.remove-milestone {
  background: #ff4444;
  color: white;
  float: right;
}

.add-milestone {
  background: #4CAF50;
  color: white;
  width: 100%;
}

/* 回顾单元格样式 */
.review-cell {
  background: #f9f9f9;
}

.review-content h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 14px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 5px;
}

.review-textarea {
  width: 100%;
  height: 50px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px;
  font-size: 10px;
  resize: vertical;
  margin-bottom: 12px;
}

@media (max-width: 1400px) {
  .review-textarea {
    height: 40px;
    padding: 3px;
    font-size: 9px;
    margin-bottom: 8px;
  }
}

@media (max-width: 1200px) {
  .review-textarea {
    height: 30px;
    padding: 2px;
    font-size: 8px;
    margin-bottom: 6px;
  }
}

.metrics-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.metric-summary {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px;
  background: white;
  border-radius: 3px;
  border: 1px solid #e0e0e0;
}

.metric-name, .metric-planned, .metric-actual {
  flex: 1;
  padding: 3px 5px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 11px;
}

.metric-variance {
  min-width: 50px;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 4px;
  border-radius: 3px;
}

.metric-variance.positive {
  background: #d4edda;
  color: #155724;
}

.metric-variance.negative {
  background: #f8d7da;
  color: #721c24;
}

.metric-variance.neutral {
  background: #e2e3e5;
  color: #383d41;
}

.remove-metric, .add-metric {
  padding: 3px 6px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 11px;
}

.remove-metric {
  background: #ff4444;
  color: white;
}

.add-metric {
  background: #4CAF50;
  color: white;
  width: 100%;
}

/* 操作按钮样式 */
.actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  padding: 16px;
  flex-wrap: wrap;
}

@media (max-width: 1400px) {
  .actions {
    gap: 6px;
    padding: 12px;
  }
}

@media (max-width: 1200px) {
  .actions {
    gap: 4px;
    padding: 8px;
  }
}

.save-btn, .export-btn, .clear-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
}

@media (max-width: 1400px) {
  .save-btn, .export-btn, .clear-btn {
    padding: 6px 12px;
    font-size: 11px;
  }
}

@media (max-width: 1200px) {
  .save-btn, .export-btn, .clear-btn {
    padding: 4px 8px;
    font-size: 10px;
  }
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
.month-row:nth-child(even) {
  background: #fafafa;
}

.month-row:hover {
  background: #f0f8ff;
}

/* 响应式设计 */
@media (max-width: 1600px) {
  .quarter-view-container {
    padding: 15px;
  }
  
  .strategy-section, .review-section {
    width: 250px;
  }
  
  .objectives-section, .milestones-section {
    width: 200px;
  }
}

@media (max-width: 1400px) {
  .header {
    flex-direction: column;
    gap: 15px;
  }
  
  .quarter-table {
    overflow-x: auto;
  }
}
</style>