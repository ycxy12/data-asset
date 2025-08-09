<template>
    <div class="system">
        <el-popover placement="bottom-end" :width="340">
            <template #reference>
                <el-icon class="system-icon"><Menu /></el-icon>
            </template>
            <div class="system-content">
                <h3>系统切换</h3>
                <div class="list">
                    <div v-for="(item, i) in headerMenus" :key="i" class="listitem" @click="openWindow(item.path)">
                        <SvgIcon :name="icons[i]" style="color: #2072f5" />
                        <span>{{ item.name }}</span>
                    </div>
                </div>
            </div>
        </el-popover>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/store/modules/auth'

const authStore = useAuthStore()
const headerMenus = computed(() => authStore.headerMenuList)
//外部系统跳转
const openWindow = (url) => {
    window.open(url)
}

const icons = ['slice', 'fengkong', 'chakan', 'fenxiao', 'shujuzhongtai', 'chanpinzhongxin']
</script>

<style scoped lang="scss">
.system {
    padding: 5px;
    &:hover {
        background-color: rgba(102, 152, 255, 0.1);
        .system-icon {
            color: #2072f5;
        }
    }
    .system-icon {
        font-size: 18px;
        cursor: pointer;
    }
}
.system-content {
    h3 {
        margin-bottom: 12px;
        color: #333;
        font-weight: 400;
        font-size: 16px;
        line-height: 24px;
    }
    .list {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
    }

    .listitem {
        display: flex;
        align-items: center;
        height: 32px;
        padding: 0 7px;
        border: 1px solid #e6e7eb;
        border-radius: 4px;
        // min-width: 94px;
        font-size: 14px;
        cursor: pointer;
        box-sizing: border-box;

        .svg-icon {
            font-size: 16px;
            margin-right: 4px;
        }

        .svg-icon.icon-chakan {
            font-size: 14px;
        }
    }
}
</style>
