<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import SvgIcon from '@/components/SvgIcon/index.vue'

// emits
const emits = defineEmits(['confirm'])

// 弹框是否显示
const visible = ref(false)
// 图标列表
const iconList = ref([])
// 选中的图标
const selectedIcon = ref('')

// 获取所有SVG图标
const loadIcons = async () => {
    try {
        // 使用Vite的import.meta.glob动态导入所有SVG文件
        // 尝试多种路径格式
        let modules = import.meta.glob('@/assets/icons/*.svg', { as: 'url', eager: true })

        // 如果@别名不工作，尝试相对路径
        if (Object.keys(modules).length === 0) {
            modules = import.meta.glob('../../assets/icons/*.svg', { as: 'url', eager: true })
        }

        // 如果还是没有，尝试绝对路径
        if (Object.keys(modules).length === 0) {
            modules = import.meta.glob('/src/assets/icons/*.svg', { as: 'url', eager: true })
        }

        iconList.value = Object.keys(modules).map((path) => {
            return path.split('/').pop().replace('.svg', '')
        })
    } catch (error) {
        console.error('加载图标失败:', error)
        ElMessage.error('加载图标失败')
    }
}

// 打开弹框
const handleOpen = async (icon) => {
    if (icon) selectedIcon.value = icon
    await loadIcons()
    visible.value = true
}

// 选择图标
const selectIcon = (iconName) => {
    selectedIcon.value = iconName
}

// 确认选择
const handleConfirm = () => {
    if (!selectedIcon.value) {
        ElMessage.warning('请选择一个图标')
        return
    }
    emits('confirm', selectedIcon.value)
    visible.value = false
    selectedIcon.value = ''
}

// 取消选择
const handleCancel = () => {
    visible.value = false
    selectedIcon.value = ''
}

defineExpose({ handleOpen })
</script>
<template>
    <PlusDialog v-model="visible" title="选择菜单图标" width="800px" top="10vh" @confirm="handleConfirm" @cancel="handleCancel" @close="handleCancel">
        <div class="icon-selector">
            <div v-if="iconList.length === 0" class="no-icons">暂无图标</div>
            <div v-else class="icon-grid">
                <div v-for="icon in iconList" :key="icon" class="icon-item" :class="{ selected: selectedIcon === icon }" @click="selectIcon(icon)">
                    <SvgIcon :name="icon" class="icon-svg" />
                </div>
            </div>
        </div>
    </PlusDialog>
</template>

<style scoped>
.icon-selector {
    padding: 10px;
}

.no-icons {
    text-align: center;
    color: #999;
    padding: 40px 0;
}

.icon-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: flex-start;
}

.icon-item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border: 2px solid transparent;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
}

.icon-item:hover {
    border-color: var(--el-color-primary);
    background-color: #f0f9ff;
}

.icon-item.selected {
    border-color: var(--el-color-primary);
    background-color: #e1f3ff;
}

.icon-svg {
    width: 24px;
    height: 24px;
    fill: var(--el-color-primary);
}
</style>
