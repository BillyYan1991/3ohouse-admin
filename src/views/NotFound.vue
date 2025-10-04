<template>
  <div class="app app-notfound p-5 text-center">
    <h1>404 • 找不到頁面</h1>
    <p>您要的頁面不存在或路徑錯誤。</p>
    <div class="mt-3">
      <router-link :to="{ name: 'Index' }" class="btn app-btn-primary">回首頁</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NotFoundView',
})
</script>

<style scoped>
/* minimal styling */
.app-notfound h1 {
  font-size: 2rem;
}
</style>
