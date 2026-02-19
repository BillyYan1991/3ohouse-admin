<script setup lang="ts"></script>

<template>
  <div class="app">
    <main>
      <router-view />
    </main>
  </div>
</template>

<style scoped>
main {
  padding-inline: 12px;
}

@media (min-width: 768px) {
  main {
    padding-inline: 0;
  }
}
</style>
