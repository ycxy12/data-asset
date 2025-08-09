<template>
    <Tabs />
    <el-main>
        <router-view v-slot="{ Component, route }">
            <transition appear name="fade-transform" mode="out-in">
                <keep-alive :include="keepAliveName">
                    <component :is="createComponentWrapper(Component, route)" v-if="isRouterShow" :key="route.fullPath" />
                </keep-alive>
            </transition>
        </router-view>
    </el-main>
</template>

<script setup>
import { ref, onBeforeUnmount, provide, h } from 'vue'
import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { useAuthStore } from '@/store/modules/auth'
import { useKeepAliveStore } from '@/store/modules/keepAlive'
import Tabs from '@/layouts/components/Tabs/index.vue'

const authStore = useAuthStore()
const { isCollapse } = storeToRefs(authStore)

const keepAliveStore = useKeepAliveStore()
const { keepAliveName } = storeToRefs(keepAliveStore)

// 注入刷新页面方法
const isRouterShow = ref(true)
const refreshCurrentPage = (val) => (isRouterShow.value = val)
provide('refresh', refreshCurrentPage)

// 解决详情页 keep-alive 问题
const wrapperMap = new Map()
function createComponentWrapper(component, route) {
    if (!component) return
    const wrapperName = route.fullPath
    let wrapper = wrapperMap.get(wrapperName)
    if (!wrapper) {
        wrapper = { name: wrapperName, render: () => h(component) }
        wrapperMap.set(wrapperName, wrapper)
    }
    return h(wrapper)
}

// 监听窗口大小变化，折叠侧边栏
const screenWidth = ref(0)
const listeningWindow = useDebounceFn(() => {
    screenWidth.value = document.body.clientWidth
    if (!isCollapse.value && screenWidth.value < 1200) authStore.setCollapse(true)
    if (isCollapse.value && screenWidth.value > 1200) authStore.setCollapse(false)
}, 100)
window.addEventListener('resize', listeningWindow, false)
onBeforeUnmount(() => {
    window.removeEventListener('resize', listeningWindow)
})
</script>

<style scoped lang="scss">
@use './index.scss';
</style>
