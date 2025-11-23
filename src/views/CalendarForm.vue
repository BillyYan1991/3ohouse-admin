<template>
  <div class="app-content pt-3 p-md-3 p-lg-4">
    <iframe :src="`https://calendar.google.com/calendar/embed?src=${calendarId}&ctz=Asia%2FTaipei`" style="border: 0"
      width="1200" height="800" frameborder="0" scrolling="no"></iframe>
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
/* simple placeholder */
</style>
