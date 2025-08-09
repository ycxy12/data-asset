import { defineStore } from 'pinia'
import piniaPersistConfig from '@/config/piniaPersist'

export const useUserStore = defineStore('mb-user', {
    state: () => ({
        token: '',
        expireTime: '',
        userInfo: {},
    }),
    getters: {},
    actions: {
        // 设置token
        setToken(token) {
            this.token = token
        },
        setExpireTime(expireTime) {
            this.expireTime = expireTime
        },
        setUserInfo(userInfo) {
            this.userInfo = userInfo
        },
    },
    persist: piniaPersistConfig('mb-user'),
})
