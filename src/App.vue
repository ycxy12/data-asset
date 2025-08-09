<template>
    <el-config-provider :locale="locale">
        <router-view></router-view>
    </el-config-provider>
</template>

<script setup>
import { computed, watchEffect } from 'vue'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import plusZhCn from 'plus-pro-components/es/locale/lang/zh-cn'
import watermark from '@/utils/watermark'
import { useUserStore } from '@/store/modules/user'

//配置中文
const locale = computed(() => {
    return { ...zhCn, ...plusZhCn }
})

const userStore = useUserStore()
const userName = computed(() => userStore.userInfo.userName)
// 添加水印
watchEffect(() => {
    if (userName.value) watermark(userName.value)
})
</script>

<style lang="scss">
#app {
    // --el-color-primary: #2072f5;
    --el-text-color-regular: rgba(0, 0, 0, 0.88);
    .el-table {
        --el-table-header-text-color: rgba(0, 0, 0, 0.88);
    }
}
</style>
