<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="items-center">
        <q-space />

        <q-toolbar-title class="text-center text-h5 text-bolder q-py-sm">
          Report App
        </q-toolbar-title>

        <q-space />

        <q-btn
          v-if="!authStore.isAuthenticated"
          label="Login"
          :to="{ name: 'login' }"
          color="primary"
          class="q-my-md q-px-sm q-py-xs q-mx-xl"
        />
        <q-btn
          v-else
          label="Logout"
          @click="handleLogout"
          color="negative"
          class="q-my-md q-px-sm q-py-xs q-mx-xl"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useAuthStore } from 'src/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>
