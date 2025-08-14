<script setup>
import { ref, reactive, toRefs, toRaw, computed, watchEffect, useTemplateRef, defineAsyncComponent } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { useTable } from 'plus-pro-components'
import auth from '@/directives/modules/auth'
import { listDictType, deleteDictType, addDictType, updateDictType } from '@/api/dict'
import { useTableHeight } from '@/hooks/useTableHeight'
const Dict = defineAsyncComponent(() => import('@/views/system/dictType/dict/dict.vue'))
const editDictType = defineAsyncComponent(() => import('@/views/system/dictType/editDictType.vue'))

// 引用组件实例
const plusPageRef = useTemplateRef('plusPageRef')
const dictTypeInstance = useTemplateRef('editDictTypeRef')
const dictInstance = useTemplateRef('dictRef')

// 查询列表
const getList = async (query) => {
    const { page = 1, pageSize = 20, dictType, dictName } = query || {}
    const { data, totalCount } = await listDictType({ currPage: page, pageSize, dictType, dictName })
    return { data, success: true, total: totalCount }
}

// 新增
const handleCreate = () => {
    dictTypeInstance.value?.handleOpen()
}

// 查看字典
const handleViewDict = ({ dictType, id }) => {
    dictInstance.value?.handleOpen({ dictType, typeId: id })
}

// 删除
const handleDelete = async (row) => {
    await deleteDictType({ id: row.id })
    ElMessage.success('删除成功')
    refresh()
}

// 刷新列表
const refresh = () => {
    plusPageRef.value?.getList()
}

// 操作按钮事件
const handleTableOption = ({ row, buttonRow }) => {
    switch (buttonRow.code) {
        case 'view':
            handleViewDict(row)
            break
        case 'update':
            dictTypeInstance.value?.handleOpen(row)
            break
        case 'delete':
            handleDelete(row)
            break
    }
}

// 操作按钮配置
const { buttons } = useTable()
buttons.value = [
    { text: '查看字典', code: 'view', props: { type: 'primary' }, directives: [[auth, 'dictType:view']] },
    { text: '编辑', code: 'update', props: { type: 'primary' }, directives: [[auth, 'dictType:edit']] },
    {
        text: '删除',
        code: 'delete',
        confirm: { title: (data) => `确认删除【${data.row.dictName}】字典类型？`, message: '操作不可恢复，是否继续？', options: { type: 'warning' } },
        props: { type: 'danger' },
        directives: [[auth, 'dictType:delete']],
    },
]

// 表格列配置
const columns = [
    { label: '字典类型标识', prop: 'dictType' },
    { label: '字典类型名称', prop: 'dictName' },
    { label: '库名称', prop: 'dbName', hideInSearch: true },
    { label: '表名称', prop: 'tableName', hideInSearch: true },
    { label: '字段名称', prop: 'fieldName', hideInSearch: true },
    { label: '备注', prop: 'remark', hideInSearch: true },
]

// 使用自定义 hook 计算表格高度
const { tableHeight } = useTableHeight({ getSearchElement: () => plusPageRef.value?.plusSearchInstance })
</script>
<template>
    <div>
        <PlusPage
            ref="plusPageRef"
            :columns="columns"
            :request="getList"
            :search="{ labelWidth: '100px' }"
            :table="{
                maxHeight: tableHeight,
                actionBar: { buttons },
                onClickAction: handleTableOption,
            }"
        >
            <template #table-title>
                <el-row class="button-row">
                    <el-button v-auth="'dictType:add'" type="primary" plain :icon="Plus" size="small" @click="handleCreate">新增</el-button>
                </el-row>
            </template>
        </PlusPage>
        <!-- 新增/编辑 -->
        <editDictType ref="editDictTypeRef" @refresh="refresh" />
        <!-- 查看字典 -->
        <Dict ref="dictRef" />
    </div>
</template>
