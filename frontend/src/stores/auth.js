import { defineStore } from "pinia";
import { api } from "src/boot/axios";

const useAuthStore = defineStore("auth", {

    state: () => ({
        user:[],
        token:null,
        isAuthenticated:false
    }),
    actions:{
        async setToken(token){
            this.token = token;

            if(token){
                localStorage.setItem('token', token);
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
        }
    }
})