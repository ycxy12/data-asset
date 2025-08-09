<template>
    <template v-for="subItem in menuList" :key="subItem.path">
        <el-sub-menu v-if="subItem.children?.length" :index="subItem.path">
            <template #title>
                <el-icon v-if="subItem.meta.icon">
                    <SvgIcon :name="subItem.meta.icon" />
                    <!-- <component :is="subItem.meta.icon"></component> -->
                </el-icon>
                <span class="sle">{{ subItem.meta.title }}</span>
            </template>
            <SubMenu :menu-list="subItem.children" />
        </el-sub-menu>
        <el-menu-item v-else :index="subItem.path" @click="handleClickMenu(subItem)">
            <el-icon v-if="subItem.meta.icon">
                <SvgIcon :name="subItem.meta.icon" />
                <!-- <component :is="subItem.meta.icon"></component> -->
            </el-icon>
            <template #title>
                <span class="sle">{{ subItem.meta.title }}</span>
            </template>
        </el-menu-item>
    </template>
</template>

<script setup>
import { useRouter } from 'vue-router'

defineProps({
    menuList: {
        type: Array,
        default: () => [],
    },
})

const router = useRouter()
const handleClickMenu = (subItem) => {
    if (subItem.meta.isLink) return window.open(subItem.meta.isLink, '_blank')
    router.push(subItem.path)
}
</script>

<style lang="scss">
.el-sub-menu {
    .el-sub-menu__title {
        height: 44px;
        background-color: rgba(64, 116, 174, 0.3);
        &:hover {
            color: var(--el-menu-hover-text-color) !important;
            background-color: rgba(64, 116, 174, 0.3);
        }
    }
    .el-menu--inline {
        background: linear-gradient(180deg, rgba(64, 116, 174, 0.09) 0%, rgba(64, 116, 174, 0.3) 100%);
        .el-menu-item {
            background-color: transparent;
        }
    }
    .el-tooltip__trigger {
        justify-content: center;
        padding: 0;
    }
}
.el-menu--collapse {
    .is-active {
        .el-sub-menu__title {
            color: #ffffff !important;
            background-color: var(--el-color-primary) !important;
        }
    }
}
.el-menu-item {
    height: 44px;
    background-color: rgba(64, 116, 174, 0.3);
    &:hover {
        color: #fff;
        background-color: rgba(64, 116, 174, 0.3);
    }
    &.is-active {
        border-radius: 8px;
        color: var(--el-menu-active-color) !important;
        background-color: #2072f5 !important;
        &::after {
            position: absolute;
            top: 50%;
            right: 0;
            width: 3px;
            height: 24px;
            content: '';
            border-radius: 100px 0px 0px 100px;
            transform: translateY(-50%);
            background-color: #fff;
        }
    }
    .el-menu-tooltip__trigger {
        justify-content: center;
        padding: 0;
    }
}
.vertical,
.classic,
.transverse {
    .el-menu-item {
        &.is-active {
            &::before {
                left: 0;
            }
        }
    }
}
.columns {
    .el-menu-item {
        &.is-active {
            &::before {
                right: 0;
            }
        }
    }
}

.menu-popper.is-light {
    background: #042352;
    border: none;
    .el-menu {
        background-color: transparent;
    }
}
</style>
