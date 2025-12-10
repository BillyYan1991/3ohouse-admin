<template>
  <div class="app-content pt-3 p-md-3 p-lg-4">
    <div class="calendar-frame-wrapper">
      <iframe class="calendar-iframe"
        :src="`https://calendar.google.com/calendar/embed?src=${calendarId}&ctz=Asia%2FTaipei`" style="border: 0"
        width="1200" height="800" frameborder="0" scrolling="yes"></iframe>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useRoute } from 'vue-router'
export default defineComponent({
  name: 'CalendarForm',
  setup() {
    const route = useRoute()
    const calendarId = computed(() => (route.params.id as string) || '')
    return {
      calendarId
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
</style>
