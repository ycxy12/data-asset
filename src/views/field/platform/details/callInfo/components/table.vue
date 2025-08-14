<template>
    <el-table :data="filteredData" border>
        <el-table-column prop="dbName" label="库名" />
        <el-table-column prop="tableName" label="表名" />
        <el-table-column prop="fieldName" label="字段" />
        <el-table-column label="操作" width="140">
            <template #default="{ row }">
                <el-button v-auth="'platform:callInfo:delete'" link type="danger" size="small" @click.prevent="deleteHandler(row)">删除</el-button>
            </template>
        </el-table-column>
    </el-table>
    <!-- 新增/编辑 -->
    <EditCallInfo ref="editCallInfoRef" @refresh="onFefresh" />
</template>
<script setup>
import { ref, computed, useTemplateRef, defineAsyncComponent, toRaw, reactive, onMounted, unref } from 'vue'
import { useRoute } from 'vue-router'
import { listCallingField, deleteCallingField } from '@/api/platform'
import { useHandleData } from '@/hooks/useHandleData.js'
import { useTable } from '@/hooks/useTable'
const EditCallInfo = defineAsyncComponent(() => import('@/views/field/platform/details/callInfo/editCallInfo.vue'))

// 编辑区域Ref
const editCallInfoInstance = useTemplateRef('editCallInfoRef')
// 路由
const route = useRoute()
// 初始化参数
const searchForm = reactive({
    dbName: undefined,
    tableName: undefined,
    fieldName: undefined,
})

// // 表格操作 Hooks
const { dataSource, getTableList } = useTable(listCallingField, { id: route.query.id }, false)

// 模糊搜索
const filteredData = computed(() => {
    return dataSource.value.filter((item) => {
        const dbName = searchForm.dbName ? item.dbName.includes(searchForm.dbName) : true
        const tableName = searchForm.tableName ? item.tableName.includes(searchForm.tableName) : true
        const fieldName = searchForm.fieldName ? item.fieldName.includes(searchForm.fieldName) : true
        return dbName && tableName && fieldName
    })
})

//刷新
const onFefresh = () => {
    getTableList()
}
// 新增
const addHandler = () => {
    editCallInfoInstance.value.handleOpen()
}
// 删除
const deleteHandler = async (params) => {
    await useHandleData(deleteCallingField, params, `删除【${params.dbName}.${params.tableName}.${params.fieldName}】字段调用信息`)
    getTableList()
}
// 自定义搜索
const customSearch = (form) => {
    Object.assign(searchForm, form)
}

onMounted(() => {
    getTableList()
})
defineExpose({ addHandler, customSearch })
</script>
