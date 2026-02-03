<template>
  <q-page padding class="flex flex-center">
    <q-card style="width: 100%; max-width: 400px">
      <q-card-section>
        <p class="text-h4 text-center q-pb-lg">
          {{ stateValue === 'login' ? 'Login Page' : 'Signup Page' }}
        </p>

        <q-form @submit.prevent="handleSubmit">
          <q-input
            v-if="stateValue === 'register'"
            v-model="loginData.email"
            type="email"
            label="Email"
            placeholder="Enter email"
            clearable
            outlined
            class="q-pb-md"
          />
          <q-input
            v-model="loginData.username"
            label="Username"
            placeholder="Enter your username"
            clearable
            outlined
            class="q-pb-md"
          />

          <q-input
            v-model="loginData.password"
            label="Password"
            :type="isPassword ? 'password' : 'text'"
            placeholder="Enter Password"
            clearable
            outlined
            class="q-pb-md"
          >
            <template v-slot:append>
              <q-icon
                :name="isPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPassword = !isPassword"
              />
            </template>
          </q-input>

          <div class="text-center q-mt-md">
            <p v-if="stateValue === 'register'">
              Already have an account?
              <span @click="toggleState" class="text-primary cursor-pointer">Login Here</span>
            </p>
            <p v-if="stateValue === 'login'">
              Don't have an account?
              <span @click="toggleState" class="text-primary cursor-pointer">Register Here</span>
            </p>
          </div>

          <q-btn
            type="submit"
            :label="stateValue === 'login' ? 'Login' : 'Register'"
            color="primary"
            class="full-width"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useRouter } from 'vue-router'

const stateValue = ref('login')
const loginData = ref({
  email: '',
  username: '',
  password: '',
})

const isPassword = ref(true)
const authStore = useAuthStore()
const router = useRouter()

const toggleState = () => {
  stateValue.value = stateValue.value === 'login' ? 'register' : 'login'
}

const handleSubmit = async () => {
  const data = loginData.value
  try {
    if (stateValue.value === 'login') {
      await authStore.login({ email: data.username || data.email, password: data.password })
      router.push('/')
    } else {
      await authStore.signup({ email: data.email, password: data.password, role: 'user' })
      stateValue.value = 'login'
    }
  } catch (err) {
    console.error('Auth error', err)
  }
}
</script>
