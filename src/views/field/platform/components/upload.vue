<template>
    <div class="el-upload-picture-card-wrapper" @mouseenter="bindPaste" @mouseleave="unbindPaste">
        <el-upload ref="uploadRef" v-model:file-list="innerFileList" class="uploader" list-type="picture-card" :action="action" :headers="headers" accept="image/*" :limit="6" multiple :on-exceed="handleExceed" :on-preview="handlePreview" :before-remove="handleBeforeRemove" :on-success="handleSuccess" :on-error="handleError">
            <el-icon><Plus /></el-icon>
        </el-upload>

        <el-image-viewer v-if="viewer.visible" :url-list="urlList" :initial-index="viewer.index" @close="viewer.visible = false" />
    </div>
</template>

<script setup>
import { ref, watch, computed, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
const uploadRef = ref(null)

const props = defineProps({
    imgList: String,
})
const action = computed(() => import.meta.env.VITE_APP_API_BASE_URL + '/api/v1/upload/file')
const headers = computed(() => ({
    Authorization: 'Bearer ' + userStore.token,
}))

const emit = defineEmits(['update:modelValue', 'success', 'error', 'remove'])

const innerFileList = ref([])

watch(
    () => props.imgList,
    (val) => {
        if (val) {
            const list = val.split(' || ')
            innerFileList.value = list.map((item, index) => {
                const [name, url] = item.split(' | ')
                return { uid: index, filename: name, name, url: url || '', status: 'done' }
            })
        } else {
            innerFileList.value = []
        }
    },
    { immediate: true },
)

const urlList = computed(() => innerFileList.value.map((f) => f.url || f.response?.data?.url || f.response?.data?.path))
const uploadImg = computed(() => innerFileList.value.map((item) => (item.response ? `${item.response.data.filename} | ${item.response.data.url}` : `${item.filename} | ${item.url}`)).join(' || '))

const viewer = ref({ visible: false, index: 0 })

function handlePreview(file) {
    const url = file.url || file.response?.data?.url
    const idx = urlList.value.findIndex((u) => u === url)
    viewer.value.index = Math.max(0, idx)
    viewer.value.visible = true
}

function handleExceed() {
    ElMessage.warning(`最多只能上传 6 张图片`)
}

function handleBeforeRemove(file) {
    // 删除逻辑
}

function handleSuccess(response, uploadFile, uploadFiles) {
    console.log('上传成功', response)
}

function handleError(response, uploadFile, uploadFiles) {
    console.error('上传失败', response)
}

// 粘贴监听
function handlePaste(e) {
    const items = e.clipboardData?.items
    if (!items) return
    const maxCount = 6
    if (innerFileList.value.length >= maxCount) {
        ElMessage.warning(`最多只能上传 ${maxCount} 张图片`)
        return
    }
    for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile()
            if (file) {
                // 检查数量限制
                if (innerFileList.value.length < maxCount) {
                    uploadRef.value.handleStart(file) // 直接调用 el-upload 内部方法添加文件
                    uploadRef.value.submit()
                }
            }
        }
    }
}

const bindPaste = () => {
    document.addEventListener('paste', handlePaste)
}
const unbindPaste = () => {
    document.removeEventListener('paste', handlePaste)
}

onBeforeUnmount(() => {
    unbindPaste()
})

defineExpose({ uploadImg })
</script>
<style lang="scss" scoped>
.uploader :deep(.el-upload-list--picture-card) {
    --el-upload-list-picture-card-size: 60px;
}
.el-upload-picture-card-wrapper {
    display: inline-block;
    margin-left: 10px;
}
.uploader {
    :deep(.el-upload--picture-card) {
        width: 60px;
        height: 60px;
    }
    :deep(.el-upload-list__item.is-success:focus:not(:hover) .el-icon--close-tip) {
        display: none;
    }
    :deep(.el-upload-list__item-delete) {
        margin-left: 10px;
    }
}
</style>
