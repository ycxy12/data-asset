<!-- 纵向布局 -->
<template>
    <el-container class="layout">
        <el-aside>
            <div class="aside-box" :style="{ width: isCollapse ? '80px' : '240px' }">
                <div class="logo">
                    <img class="logo-img" src="@/assets/images/logo.png" alt="logo" />
                    <span v-show="!isCollapse" class="logo-text">数据资产平台</span>
                </div>
                <el-scrollbar>
                    <el-menu :router="false" :default-active="activeMenu" :collapse="isCollapse" :unique-opened="true" :collapse-transition="false" text-color="#94bbf4" active-text-color="#fff" popper-class="menu-popper">
                        <SubMenu :menu-list="menuList" />
                    </el-menu>
                </el-scrollbar>
            </div>
        </el-aside>
        <el-container>
            <el-header>
                <ToolBarLeft />
                <ToolBarRight />
            </el-header>
            <Main />
        </el-container>
    </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import Main from '@/layouts/components/Main/index.vue'
import ToolBarLeft from '@/layouts/components/Header/ToolBarLeft.vue'
import ToolBarRight from '@/layouts/components/Header/ToolBarRight.vue'
import SubMenu from '@/layouts/components/Menu/SubMenu.vue'

const route = useRoute()
const authStore = useAuthStore()
const isCollapse = computed(() => authStore.isCollapse)
const menuList = computed(() => authStore.showMenuListGet)
const activeMenu = computed(() => (route.meta.activeMenu ? route.meta.activeMenu : route.path))
</script>

<style scoped lang="scss">
@use './index.scss';
</style>
