<template>
    <el-icon class="collapse-icon" @click="changeCollapse">
        <component :is="authStore.isCollapse ? 'expand' : 'fold'"></component>
    </el-icon>
</template>

<script setup>
import { useAuthStore } from '@/store/modules/auth'

const authStore = useAuthStore()
const changeCollapse = () => authStore.setCollapse(!authStore.isCollapse)
</script>

<style scoped lang="scss">
.collapse-icon {
    margin-right: 20px;
    font-size: 22px;
    color: var(--el-header-text-color);
    cursor: pointer;
}
</style>
