<template>
  <Header />
  <!-- 包一層 .app 使用 portal.css 中的 padding-top:56px，讓固定 header 不會蓋到內容 -->

  <!-- 子路由會渲染在這裡 -->
  <div class="app-wrapper">
    <router-view />
  </div>


</template>

<script setup lang="ts">
import Header from '@/components/AppHeader.vue'
</script>
