<!--
 * 侧边栏组件
 * 功能：视图切换（周度/月度/季度）、日历显示、待办事项管理
 * 作者：AI Assistant
 * 创建时间：2024
-->
<template>
  <div class="sidebar">
    <!-- 视图切换 -->
    <div class="view-selector">
      <h3 class="section-title">视图选择</h3>
      <div class="view-buttons">
        <button 
          v-for="view in viewOptions" 
          :key="view.value"
          :class="['view-btn', { active: currentView === view.value }]"
          @click="switchView(view.value)"
        >
          {{ view.label }}
        </button>
      </div>
    </div>

    <!-- 日历组件 -->
    <div class="calendar-section">
      <h3 class="section-title">日历</h3>
      <div class="mini-calendar">
        <!-- 月份导航 -->
        <div class="calendar-header">
          <button @click="previousMonth" class="nav-btn">‹</button>
          <span class="month-year">{{ currentMonthText }}</span>
          <button @click="nextMonth" class="nav-btn">›</button>
        </div>
        
        <!-- 星期标题 -->
        <div class="weekdays">
          <div v-for="day in weekdayLabels" :key="day" class="weekday">{{ day }}</div>
        </div>
        
        <!-- 日期网格 -->
        <div class="calendar-grid">
          <div 
            v-for="date in calendarDates" 
            :key="date.key"
            :class="[
              'calendar-date',
              {
                'other-month': !date.isCurrentMonth,
                'today': date.isToday,
                'selected': date.isSelected,
                'has-todos': date.hasTodos
              }
            ]"
            @click="selectDate(date)"
          >
            {{ date.day }}
            <div v-if="date.hasTodos" class="todo-indicator"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 待办事项 -->
    <div class="todos-section">
      <h3 class="section-title">{{ selectedDateText }} 待办事项</h3>
      
      <!-- 添加待办 -->
      <div class="add-todo">
        <input 
          v-model="newTodoText" 
          @keyup.enter="addTodo"
          type="text" 
          placeholder="添加新的待办事项..."
          class="todo-input"
        />
        <button @click="addTodo" class="add-btn">+</button>
      </div>
      
      <!-- 待办列表 -->
      <div class="todos-list">
        <div 
          v-for="(todo, index) in selectedDateTodos" 
          :key="todo.id"
          :class="['todo-item', { completed: todo.completed }]"
        >
          <input 
            v-model="todo.completed" 
            type="checkbox" 
            class="todo-checkbox"
          />
          <span 
            v-if="!todo.editing"
            @dblclick="editTodo(todo)"
            class="todo-text"
          >
            {{ todo.text }}
          </span>
          <input 
            v-else
            v-model="todo.text"
            @blur="finishEdit(todo)"
            @keyup.enter="finishEdit(todo)"
            @keyup.esc="cancelEdit(todo)"
            class="todo-edit-input"
            ref="editInput"
          />
          <button @click="deleteTodo(index)" class="delete-btn">×</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'

/**
 * 组件事件定义
 */
const emit = defineEmits(['view-change', 'date-select'])

/**
 * 响应式数据
 */
const currentView = ref('week')
const currentMonth = ref(new Date())
const selectedDate = ref(new Date())
const newTodoText = ref('')
const todos = ref({})

/**
 * 视图选项
 */
const viewOptions = [
  { value: 'week', label: '周度' },
  { value: 'month', label: '月度' },
  { value: 'quarter', label: '季度' }
]

/**
 * 星期标签
 */
const weekdayLabels = ['日', '一', '二', '三', '四', '五', '六']

/**
 * 计算属性：当前月份文本
 */
const currentMonthText = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth() + 1
  return `${year}年${month}月`
})

/**
 * 计算属性：选中日期文本
 */
const selectedDateText = computed(() => {
  const year = selectedDate.value.getFullYear()
  const month = selectedDate.value.getMonth() + 1
  const day = selectedDate.value.getDate()
  return `${year}年${month}月${day}日`
})

/**
 * 计算属性：日历日期数组
 */
const calendarDates = computed(() => {
  const dates = []
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  
  // 获取当月第一天和最后一天
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  // 获取第一周的开始日期（周日开始）
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  // 生成6周的日期
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const dateKey = formatDateKey(date)
    const isCurrentMonth = date.getMonth() === month
    const isToday = isSameDate(date, new Date())
    const isSelected = isSameDate(date, selectedDate.value)
    const hasTodos = todos.value[dateKey] && todos.value[dateKey].length > 0
    
    dates.push({
      key: dateKey,
      day: date.getDate(),
      date: new Date(date),
      isCurrentMonth,
      isToday,
      isSelected,
      hasTodos
    })
  }
  
  return dates
})

/**
 * 计算属性：选中日期的待办事项
 */
const selectedDateTodos = computed(() => {
  const dateKey = formatDateKey(selectedDate.value)
  return todos.value[dateKey] || []
})

/**
 * 方法：切换视图
 */
const switchView = (view) => {
  currentView.value = view
  emit('view-change', view)
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
 * 方法：选择日期
 */
const selectDate = (dateObj) => {
  selectedDate.value = new Date(dateObj.date)
  emit('date-select', selectedDate.value)
}

/**
 * 方法：添加待办事项
 */
const addTodo = () => {
  if (!newTodoText.value.trim()) return
  
  const dateKey = formatDateKey(selectedDate.value)
  if (!todos.value[dateKey]) {
    todos.value[dateKey] = []
  }
  
  todos.value[dateKey].push({
    id: Date.now(),
    text: newTodoText.value.trim(),
    completed: false,
    editing: false,
    originalText: ''
  })
  
  newTodoText.value = ''
  saveTodos()
}

/**
 * 方法：删除待办事项
 */
const deleteTodo = (index) => {
  const dateKey = formatDateKey(selectedDate.value)
  todos.value[dateKey].splice(index, 1)
  saveTodos()
}

/**
 * 方法：编辑待办事项
 */
const editTodo = (todo) => {
  todo.editing = true
  todo.originalText = todo.text
  nextTick(() => {
    const input = document.querySelector('.todo-edit-input')
    if (input) input.focus()
  })
}

/**
 * 方法：完成编辑
 */
const finishEdit = (todo) => {
  todo.editing = false
  if (!todo.text.trim()) {
    todo.text = todo.originalText
  }
  saveTodos()
}

/**
 * 方法：取消编辑
 */
const cancelEdit = (todo) => {
  todo.editing = false
  todo.text = todo.originalText
}

/**
 * 工具函数：格式化日期键
 */
const formatDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 工具函数：判断是否为同一天
 */
const isSameDate = (date1, date2) => {
  return formatDateKey(date1) === formatDateKey(date2)
}

/**
 * 方法：保存待办事项到uTools数据库
 */
const saveTodos = () => {
  try {
    if (window.utools && window.utools.db) {
      // 获取现有文档以保留_rev字段
      const existingDoc = window.utools.db.get('calendar_todos_data')
      const docToSave = {
        _id: 'calendar_todos_data',
        data: todos.value,
        lastModified: new Date().toISOString()
      }
      
      // 如果文档已存在，保留_rev字段
      if (existingDoc && existingDoc._rev) {
        docToSave._rev = existingDoc._rev
      }
      
      window.utools.db.put(docToSave)
    } else {
      localStorage.setItem('calendar_todos_data', JSON.stringify(todos.value))
    }
  } catch (error) {
    console.error('保存待办事项失败:', error)
  }
}

/**
 * 方法：从uTools数据库加载待办事项
 */
const loadTodos = () => {
  try {
    if (window.utools && window.utools.db) {
      const doc = window.utools.db.get('calendar_todos_data')
      if (doc && doc.data) {
        todos.value = doc.data
      }
    } else {
      const data = localStorage.getItem('calendar_todos_data')
      if (data) {
        todos.value = JSON.parse(data)
      }
    }
  } catch (error) {
    console.error('加载待办事项失败:', error)
  }
}

/**
 * 监听待办事项变化，自动保存
 */
watch(todos, () => {
  saveTodos()
}, { deep: true })

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  loadTodos()
})
</script>

<style scoped>
.sidebar {
  width: 320px;
  height: 100vh;
  background: var(--glass-bg);
  backdrop-filter: var(--backdrop-blur);
  border-right: 1px solid var(--glass-border);
  padding: 32px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
  position: relative;
}

.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  background: var(--primary-gradient);
  opacity: 0.3;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  padding-bottom: 8px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 2px;
  background: var(--accent-gradient);
  border-radius: 1px;
}

/* 视图选择器样式 */
.view-selector {
  flex-shrink: 0;
}

.view-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.view-btn {
  padding: 14px 20px;
  border: 1px solid var(--border);
  background: var(--surface);
  backdrop-filter: var(--backdrop-blur);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal) cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  position: relative;
  overflow: hidden;
}

.view-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left var(--transition-slow);
}

.view-btn:hover::before {
  left: 100%;
}

.view-btn:hover {
  background: var(--glass-bg);
  border-color: var(--border-focus);
  transform: translateX(4px);
  box-shadow: var(--shadow-md);
  color: var(--primary);
}

.view-btn.active {
  background: var(--primary-gradient);
  color: white;
  border-color: transparent;
  box-shadow: var(--shadow-lg);
}

/* 日历样式 */
.calendar-section {
  flex-shrink: 0;
}

.mini-calendar {
  background: var(--surface);
  backdrop-filter: var(--backdrop-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-lg);
  position: relative;
}

.mini-calendar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--accent-gradient);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.month-year {
  font-weight: 700;
  font-size: 16px;
  color: var(--text-primary);
  background: var(--secondary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-btn {
  background: var(--surface);
  border: 1px solid var(--border);
  font-size: 16px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  color: var(--text-secondary);
  backdrop-filter: var(--backdrop-blur);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
}

.nav-btn:hover {
  background: var(--glass-bg);
  border-color: var(--border-focus);
  color: var(--primary);
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-light);
  padding: 8px 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-date {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  position: relative;
  transition: all var(--transition-fast) cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--surface-light);
  border: 1px solid transparent;
}

.calendar-date::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--accent-gradient);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.calendar-date:hover {
  background: var(--glass-bg);
  border-color: var(--border-focus);
  transform: scale(1.05);
  box-shadow: var(--shadow-sm);
  color: var(--primary);
}

.calendar-date:hover::before {
  opacity: 0.1;
}

.calendar-date.other-month {
  color: var(--text-disabled);
  opacity: 0.4;
}

.calendar-date.today {
  background: var(--success-gradient);
  color: white;
  font-weight: 700;
  box-shadow: var(--shadow-md);
  transform: scale(1.05);
}

.calendar-date.selected {
  background: var(--primary-gradient);
  color: white;
  font-weight: 700;
  box-shadow: var(--shadow-lg);
  transform: scale(1.1);
}

.calendar-date.has-todos::after {
  content: '';
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 6px;
  height: 6px;
  background: var(--accent-gradient);
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(255, 68, 68, 0.5);
  z-index: 1;
}

/* 待办事项样式 */
.todos-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.add-todo {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.todo-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 14px;
  background: var(--surface);
  backdrop-filter: var(--backdrop-blur);
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.todo-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: var(--glass-bg);
}

.todo-input::placeholder {
  color: var(--text-light);
}

.add-btn {
  width: 44px;
  height: 44px;
  background: var(--primary-gradient);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);
}

.add-btn:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-lg);
}

.add-btn:active {
  transform: scale(0.95);
}

.todos-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 4px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: var(--surface);
  backdrop-filter: var(--backdrop-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal) cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.todo-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--accent-gradient);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.todo-item:hover {
  background: var(--glass-bg);
  border-color: var(--border-focus);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.todo-item:hover::before {
  opacity: 1;
}

.todo-item.completed {
  opacity: 0.7;
  background: var(--surface-light);
}

.todo-item.completed::before {
  background: var(--success-gradient);
  opacity: 0.6;
}

.todo-checkbox {
  margin: 0;
  width: 18px;
  height: 18px;
  accent-color: var(--primary);
  cursor: pointer;
}

.todo-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  line-height: 1.5;
  transition: color var(--transition-fast);
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: var(--text-light);
}

.todo-edit-input {
  flex: 1;
  border: 1px solid var(--primary);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  font-size: 14px;
  background: var(--surface);
  color: var(--text-primary);
  font-weight: 500;
}

.todo-edit-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.delete-btn {
  width: 28px;
  height: 28px;
  background: var(--error-gradient);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  opacity: 0.8;
}

.delete-btn:hover {
  opacity: 1;
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

.delete-btn:active {
  transform: scale(0.9);
}

/* 事件列表样式 */
.events-section {
  flex: 1;
  min-height: 0;
}

.events-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  background: var(--surface);
  backdrop-filter: var(--backdrop-blur);
  box-shadow: var(--shadow-lg);
  position: relative;
}

.events-list::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--accent-gradient);
}

.event-item {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  transition: all var(--transition-normal) cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  background: transparent;
}

.event-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--primary-gradient);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.event-item:hover {
  background: var(--glass-bg);
  transform: translateX(8px);
  box-shadow: var(--shadow-md);
}

.event-item:hover::before {
  opacity: 1;
}

.event-item:last-child {
  border-bottom: none;
}

.event-time {
  font-size: 12px;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.event-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  line-height: 1.4;
}

.event-description {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
  opacity: 0.8;
}

/* 滚动条样式 */
.sidebar::-webkit-scrollbar,
.todos-list::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track,
.todos-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb,
.todos-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover,
.todos-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
/* 滚动条样式 */
.sidebar::-webkit-scrollbar,
.events-list::-webkit-scrollbar,
.todos-list::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track,
.events-list::-webkit-scrollbar-track,
.todos-list::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb,
.events-list::-webkit-scrollbar-thumb,
.todos-list::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 3px;
  transition: background var(--transition-fast);
}

.sidebar::-webkit-scrollbar-thumb:hover,
.events-list::-webkit-scrollbar-thumb:hover,
.todos-list::-webkit-scrollbar-thumb:hover {
  background: var(--border-focus);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 280px;
    padding: 24px 16px;
  }
  
  .view-btn {
    padding: 12px 16px;
    font-size: 13px;
  }
  
  .mini-calendar {
    padding: 16px;
  }
  
  .calendar-nav {
    min-width: 32px;
    height: 32px;
    font-size: 14px;
  }
  
  .todo-item {
    padding: 12px 16px;
  }
  
  .event-item {
    padding: 12px 16px;
  }
}

/* 动画效果 */
@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.sidebar {
  animation: slideInLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.view-selector,
.calendar-section,
.events-section,
.todos-section {
  animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.view-selector {
  animation-delay: 0.1s;
}

.calendar-section {
  animation-delay: 0.2s;
}

.events-section {
  animation-delay: 0.3s;
}

.todos-section {
  animation-delay: 0.4s;
}
</style>