/**
 * v-auth
 * 按钮权限指令
 */
import { useAuthStore } from '@/store/modules/auth'

const auth = {
    mounted(el, { value }) {
        const { authButtonListGet = [] } = useAuthStore()

        // 没有传权限值 或 没有权限列表 直接移除
        if (!value || authButtonListGet.length === 0) {
            el.remove()
            return
        }

        // 统一转成数组判断
        const values = Array.isArray(value) ? value : [value]
        if (!values.every((v) => authButtonListGet.includes(v))) {
            el.remove()
        }
    },
}

export default auth

export function hasAuth(value) {
    const authStore = useAuthStore()
    const permissionList = authStore.authButtonListGet || []
    return permissionList.includes(value)
}
