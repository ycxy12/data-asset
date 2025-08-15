<template>
    <el-drawer v-model="visible" title="变更记录" :before-close="onClose">
        <div class="search_form">
            <el-form :model="searchForm" :inline="true">
                <el-form-item label="是否已读">
                    <el-select v-model="searchForm.status" placeholder="请选择是否已读" clearable style="width: 160px">
                        <el-option label="未读" :value="0" />
                        <el-option label="已读" :value="1" />
                    </el-select>
                </el-form-item>
                <el-form-item style="margin-left: auto">
                    <el-button type="primary" @click="search">搜索</el-button>
                    <el-button style="margin-left: 10px" @click="reset">重置</el-button>
                    <el-button style="margin-left: 10px" @click="handleAllRead">全部已读</el-button>
                </el-form-item>
            </el-form>
        </div>
        <el-timeline class="timeline">
            <el-timeline-item v-for="(item, index) in list" :key="index" type="primary" :hollow="true">
                <div class="timeline-content">
                    <p class="flex">
                        <span>变更时间：{{ item.createTime }}</span>
                        <el-link v-if="item.status === 0" type="primary" underline="never" @click="handleMarkRead(item.notificationId)">标记已读</el-link>
                    </p>
                    <p>
                        变更内容：
                        <span v-html="parseContent(item.content)" @click="onFieldClick(item)" />
                    </p>
                </div>
            </el-timeline-item>
        </el-timeline>
        <div class="pagination">
            <el-pagination v-model:current-page="page.currPage" v-model:page-size="page.pageSize" :total="page.total" layout="prev, pager, next, jumper" @change="onPaginationChange" />
        </div>
    </el-drawer>
</template>

<script setup>
import { ref, reactive, toRaw, computed, useTemplateRef, unref, onMounted } from 'vue'
import { readNotification, addReadNotifications, batchReadNotifications, getNotificationList } from '@/api/notice'
import { useRouter } from 'vue-router'

const emits = defineEmits(['update'])

const router = useRouter()
const list = ref([])
const page = reactive({
    currPage: 1,
    pageSize: 10,
    total: 0,
})
const searchForm = reactive({
    status: undefined,
})

// 打开对话框
const visible = ref(false)
const handleOpen = async () => {
    getNotification()
    visible.value = true
}

// 获取操作日志
const getNotification = async () => {
    const params = {
        currPage: page.currPage,
        pageSize: page.pageSize,
        status: searchForm.status,
    }
    const { data, totalCount } = await getNotificationList(params)
    list.value = data
    page.total = totalCount
}

// 取消
const onClose = () => {
    visible.value = false
}

// 搜索
const search = () => {
    page.currPage = 1
    getNotification()
}
// 重置
const reset = () => {
    searchForm.status = undefined
    page.currPage = 1
    getNotification()
}

//分页
const onPaginationChange = (currPage, pageSize) => {
    page.currPage = currPage
    page.pageSize = pageSize
    getNotification()
}

// 标记已读
const handleMarkRead = async (id) => {
    await readNotification(id)
    getNotification()
}

const parseContent = (content) => {
    return content.replace(/\[([^\[\]]+)\]/g, (_, field) => {
        return `<span class="clickable-field" data-field="${field}">【${field}】</span>`
    })
}
const onFieldClick = async (item) => {
    if (item.status === 0) {
        await handleMarkRead(item.notificationId)
        await emits('update')
    }
    const params = JSON.parse(item.param)
    router.push({ path: `/field/platform/details`, query: { id: params.fieldId } })
    onClose()
}
// 全部已读
const handleAllRead = async () => {
    await addReadNotifications()
    await getNotification()
    await emits('update')
}

// 暴露方法
defineExpose({ handleOpen })
</script>
<style lang="scss" scoped>
.timeline {
    max-height: calc(100vh - 180px);
    overflow-y: auto;
    color: rgba(0, 0, 0, 0.88);
    padding-left: 5px;
}
.pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
}
.flex {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.timeline-content {
    &:hover {
        background-color: #f7f8fa;
    }
}
</style>
<style lang="scss">
.clickable-field {
    color: #faad14;
    cursor: pointer;
}
</style>
