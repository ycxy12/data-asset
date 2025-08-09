<template>
    <el-dropdown trigger="click" :teleported="false">
        <div class="more-button">
            <el-icon><ArrowDownBold /></el-icon>
        </div>
        <template #dropdown>
            <el-dropdown-menu>
                <el-dropdown-item @click="closeCurrentTab">
                    <el-icon><Remove /></el-icon>
                    关闭当前
                </el-dropdown-item>
                <el-dropdown-item @click="tabStore.closeTabsOnSide(route.fullPath, 'left')">
                    <el-icon><DArrowLeft /></el-icon>
                    关闭左侧
                </el-dropdown-item>
                <el-dropdown-item @click="tabStore.closeTabsOnSide(route.fullPath, 'right')">
                    <el-icon><DArrowRight /></el-icon>
                    关闭右侧
                </el-dropdown-item>
                <el-dropdown-item divided @click="tabStore.closeMultipleTab(route.fullPath)">
                    <el-icon><CircleClose /></el-icon>
                    关闭其他
                </el-dropdown-item>
                <el-dropdown-item @click="closeAllTab">
                    <el-icon><FolderDelete /></el-icon>
                    关闭全部
                </el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>

<script setup>
import { HOME_URL } from '@/config'
import { useTabsStore } from '@/store/modules/tabs'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const tabStore = useTabsStore()

// Close Current
const closeCurrentTab = () => {
    if (route.meta.isAffix) return
    tabStore.removeTabs(route.fullPath)
}

// Close All
const closeAllTab = () => {
    tabStore.closeMultipleTab()
    router.push(HOME_URL)
}
</script>

<style scoped lang="scss">
@use '../index.scss';
</style>
