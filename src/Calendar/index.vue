<!--
 * 时间管理行事历组件
 * 功能：以周为维度展示和管理工作计划
 * 作者：AI Assistant
 * 创建时间：2024
-->
<template>
  <div class="calendar-container">
    <!-- 侧边栏 -->
    <Sidebar 
      @view-change="handleViewChange" 
      @date-select="handleDateSelect"
    />
    
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 周度视图 -->
      <div v-if="currentView === 'week'" class="week-view">
        <!-- 标题栏 -->
        <div class="header">
          <div class="header-left">
            <h1 class="title">周度工作计划</h1>
            <div class="week-navigation">
              <button @click="previousWeek" class="nav-btn">‹ 上周</button>
              <span class="current-week">{{ currentWeekText }}</span>
              <button @click="nextWeek" class="nav-btn">下周 ›</button>
            </div>
          </div>
          <div class="header-right">
            <!-- 操作按钮移到右上角 -->
            <div class="actions">
              <button @click="saveData(true)" class="save-btn">保存数据</button>
              <button @click="exportData" class="export-btn">导出数据</button>
              <button @click="clearData" class="clear-btn">清空本周</button>
            </div>
          </div>
        </div>

    <!-- 行事历表格 -->
    <div class="calendar-table">
      <table>
        <thead>
          <tr>
            <th class="date-column">工作日期</th>
            <th class="plan-section">今日工作计划及完成情况</th>
            <th class="plan-section">其他工作项</th>
            <th class="tomorrow-plan">明日工作计划</th>
            <th class="weekly-summary">周度工作总结与反思</th>
          </tr>
          <tr class="sub-header">
            <th></th>
            <th>
              <div class="plan-subsections">
                <span class="subsection">第一部分：本周重点工作</span>
                <span class="subsection">第二部分：本周工作得失</span>
                <span class="subsection">第三部分：整改及管理改进</span>
              </div>
            </th>
            <th></th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(day, index) in weekDays" :key="index" class="day-row">
            <!-- 日期列 -->
            <td class="date-cell">
              <div class="date-info">
                <div class="date-number">{{ day.date }}</div>
                <div class="day-name">{{ day.dayName }}</div>
              </div>
            </td>
            
            <!-- 今日工作计划及完成情况 -->
            <td class="plan-cell">
              <div class="completion-grid">
                <div class="completion-row" v-for="n in 4" :key="n">
                  <div class="task-controls">
                    <div class="star-rating">
                      <span v-for="star in 4" :key="star" 
                            class="star" 
                            :class="{ active: day.todayWork[n-1]?.stars >= star }"
                            @click="setStars(day, 'todayWork', n-1, star)">★</span>
                    </div>
                    <div class="priority-indicator" :class="`priority-${day.todayWork[n-1].priority}`">
                      {{ getPriorityText(day.todayWork[n-1].priority) }}
                    </div>
                  </div>
                  <input 
                    v-model="day.todayWork[n-1].task" 
                    type="text" 
                    class="task-input"
                    :class="`priority-${day.todayWork[n-1].priority}`"
                    :placeholder="`工作项 ${n}`"
                  />
                  <div class="task-meta">
                    <div class="completion-status">
                      <label class="checkbox-label">
                        <input 
                          v-model="day.todayWork[n-1].completed" 
                          type="checkbox" 
                          class="completion-checkbox"
                        />
                        完成
                      </label>
                    </div>
                    <div class="tags-container">
                      <span 
                        v-for="(tag, tagIndex) in day.todayWork[n-1].tags" 
                        :key="tagIndex" 
                        class="tag"
                        @click="removeTag(day, 'todayWork', n-1, tagIndex)"
                      >
                        {{ tag }} ×
                      </span>
                      <input 
                        type="text" 
                        class="tag-input" 
                        placeholder="添加标签"
                        @keyup.enter="addTag(day, 'todayWork', n-1, $event)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </td>
            
            <!-- 其他工作项 -->
            <td class="other-work-cell">
              <div class="other-work-grid">
                <div class="other-work-row" v-for="n in 3" :key="n">
                  <div class="task-controls">
                    <div class="star-rating">
                      <span v-for="star in 4" :key="star" 
                            class="star" 
                            :class="{ active: day.otherWork[n-1]?.stars >= star }"
                            @click="setStars(day, 'otherWork', n-1, star)">★</span>
                    </div>
                    <div class="priority-indicator" :class="`priority-${day.otherWork[n-1].priority}`">
                      {{ getPriorityText(day.otherWork[n-1].priority) }}
                    </div>
                  </div>
                  <input 
                    v-model="day.otherWork[n-1].task" 
                    type="text" 
                    class="task-input"
                    :class="`priority-${day.otherWork[n-1].priority}`"
                    :placeholder="`其他工作 ${n}`"
                  />
                  <div class="task-meta">
                    <div class="completion-status">
                      <label class="checkbox-label">
                        <input 
                          v-model="day.otherWork[n-1].completed" 
                          type="checkbox" 
                          class="completion-checkbox"
                        />
                        完成
                      </label>
                    </div>
                    <div class="tags-container">
                      <span 
                        v-for="(tag, tagIndex) in day.otherWork[n-1].tags" 
                        :key="tagIndex" 
                        class="tag"
                        @click="removeTag(day, 'otherWork', n-1, tagIndex)"
                      >
                        {{ tag }} ×
                      </span>
                      <input 
                        type="text" 
                        class="tag-input" 
                        placeholder="添加标签"
                        @keyup.enter="addTag(day, 'otherWork', n-1, $event)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </td>
            
            <!-- 明日工作计划 -->
            <td class="tomorrow-cell">
              <textarea 
                v-model="day.tomorrowPlan" 
                class="tomorrow-textarea"
                placeholder="明日工作计划..."
              ></textarea>
            </td>
            
            <!-- 周度工作总结与反思 -->
            <td class="summary-cell" v-if="index === 0" :rowspan="7">
              <textarea 
                v-model="weekSummary" 
                class="summary-textarea"
                placeholder="周度总结与反思..."
              ></textarea>
            </td>
          </tr>
        </tbody>
      </table>
    </div>


      </div>
      
      <!-- 月度视图 -->
      <MonthView v-if="currentView === 'month'" :enterAction="enterAction" />
      
      <!-- 季度视图 -->
      <QuarterView v-if="currentView === 'quarter'" :enterAction="enterAction" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import MonthView from '../components/MonthView.vue'
import QuarterView from '../components/QuarterView.vue'

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
// 当前周的起始日期
const currentWeekStart = ref(new Date())

// 周数据结构
const weekData = ref({})

// 当前视图：week, month, quarter
const currentView = ref('week')

// AI总结生成状态
const isGeneratingSummary = ref(false)

/**
 * 计算属性：当前周的文本描述
 */
const currentWeekText = computed(() => {
  const start = new Date(currentWeekStart.value)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  
  return `${formatDate(start)} - ${formatDate(end)}`
})

/**
 * 计算属性：当前周的天数数组（以当前日期为起始排列）
 */
const weekDays = computed(() => {
  const days = []
  const weekKey = getWeekKey(currentWeekStart.value)
  
  if (!weekData.value[weekKey]) {
    weekData.value[weekKey] = initializeWeekData()
  }
  
  const today = new Date()
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  
  // 找到今日在本周中的位置
  let todayIndex = -1
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart.value)
    date.setDate(date.getDate() + i)
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    if (dateOnly.getTime() === todayDateOnly.getTime()) {
      todayIndex = i
      break
    }
  }
  
  // 以今日为起始重新排列日期
  for (let i = 0; i < 7; i++) {
    const dayOffset = todayIndex >= 0 ? (todayIndex + i) % 7 : i
    const date = new Date(currentWeekStart.value)
    date.setDate(date.getDate() + dayOffset)
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    // 判断是否为今日
    const isToday = dateOnly.getTime() === todayDateOnly.getTime()
    
    days.push({
      date: date.getDate(),
      dayName: getDayName(date.getDay()),
      fullDate: date,
      isToday: isToday,
      ...weekData.value[weekKey].days[dayOffset]
    })
  }
  
  return days
})

/**
 * 计算属性：当前周的总结
 */
const weekSummary = computed({
  get() {
    const weekKey = getWeekKey(currentWeekStart.value)
    if (!weekData.value[weekKey]) {
      weekData.value[weekKey] = initializeWeekData()
    }
    return weekData.value[weekKey].summary || ''
  },
  set(value) {
    const weekKey = getWeekKey(currentWeekStart.value)
    if (!weekData.value[weekKey]) {
      weekData.value[weekKey] = initializeWeekData()
    }
    weekData.value[weekKey].summary = value
    saveData()
  }
})

/**
 * 初始化周数据结构
 * @returns {Object} 包含一周7天数据和周总结的对象
 */
function initializeWeekData() {
  const days = []
  for (let i = 0; i < 7; i++) {
    days.push({
      todayWork: Array(4).fill().map(() => ({ 
        task: '', 
        completed: false, 
        stars: 0, 
        priority: 'medium', // 优先级：high, medium, low
        tags: [] // 标签数组
      })),
      otherWork: Array(3).fill().map(() => ({ 
        task: '', 
        completed: false, 
        stars: 0, 
        priority: 'medium', 
        tags: [] 
      })),
      tomorrowPlan: ''
    })
  }
  return {
    days: days,
    summary: ''
  }
}

/**
 * 获取周的唯一标识键
 * @param {Date} date - 日期对象
 * @returns {string} 周标识键
 */
function getWeekKey(date) {
  const year = date.getFullYear()
  const week = getWeekNumber(date)
  return `${year}-W${week}`
}

/**
 * 获取日期的周数
 * @param {Date} date - 日期对象
 * @returns {number} 周数
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

/**
 * 格式化日期显示
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date) {
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

/**
 * 获取星期名称
 * @param {number} dayIndex - 星期索引（0-6）
 * @returns {string} 星期名称
 */
function getDayName(dayIndex) {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[dayIndex]
}

/**
 * 获取本周的周一日期
 * @param {Date} date - 任意日期
 * @returns {Date} 该周周一的日期
 */
function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

/**
 * 切换到上一周
 */
function previousWeek() {
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() - 7)
  currentWeekStart.value = newDate
}

/**
 * 切换到下一周
 */
function nextWeek() {
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() + 7)
  currentWeekStart.value = newDate
}

/**
 * 设置任务的星级评分并自动更新优先级
 * @param {Object} day - 天数据对象
 * @param {string} type - 任务类型（todayWork 或 otherWork）
 * @param {number} index - 任务索引
 * @param {number} stars - 星级数
 */
function setStars(day, type, index, stars) {
  day[type][index].stars = stars
  
  // 根据星级自动设置优先级
  if (stars >= 3) {
    day[type][index].priority = 'high'
  } else if (stars >= 2) {
    day[type][index].priority = 'medium'
  } else {
    day[type][index].priority = 'low'
  }
  
  saveData(false)
}

/**
 * 添加标签到工作项
 * @param {Object} day - 天数据对象
 * @param {string} type - 任务类型（todayWork 或 otherWork）
 * @param {number} index - 任务索引
 * @param {Event} event - 输入事件
 */
function addTag(day, type, index, event) {
  const tagText = event.target.value.trim()
  if (tagText && !day[type][index].tags.includes(tagText)) {
    day[type][index].tags.push(tagText)
    event.target.value = ''
    saveData(false)
  }
}

/**
 * 移除工作项的标签
 * @param {Object} day - 天数据对象
 * @param {string} type - 任务类型（todayWork 或 otherWork）
 * @param {number} index - 任务索引
 * @param {number} tagIndex - 标签索引
 */
function removeTag(day, type, index, tagIndex) {
  day[type][index].tags.splice(tagIndex, 1)
  saveData(false)
}

/**
 * 保存数据到uTools数据库
 * @param {boolean} showNotification - 是否显示保存通知
 */
function saveData(showNotification = false) {
  try {
    // 使用uTools的数据库API保存数据
    if (window.utools && window.utools.db) {
      // 获取现有文档以保留_rev字段
      const existingDoc = window.utools.db.get('calendar_week_data')
      const docToSave = {
        _id: 'calendar_week_data',
        data: weekData.value,
        lastModified: new Date().toISOString()
      }
      
      // 如果文档已存在，保留_rev字段
      if (existingDoc && existingDoc._rev) {
        docToSave._rev = existingDoc._rev
      }
      
      window.utools.db.put(docToSave)
      
      if (showNotification && window.utools.showNotification) {
        window.utools.showNotification('数据保存成功')
      }
    } else {
      // 降级到localStorage
      localStorage.setItem('calendar_week_data', JSON.stringify(weekData.value))
      if (showNotification) {
        console.log('数据已保存到本地存储')
      }
    }
  } catch (error) {
    console.error('保存数据失败:', error)
    if (showNotification && window.utools && window.utools.showNotification) {
      window.utools.showNotification('保存失败，请重试')
    }
  }
}

/**
 * 从uTools数据库加载数据
 */
function loadData() {
  try {
    if (window.utools && window.utools.db) {
      const doc = window.utools.db.get('calendar_week_data')
      if (doc && doc.data) {
        weekData.value = doc.data
      }
    } else {
      // 降级到localStorage
      const saved = localStorage.getItem('calendar_week_data')
      if (saved) {
        weekData.value = JSON.parse(saved)
      }
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

/**
 * 导出数据为JSON文件
 */
function exportData() {
  try {
    const dataStr = JSON.stringify(weekData.value, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `行事历数据_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    if (window.utools) {
      window.utools.showNotification('数据导出成功')
    }
  } catch (error) {
    console.error('导出数据失败:', error)
    if (window.utools) {
      window.utools.showNotification('导出失败，请重试')
    }
  }
}

/**
 * 清空当前周的数据
 * 完全清空本周内的所有内容，并从本地数据库中删除本周的数据
 */
function clearData() {
  if (confirm('确定要清空本周的所有数据吗？此操作不可撤销。')) {
    try {
      const weekKey = getWeekKey(currentWeekStart.value)
      
      // 1. 从内存中删除本周数据
      if (weekData.value[weekKey]) {
        delete weekData.value[weekKey]
      }
      
      // 2. 重新初始化本周数据为空白状态
      weekData.value[weekKey] = initializeWeekData()
      
      // 3. 更新数据库，确保本周数据被完全清空
      if (window.utools && window.utools.db) {
        // 获取现有文档
        const existingDoc = window.utools.db.get('calendar_week_data')
        const docToSave = {
          _id: 'calendar_week_data',
          data: weekData.value,
          lastModified: new Date().toISOString()
        }
        
        // 保留_rev字段以确保正确更新
        if (existingDoc && existingDoc._rev) {
          docToSave._rev = existingDoc._rev
        }
        
        // 保存更新后的数据（不包含被清空的本周数据）
        window.utools.db.put(docToSave)
        
        if (window.utools.showNotification) {
          window.utools.showNotification('本周数据已完全清空并从数据库中删除')
        }
      } else {
        // 降级到localStorage
        localStorage.setItem('calendar_week_data', JSON.stringify(weekData.value))
        console.log('本周数据已从本地存储中清空')
      }
      
      // 4. 强制刷新视图以确保UI更新
      const currentWeek = currentWeekStart.value
      currentWeekStart.value = new Date(currentWeek)
      
    } catch (error) {
      console.error('清空数据失败:', error)
      if (window.utools && window.utools.showNotification) {
        window.utools.showNotification('清空失败，请重试')
      } else {
        alert('清空失败，请重试')
      }
    }
  }
}

/**
 * 处理视图切换
 * @param {string} view - 视图类型
 */
function handleViewChange(view) {
  // 切换视图前自动保存当前数据
  if (currentView.value === 'week') {
    saveData(false) // 不显示通知的自动保存
  }
  currentView.value = view
}

/**
 * 处理日期选择
 * @param {Date} date - 选择的日期
 */
function handleDateSelect(date) {
  if (currentView.value === 'week') {
    // 切换日期前自动保存当前数据
    saveData(false)
    currentWeekStart.value = getMonday(date)
  }
}

/**
 * 获取优先级显示文本
 * @param {string} priority - 优先级值
 * @returns {string} 优先级显示文本
 */
function getPriorityText(priority) {
  const priorityMap = {
    'high': '🔴 高优先级',
    'medium': '🟡 中优先级',
    'low': '🟢 低优先级'
  }
  return priorityMap[priority] || '🟡 中优先级'
}

/**
 * 生成AI总结
 * 分析本周工作数据，生成智能总结与反思
 */
async function generateAISummary() {
  if (isGeneratingSummary.value) return
  
  try {
    isGeneratingSummary.value = true
    
    // 收集本周工作数据
    const weekKey = getWeekKey(currentWeekStart.value)
    const currentWeekData = weekData.value[weekKey]
    
    if (!currentWeekData) {
      throw new Error('本周暂无工作数据')
    }
    
    // 分析工作数据
    const analysisData = analyzeWeekData(currentWeekData)
    
    // 生成AI总结
    const aiSummary = generateIntelligentSummary(analysisData)
    
    // 更新周总结
    weekSummary.value = aiSummary
    
    // 显示成功通知
    if (window.utools && window.utools.showNotification) {
      window.utools.showNotification('AI总结生成成功！')
    }
    
  } catch (error) {
    console.error('生成AI总结失败:', error)
    
    // 显示错误通知
    if (window.utools && window.utools.showNotification) {
      window.utools.showNotification(`生成失败: ${error.message}`)
    } else {
      alert(`生成AI总结失败: ${error.message}`)
    }
  } finally {
    isGeneratingSummary.value = false
  }
}

/**
 * 分析周工作数据
 * @param {Object} weekData - 周数据
 * @returns {Object} 分析结果
 */
function analyzeWeekData(weekData) {
  const analysis = {
    totalTasks: 0,
    completedTasks: 0,
    highPriorityTasks: 0,
    mediumPriorityTasks: 0,
    lowPriorityTasks: 0,
    completedHighPriority: 0,
    completedMediumPriority: 0,
    completedLowPriority: 0,
    averageStars: 0,
    totalStars: 0,
    tasksByDay: [],
    tags: {},
    workDays: 0
  }
  
  weekData.days.forEach((day, dayIndex) => {
    const dayAnalysis = {
      dayName: getDayName(dayIndex === 6 ? 0 : dayIndex + 1),
      tasks: 0,
      completed: 0,
      hasWork: false
    }
    
    // 分析今日工作
    day.todayWork.forEach(task => {
      if (task.task.trim()) {
        analysis.totalTasks++
        dayAnalysis.tasks++
        dayAnalysis.hasWork = true
        
        if (task.completed) {
          analysis.completedTasks++
          dayAnalysis.completed++
        }
        
        // 统计优先级
        if (task.priority === 'high') {
          analysis.highPriorityTasks++
          if (task.completed) analysis.completedHighPriority++
        } else if (task.priority === 'medium') {
          analysis.mediumPriorityTasks++
          if (task.completed) analysis.completedMediumPriority++
        } else {
          analysis.lowPriorityTasks++
          if (task.completed) analysis.completedLowPriority++
        }
        
        // 统计星级
        analysis.totalStars += task.stars
        
        // 统计标签
        task.tags.forEach(tag => {
          analysis.tags[tag] = (analysis.tags[tag] || 0) + 1
        })
      }
    })
    
    // 分析其他工作
    day.otherWork.forEach(task => {
      if (task.task.trim()) {
        analysis.totalTasks++
        dayAnalysis.tasks++
        dayAnalysis.hasWork = true
        
        if (task.completed) {
          analysis.completedTasks++
          dayAnalysis.completed++
        }
        
        // 统计优先级
        if (task.priority === 'high') {
          analysis.highPriorityTasks++
          if (task.completed) analysis.completedHighPriority++
        } else if (task.priority === 'medium') {
          analysis.mediumPriorityTasks++
          if (task.completed) analysis.completedMediumPriority++
        } else {
          analysis.lowPriorityTasks++
          if (task.completed) analysis.completedLowPriority++
        }
        
        // 统计星级
        analysis.totalStars += task.stars
        
        // 统计标签
        task.tags.forEach(tag => {
          analysis.tags[tag] = (analysis.tags[tag] || 0) + 1
        })
      }
    })
    
    if (dayAnalysis.hasWork) {
      analysis.workDays++
    }
    
    analysis.tasksByDay.push(dayAnalysis)
  })
  
  // 计算平均星级
  analysis.averageStars = analysis.totalTasks > 0 ? (analysis.totalStars / analysis.totalTasks).toFixed(1) : 0
  
  return analysis
}

/**
 * 生成智能总结
 * @param {Object} analysis - 分析数据
 * @returns {string} 智能总结文本
 */
function generateIntelligentSummary(analysis) {
  const completionRate = analysis.totalTasks > 0 ? ((analysis.completedTasks / analysis.totalTasks) * 100).toFixed(1) : 0
  const highPriorityRate = analysis.highPriorityTasks > 0 ? ((analysis.completedHighPriority / analysis.highPriorityTasks) * 100).toFixed(1) : 0
  
  let summary = `📊 **本周工作数据分析**\n\n`
  
  // 基础数据
  summary += `**📈 整体概况**\n`
  summary += `• 工作天数：${analysis.workDays} 天\n`
  summary += `• 总任务数：${analysis.totalTasks} 项\n`
  summary += `• 完成任务：${analysis.completedTasks} 项\n`
  summary += `• 完成率：${completionRate}%\n`
  summary += `• 平均重要度：${analysis.averageStars} ⭐\n\n`
  
  // 优先级分析
  summary += `**🎯 优先级分布**\n`
  summary += `• 高优先级：${analysis.highPriorityTasks} 项 (完成 ${analysis.completedHighPriority} 项，${highPriorityRate}%)\n`
  summary += `• 中优先级：${analysis.mediumPriorityTasks} 项 (完成 ${analysis.completedMediumPriority} 项)\n`
  summary += `• 低优先级：${analysis.lowPriorityTasks} 项 (完成 ${analysis.completedLowPriority} 项)\n\n`
  
  // 工作表现评价
  summary += `**💡 工作表现评价**\n`
  if (completionRate >= 80) {
    summary += `🎉 表现优秀！本周任务完成率达到 ${completionRate}%，工作效率很高。\n`
  } else if (completionRate >= 60) {
    summary += `👍 表现良好！本周任务完成率为 ${completionRate}%，还有提升空间。\n`
  } else {
    summary += `⚠️ 需要改进！本周任务完成率仅为 ${completionRate}%，建议优化时间管理。\n`
  }
  
  if (analysis.averageStars >= 3) {
    summary += `⭐ 本周处理的任务重要度较高，体现了良好的优先级管理。\n`
  } else if (analysis.averageStars >= 2) {
    summary += `📝 本周任务重要度适中，建议关注更多高价值工作。\n`
  } else {
    summary += `🔍 本周任务重要度偏低，建议重新评估工作优先级。\n`
  }
  
  summary += `\n`
  
  // 标签分析
  if (Object.keys(analysis.tags).length > 0) {
    summary += `**🏷️ 工作领域分布**\n`
    const sortedTags = Object.entries(analysis.tags)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
    
    sortedTags.forEach(([tag, count]) => {
      summary += `• ${tag}：${count} 项\n`
    })
    summary += `\n`
  }
  
  // 改进建议
  summary += `**🚀 改进建议**\n`
  
  if (completionRate < 70) {
    summary += `• 建议将大任务分解为小任务，提高完成率\n`
    summary += `• 考虑使用番茄工作法等时间管理技巧\n`
  }
  
  if (analysis.highPriorityTasks > 0 && highPriorityRate < 80) {
    summary += `• 优先完成高优先级任务，确保重要工作不被延误\n`
  }
  
  if (analysis.workDays < 5) {
    summary += `• 保持工作连续性，建议每天都安排一些工作任务\n`
  }
  
  if (analysis.averageStars < 2.5) {
    summary += `• 重新评估任务重要性，聚焦高价值工作\n`
  }
  
  summary += `\n**📅 下周规划建议**\n`
  summary += `• 继续保持${completionRate >= 70 ? '高效的' : ''}工作节奏\n`
  summary += `• 重点关注${analysis.highPriorityTasks > analysis.completedHighPriority ? '未完成的高优先级任务' : '新的重要工作'}\n`
  summary += `• 适当调整工作量，确保工作与生活平衡\n\n`
  
  summary += `---\n`
  summary += `*本总结由AI智能分析生成，生成时间：${new Date().toLocaleString()}*`
  
  return summary
}

/**
 * 组件挂载时的初始化
 */
onMounted(() => {
  // 设置当前周为本周周一
  currentWeekStart.value = getMonday(new Date())
  
  // 加载保存的数据
  loadData()
})

/**
 * 监听周数据变化，自动保存
 */
watch(weekData, () => {
  saveData()
}, { deep: true })
</script>

<style scoped>
/* 容器样式 */
.calendar-container {
  display: flex;
  min-height: 100vh;
  font-family: 'Inter', 'SF Pro Display', 'Microsoft YaHei', system-ui, sans-serif;
  background: var(--background);
  background-attachment: fixed;
}

/* 响应式布局 */
@media (max-width: 1400px) {
  .calendar-container {
    flex-direction: column;
  }
}

.main-content {
  flex: 1;
  padding: 16px;
  max-width: calc(100% - 320px);
  backdrop-filter: var(--backdrop-blur);
}

@media (max-width: 1400px) {
  .main-content {
    max-width: 100%;
    padding: 12px;
  }
}

.week-view {
  max-width: 1400px;
  margin: 0 auto;
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 标题栏样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 8px 12px;
  background: var(--surface);
  backdrop-filter: var(--backdrop-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: hidden;
}

@media (max-width: 1200px) {
  .header {
    padding: 6px 8px;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 6px;
  }
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--primary-gradient);
}

.title {
  margin: 0;
  color: var(--text-primary);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.week-navigation {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-btn {
  padding: 12px 20px;
  border: 1px solid var(--border);
  background: var(--glass-bg);
  backdrop-filter: var(--backdrop-blur);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal) cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  color: var(--text-secondary);
}

.nav-btn:hover {
  background: var(--surface);
  border-color: var(--border-focus);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  color: var(--primary);
}

.current-week {
  font-weight: 600;
  color: var(--text-primary);
  min-width: 140px;
  text-align: center;
  font-size: 16px;
  letter-spacing: -0.01em;
}

/* 表格样式 */
.calendar-table {
  background: var(--surface);
  backdrop-filter: var(--backdrop-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  margin-bottom: 8px;
  position: relative;
  font-size: 11px;
}

@media (max-width: 1400px) {
  .calendar-table {
    font-size: 10px;
    margin-bottom: 6px;
  }
}

@media (max-width: 1200px) {
  .calendar-table {
    font-size: 9px;
    margin-bottom: 4px;
  }
}

.calendar-table::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent-gradient);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid var(--border);
  padding: 4px 3px;
  vertical-align: top;
  transition: all var(--transition-fast);
}

@media (max-width: 1400px) {
  th, td {
    padding: 3px 2px;
  }
}

@media (max-width: 1200px) {
  th, td {
    padding: 2px 1px;
  }
}

th {
  background: var(--glass-bg);
  backdrop-filter: var(--backdrop-blur);
  font-weight: 600;
  text-align: center;
  color: var(--text-primary);
  font-size: 14px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.sub-header th {
  background: var(--surface-dark);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: none;
  letter-spacing: normal;
}

.plan-subsections {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.subsection {
  font-size: 11px;
  color: #888;
}

/* 列宽设置 */
.date-column {
  width: 80px;
}

.plan-section {
  width: 300px;
}

.tomorrow-plan {
  width: 200px;
}

.weekly-summary {
  width: 200px;
}

/* 日期单元格样式 */
.date-cell {
  text-align: center;
  background: var(--glass-bg);
  backdrop-filter: var(--backdrop-blur);
  position: relative;
}

.date-cell::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--accent-gradient);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.date-cell:hover::after {
  opacity: 0.05;
}

.date-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.date-number {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.day-name {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* 计划单元格样式 */
.plan-cell, .other-work-cell {
  padding: 6px;
  background: var(--surface);
  transition: all var(--transition-normal);
}

.plan-cell:hover, .other-work-cell:hover {
  background: var(--glass-bg);
  transform: translateY(-1px);
}

.completion-grid, .other-work-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.completion-row, .other-work-row {
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 24px;
  padding: 4px;
  background: var(--glass-bg);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.completion-row:hover, .other-work-row:hover {
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}

/* 星级评分样式 */
.star-rating {
  display: flex;
  gap: 2px;
  padding: 4px;
}

.star {
  cursor: pointer;
  color: var(--text-light);
  font-size: 16px;
  transition: all var(--transition-fast) cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.star.active {
  color: #ffd700;
  transform: scale(1.1);
  filter: drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3));
}

.star:hover {
  color: #ffed4e;
  transform: scale(1.05);
}

/* 任务控件样式 */
.task-controls {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 80px;
  padding: 3px;
  background: var(--glass-bg);
  border-radius: var(--radius-sm);
  backdrop-filter: var(--backdrop-blur);
}

@media (max-width: 1200px) {
  .task-controls {
    gap: 1px;
    min-width: 60px;
    padding: 2px;
  }
}

.priority-select {
  font-size: 9px;
  padding: 4px 6px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  backdrop-filter: var(--backdrop-blur);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: 500;
}

@media (max-width: 1200px) {
  .priority-select {
    font-size: 8px;
    padding: 3px 4px;
  }
}

.priority-select:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.priority-select:hover {
  border-color: var(--primary);
}

/* 输入框样式 */
.task-input {
  flex: 1;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 3px 4px;
  font-size: 10px;
  min-width: 0;
  background: var(--surface);
  backdrop-filter: var(--backdrop-blur);
  transition: all var(--transition-fast);
  font-family: inherit;
}

@media (max-width: 1200px) {
  .task-input {
    padding: 2px 3px;
    font-size: 9px;
  }
}

.task-input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.task-input::placeholder {
  color: var(--text-light);
}

/* 优先级样式 */
.task-input.priority-high {
  border-left: 4px solid var(--danger);
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.05) 0%, var(--surface) 100%);
}

.task-input.priority-medium {
  border-left: 4px solid var(--warning);
  background: linear-gradient(135deg, rgba(250, 112, 154, 0.05) 0%, var(--surface) 100%);
}

.task-input.priority-low {
  border-left: 4px solid var(--success);
  background: linear-gradient(135deg, rgba(67, 233, 123, 0.05) 0%, var(--surface) 100%);
}

/* 任务元数据样式 */
.task-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 60px;
}

@media (max-width: 1200px) {
  .task-meta {
    gap: 1px;
    min-width: 50px;
  }
}

/* 完成状态样式 */
.completion-status {
  min-width: 40px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 9px;
  cursor: pointer;
}

@media (max-width: 1200px) {
  .checkbox-label {
    font-size: 8px;
    gap: 1px;
  }
}

.completion-checkbox {
  margin: 0;
}

/* 标签容器样式 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  padding: 4px;
}

.tag {
  background: var(--accent-gradient);
  color: white;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
  box-shadow: var(--shadow-sm);
  backdrop-filter: var(--backdrop-blur);
}

.tag:hover {
  transform: translateY(-1px) scale(1.05);
  box-shadow: var(--shadow-md);
}

.tag-input {
  border: none;
  background: var(--glass-bg);
  font-size: 11px;
  padding: 4px 6px;
  min-width: 50px;
  max-width: 80px;
  border-radius: var(--radius-sm);
  backdrop-filter: var(--backdrop-blur);
  transition: all var(--transition-fast);
}

.tag-input:focus {
  outline: none;
  background: var(--surface);
  box-shadow: 0 0 0 2px var(--border-focus);
}

/* 文本域样式 */
.tomorrow-textarea, .summary-textarea {
  width: 100%;
  height: 100%; /* 填充整个单元格高度 */
  border: none; /* 移除边框，与表格边框融合 */
  border-radius: 0; /* 移除圆角，与表格对齐 */
  padding: 12px;
  font-size: 14px;
  resize: none; /* 禁用调整大小 */
  font-family: inherit;
  background: transparent; /* 透明背景，与单元格背景融合 */
  backdrop-filter: var(--backdrop-blur);
  transition: all var(--transition-fast);
  line-height: 1.6;
  box-sizing: border-box; /* 确保padding不会超出单元格 */
}

.tomorrow-textarea:focus, .summary-textarea:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg), 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.tomorrow-textarea::placeholder, .summary-textarea::placeholder {
  color: var(--text-light);
}

/* 周度总结单元格样式 */
.summary-cell {
  vertical-align: top;
  background: var(--glass-bg);
  backdrop-filter: var(--backdrop-blur);
  height: 630px; /* 7行 × 90px = 630px，确保完美对齐 */
  padding: 0; /* 移除内边距，让textarea完全填充 */
}

@media (max-width: 1400px) {
  .summary-cell {
    height: 525px; /* 7行 × 75px = 525px */
  }
}

@media (max-width: 1200px) {
  .summary-cell {
    height: 420px; /* 7行 × 60px = 420px */
  }
}

/* 明日计划单元格样式 */
.tomorrow-cell {
  vertical-align: top;
  padding: 0; /* 移除内边距，让textarea完全填充 */
}

/* 移除了AI按钮相关样式，简化布局 */

/* 标题栏布局样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: var(--glass-bg);
  backdrop-filter: var(--backdrop-blur);
  border-bottom: 1px solid var(--glass-border);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.header-right {
  display: flex;
  align-items: center;
}

@media (max-width: 1200px) {
  .header {
    padding: 12px 16px;
    flex-direction: column;
    gap: 12px;
  }
  
  .header-left {
    gap: 16px;
    flex-direction: column;
    align-items: flex-start;
  }
}

/* 操作按钮样式 */
.actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

@media (max-width: 1200px) {
  .actions {
    gap: 8px;
    flex-wrap: wrap;
  }
}

.save-btn, .export-btn, .clear-btn {
  padding: 10px 20px;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all var(--transition-normal) cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: var(--backdrop-blur);
  box-shadow: var(--shadow-md);
}

@media (max-width: 1200px) {
  .save-btn, .export-btn, .clear-btn {
    padding: 8px 16px;
    font-size: 11px;
  }
}

.save-btn {
  background: var(--success-gradient);
  color: white;
}

.save-btn:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-xl);
}

.export-btn {
  background: var(--accent-gradient);
  color: white;
}

.export-btn:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-xl);
}

.clear-btn {
  background: var(--secondary-gradient);
  color: white;
}

.clear-btn:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-xl);
}

/* 行样式 */
.day-row {
  height: 90px; /* 缩小行高以适应页面 */
}

@media (max-width: 1400px) {
  .day-row {
    height: 75px;
  }
}

@media (max-width: 1200px) {
  .day-row {
    height: 60px;
  }
}

.day-row:nth-child(even) {
  background: #fafafa;
}

.day-row:hover {
  background: #f0f8ff;
}

/* 当前日期行的特殊样式 */
.today-row {
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(126, 34, 206, 0.05) 100%);
  border-left: 4px solid #8b5cf6;
  position: relative;
}

.today-row::before {
  content: '今日';
  position: absolute;
  top: 8px;
  left: 8px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: 600;
  z-index: 1;
}

.today-row:hover {
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(126, 34, 206, 0.08) 100%);
}

/* 当前日期的日期单元格样式 */
.today-row .date-cell {
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(126, 34, 206, 0.2) 100%);
  color: #8b5cf6;
  font-weight: normal;
}

.today-row .date-cell .date-number {
    font-size: inherit;
    color: #8b5cf6;
    font-weight: normal;
  }

.today-row .date-cell .day-name {
  color: #8b5cf6;
  font-weight: normal;
}

/* 确保所有单元格垂直对齐 */
.day-row td {
  vertical-align: top;
  height: 120px;
}

@media (max-width: 1400px) {
  .day-row td {
    height: 100px;
  }
}

@media (max-width: 1200px) {
  .day-row td {
    height: 80px;
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .calendar-container {
    padding: 10px;
  }
  
  .header {
    flex-direction: column;
    gap: 10px;
  }
  
  .plan-section {
    width: 250px;
  }
  
  .tomorrow-plan, .weekly-summary {
    width: 150px;
  }
}

@media (max-width: 768px) {
  .calendar-table {
    overflow-x: auto;
  }
  
  table {
    min-width: 800px;
  }
  
  .actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>