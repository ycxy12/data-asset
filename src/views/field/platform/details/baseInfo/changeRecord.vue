<template>
    <el-drawer v-model="visible" title="变更记录" :before-close="onClose">
        <div class="search_form">
            <el-form :model="searchForm" :inline="true">
                <el-form-item label="变更类型">
                    <el-select v-model="searchForm.changeType" placeholder="请选择变更类型" clearable style="width: 160px">
                        <el-option label="新增" :value="0" />
                        <el-option label="编辑" :value="1" />
                        <el-option label="删除" :value="2" />
                    </el-select>
                </el-form-item>
                <el-form-item style="margin-left: auto">
                    <el-button type="primary" @click="search">搜索</el-button>
                    <el-button style="margin-left: 10px" @click="reset">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
        <el-timeline class="timeline">
            <el-timeline-item v-for="(item, index) in list" :key="index" :type="item.type" :hollow="true">
                <div>
                    <p>操作人：{{ item.operatorName }}</p>
                    <p>操作时间：{{ item.createTime }}</p>
                    <p>
                        操作内容：
                        <span v-if="item.changeTypeDesc === '新增'">
                            <span style="font-weight: 600">{{ item.changeTypeDesc }}</span>
                            {{ item.fieldTypeDesc }}：
                            <span style="font-weight: 600">{{ item.newValue }}</span>
                        </span>
                        <span v-if="item.changeTypeDesc === '修改'">
                            <span style="font-weight: 600">{{ item.changeTypeDesc }}</span>
                            {{ `${item.fieldTypeDesc}-${item.fieldName}` }} 由
                            <span style="font-weight: 600">{{ item.oldValue ? item.oldValue : '--' }}</span>
                            变更为
                            <span style="font-weight: 600">{{ item.newValue ? item.newValue : '--' }}</span>
                        </span>
                        <span v-if="item.changeTypeDesc === '删除'">
                            <span style="font-weight: 600">{{ item.changeTypeDesc }}</span>
                            {{ item.fieldName }}：
                            <span style="font-weight: 600">{{ item.oldValue }}</span>
                        </span>
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
import { ref, reactive } from 'vue'
import { logStandardField } from '@/api/platform'
import { useRoute } from 'vue-router'

const route = useRoute()
const list = ref([])
const page = reactive({
    currPage: 1,
    pageSize: 10,
    total: 0,
})
const searchForm = reactive({
    fieldId: route.query.id,
    changeType: undefined,
})

// 打开对话框
const visible = ref(false)
const openDialog = async () => {
    getLog()
    visible.value = true
}

// 获取操作日志
const getLog = async () => {
    const params = {
        currPage: page.currPage,
        pageSize: page.pageSize,
        fieldId: searchForm.fieldId,
        changeType: searchForm.changeType,
    }
    const { data, totalCount } = await logStandardField(params)
    list.value = flattenChangeDetails(data)
    page.total = totalCount
}

const flattenChangeDetails = (data) => {
    const flatList = []
    data.forEach((item) => {
        const { operatorName, createTime } = item
        ;['basicChangeDetails', 'mappingChangeDetails', 'callingChangeDetails'].forEach((key) => {
            if (Array.isArray(item[key])) {
                item[key].forEach((detail) => {
                    flatList.push({ ...detail, operatorName, createTime, type: getType(detail.changeTypeDesc) })
                })
            }
        })
    })
    // 按 createTime 倒序排序
    flatList.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    return flatList
}

const getType = (type) => {
    switch (type) {
        case '新增':
            return 'primary'
        case '修改':
            return 'warning'
        case '删除':
            return 'danger'
        default:
            return 'primary'
    }
}

// 取消
const onClose = () => {
    visible.value = false
}

// 搜索
const search = () => {
    page.currPage = 1
    getLog()
}
// 重置
const reset = () => {
    searchForm.changeType = undefined
    page.currPage = 1
    getLog()
}

//分页
const onPaginationChange = (currPage, pageSize) => {
    page.currPage = currPage
    page.pageSize = pageSize
    getLog()
}

// 暴露方法
defineExpose({ openDialog })
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
</style>
