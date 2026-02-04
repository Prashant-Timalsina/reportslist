<template>
  <router-view />
</template>

<script setup>
import { useAuthStore } from 'src/stores/auth'
import { onMounted } from 'vue'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initializeAuth()
})
</script>
