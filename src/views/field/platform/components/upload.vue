<template>
    <div class="el-upload-picture-card-wrapper">
        <el-upload v-model:file-list="innerFileList" class="uploader" list-type="picture-card" :action="action" :headers="headers" :accept="'image/*'" :limit="6" :multiple="true" :on-exceed="handleExceed" :on-preview="handlePreview" :before-remove="handleBeforeRemove" :on-success="handleSuccess" :on-error="handleError">
            <el-icon><Plus /></el-icon>
        </el-upload>

        <el-image-viewer v-if="viewer.visible" :url-list="urlList" :initial-index="viewer.index" @close="viewer.visible = false" />
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { uploadFile } from '@/api/upload'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

const props = defineProps({
    imgList: String,
})
// 上传地址接口
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
            const files = list.map((item, index) => {
                const [name, url] = item.split(' | ')
                return { uid: index, filename: name, name, url: url || '', status: 'done' }
            })
            innerFileList.value = files
        } else {
            innerFileList.value = []
        }
    },
    { deep: true },
)

const urlList = computed(() => innerFileList.value.map((f) => f.url || f.response?.url || f.response?.data?.url || f.response?.data?.path))
const uploadImg = computed(() => {
    return innerFileList.value
        .map((item) => {
            if (item.response) {
                return `${item.response.data.filename} | ${item.response.data.url}`
            } else {
                return `${item.filename} | ${item.url}`
            }
        })
        .join(' || ')
})

const viewer = ref({ visible: false, index: 0 })

function handlePreview(file) {
    const url = file.url || file.response?.url || file.response?.data?.url
    const idx = urlList.value.findIndex((u) => u === url)
    viewer.value.index = Math.max(0, idx)
    viewer.value.visible = true
}

function handleExceed() {
    ElMessage.warning(`最多只能上传 6 张图片`)
}

async function handleBeforeRemove(file) {
    // const status = file.status
    // if (status !== 'success') return true
    // if (!props.deleteRequest) return true
    // try {
    //     await props.deleteRequest(file)
    //     emit('remove', file)
    //     return true
    // } catch (err) {
    //     ElMessage.error(err?.message || '删除失败，请稍后重试')
    //     return false
    // }
}

function handleSuccess(response, uploadFile, uploadFiles) {
    console.log(response, uploadFile, uploadFiles)
    console.log(innerFileList.value)
}

function handleError(response, uploadFile, uploadFiles) {
    console.log(response, uploadFile, uploadFiles)
}

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
