<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import Calendar from './Calendar/index.vue'

const route = ref('')
const enterAction = ref({})

/**
 * 组件挂载时初始化utools插件监听
 * 在开发环境中提供模拟的utools对象
 */
onMounted(() => {
  // 检查utools对象是否存在，如果不存在则创建模拟对象（用于开发环境）
  if (!window.utools) {
    // 开发环境模拟utools对象
    window.utools = {
      onPluginEnter: (callback) => {
        // 模拟插件进入事件，默认进入calendar功能
        setTimeout(() => {
          callback({ code: 'calendar', type: 'over', payload: '' })
        }, 100)
      },
      onPluginOut: (callback) => {
        // 模拟插件退出事件
      },
      // 模拟数据库API
      db: {
        get: (key) => {
          const data = localStorage.getItem(`utools_${key}`)
          return data ? JSON.parse(data) : null
        },
        put: (doc) => {
          if (doc._id) {
            localStorage.setItem(`utools_${doc._id}`, JSON.stringify(doc))
            return { ok: true, id: doc._id, rev: Date.now().toString() }
          }
          return { ok: false }
        },
        remove: (id) => {
          localStorage.removeItem(`utools_${id}`)
          return { ok: true }
        },
        allDocs: () => {
          const docs = []
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith('utools_')) {
              const data = localStorage.getItem(key)
              if (data) {
                docs.push(JSON.parse(data))
              }
            }
          }
          return { rows: docs.map(doc => ({ doc })) }
        }
      }
    }
  }

  // 注册插件进入事件监听
  window.utools.onPluginEnter((action) => {
    route.value = action.code
    enterAction.value = action
  })
  
  // 注册插件退出事件监听
  window.utools.onPluginOut((isKill) => {
    route.value = ''
  })
})
</script>

<template>
  <template v-if="route === 'hello'">
    <Hello :enterAction="enterAction"></Hello>
  </template>
  <template v-if="route === 'read'">
    <Read :enterAction="enterAction"></Read>
  </template>
  <template v-if="route === 'write'">
    <Write :enterAction="enterAction"></Write>
  </template>
  <template v-if="route === 'calendar'">
    <Calendar :enterAction="enterAction"></Calendar>
  </template>
</template>
