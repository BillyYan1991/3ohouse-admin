<script setup lang="ts"></script>

<template>
  <div id="app">
    <main>
      <router-view />
    </main>
  </div>
</template>

<style scoped>
/* component-scoped styles */
nav {
  padding: 12px;
}
</style>

<style>
/* import global CSS from public folder */
@import url('/css/portal.css');
</style>
