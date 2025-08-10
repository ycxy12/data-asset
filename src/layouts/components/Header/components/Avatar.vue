<template>
    <el-dropdown trigger="click">
        <div class="avatar">
            {{ userName }}
        </div>
        <template #dropdown>
            <el-dropdown-menu>
                <el-dropdown-item @click="logout">
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                </el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>

<script setup>
import { computed } from 'vue'
import { LOGIN_URL } from '@/config'
import { useRouter } from 'vue-router'
import { logoutApi } from '@/api/login'
import { useUserStore } from '@/store/modules/user'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const userName = computed(() => userStore.userInfo.userName)

// 退出登录
const logout = () => {
    ElMessageBox.confirm('您是否确认退出登录?', '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        // 1.执行退出登录接口
        await logoutApi()

        // 2.清除 Token
        userStore.setToken('')
        
        ElMessage.success('退出登录成功！')
        // 3.重定向到登陆页
        router.replace(LOGIN_URL)
    })
}
</script>

<style scoped lang="scss">
.avatar {
    color: #333;
    cursor: pointer;
    margin-left: 20px;
    &:hover {
        color: #2072f5;
    }
}
</style>
