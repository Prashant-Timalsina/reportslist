import { defineStore } from "pinia";
import { api } from "src/boot/axios";

const useAuthStore = defineStore("auth", {

    state: () => ({
        user:[],
        token:null,
        isAuthenticated:false,
        _refreshTimeoutId: null,
    }),
    actions:{
        initializeAuth(){
            const token = localStorage.getItem('token')
            if(token){
                this.token = token
                this.isAuthenticated = true
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`
                // Reschedule token refresh if token exists
                try {
                    const parts = token.split('.')
                    if (parts.length === 3) {
                        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
                        if (payload && payload.exp) {
                            const expiresAt = payload.exp * 1000
                            const refreshAt = expiresAt - 60 * 1000
                            const delay = Math.max(refreshAt - Date.now(), 5 * 1000)
                            if (this._refreshTimeoutId) {
                                clearTimeout(this._refreshTimeoutId)
                                this._refreshTimeoutId = null
                            }
                            this._refreshTimeoutId = setTimeout(() => {
                                this.refresh().catch((e) => { console.log('Auto refresh failed', e) })
                            }, delay)
                        }
                    }
                } catch (e) {
                    console.log('Error scheduling token refresh', e)
                }
            }
        },
        async setToken(token){
            this.token = token;

            if(token){
                localStorage.setItem('token', token);
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                // schedule automatic refresh based on JWT exp
                try {
                    const parts = token.split('.')
                    if (parts.length === 3) {
                        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
                        if (payload && payload.exp) {
                            const expiresAt = payload.exp * 1000 // ms
                            const refreshAt = expiresAt - 60 * 1000 // refresh 1 minute before expiry
                            const delay = Math.max(refreshAt - Date.now(), 5 * 1000) // at least 5s
                            if (this._refreshTimeoutId) {
                                clearTimeout(this._refreshTimeoutId)
                                this._refreshTimeoutId = null
                            }
                            this._refreshTimeoutId = setTimeout(() => {
                                this.refresh().catch((e) => { console.log('Auto refresh failed', e) })
                            }, delay)
                        }
                    }
                } catch (e) {
                    console.log('Error scheduling token refresh', e)
                }
            }
        }
        ,
        async signup(payload){
            const res = await api.post('/auth/signup', payload)
            return res.data
        },
        async login(form){
            // OAuth2PasswordRequestForm expects username & password fields
            const payload = new URLSearchParams()
            payload.append('username', form.email)
            payload.append('password', form.password)

            const res = await api.post('/auth/login', payload, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })
            const data = res.data
            if(data && data.access_token){
                await this.setToken(data.access_token)
                if(data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token)
                this.isAuthenticated = true
            }
            return data
        },
        async refresh(){
            const refresh_token = localStorage.getItem('refresh_token')
            if(!refresh_token) return null
            const res = await api.post('/auth/refresh', { refresh_token })
            const data = res.data
            // Support different response shapes: { access_token } or { access } or { token }
            const newAccess = data?.access_token || data?.access || data?.token || null
            if (newAccess) {
                await this.setToken(newAccess)
                this.isAuthenticated = true
            }
            return data
        },
        async logout(){
            const refresh_token = localStorage.getItem('refresh_token')
            try{
                if(refresh_token) await api.post('/auth/logout', { refresh_token })
            }catch(e){ console.log(e) }
            localStorage.removeItem('token')
            localStorage.removeItem('refresh_token')
            this.token = null
            this.isAuthenticated = false
            delete api.defaults.headers.common['Authorization']
            if (this._refreshTimeoutId) {
                clearTimeout(this._refreshTimeoutId)
                this._refreshTimeoutId = null
            }
        }
    }
})
export { useAuthStore }