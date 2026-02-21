<template>
  <div class="app-content pt-3 p-md-3 p-lg-4">
    <div class="calendar-toolbar mb-2">
      <button class="btn btn-outline-primary relogin-btn" @click="relogin">重新登入</button>
    </div>
    <div class="calendar-frame-wrapper">
      <iframe class="calendar-iframe"
        :src="`https://calendar.google.com/calendar/embed?src=${calendarId}&ctz=Asia%2FTaipei`" style="border: 0"
        width="1200" height="800" frameborder="0" scrolling="yes"></iframe>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { clearToken } from '@/utils/auth'
export default defineComponent({
  name: 'CalendarForm',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const calendarId = computed(() => (route.params.id as string) || '')

    function relogin() {
      clearToken()
      router.push({ name: 'Login', query: { redirect: route.fullPath } })
    }
    return {
      calendarId
      , relogin
    }
  }
});
</script>

<style scoped>
.calendar-frame-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  /* smooth touch scrolling on iOS */
}

.calendar-frame-wrapper::-webkit-scrollbar {
  height: 8px
}

.calendar-frame-wrapper::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px
}

.calendar-iframe {
  display: block;
  width: 1200px;
  /* keep the same embed width so smaller viewports can scroll horizontally */
  max-width: none;
}

@media (min-width: 1200px) {
  .calendar-iframe {
    width: 100%;
  }
}

.calendar-toolbar {
  display: flex;
  justify-content: flex-end;
}

.relogin-btn {
  padding: 0.35rem 0.75rem;
}
</style>
