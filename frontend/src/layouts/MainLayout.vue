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
          label="Login"
          :to="{ name: 'login' }"
          color="primary"
          class="q-my-md q-px-sm q-py-xs q-mx-xl"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
