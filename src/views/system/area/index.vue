<script setup>
import { ref, reactive, toRefs, toRaw, computed, watchEffect, useTemplateRef, defineAsyncComponent } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { useTable } from 'plus-pro-components'
import { listDomain, deleteDomain, getDomainByParentId } from '@/api/area'
import { useTableHeight } from '@/hooks/useTableHeight'
const Edit = defineAsyncComponent(() => import('./edit.vue'))

// 引用组件实例
const plusPageRef = useTemplateRef('plusPageRef')
const editInstance = useTemplateRef('editRef')

// 查询列表
const getList = async (query) => {
    const { page = 1, pageSize = 20, name } = query || {}
    const { data, totalCount } = await listDomain({ currPage: page, pageSize, name })
    return { data, success: true, total: totalCount }
}
// 懒加载子项
const load = async (row, treeNode, resolve) => {
    const { data } = await getDomainByParentId(row.id)
    resolve(data)
}

// 新增
const handleCreate = () => {
    editInstance.value?.handleOpen()
}

// 刷新列表
const refresh = () => {
    plusPageRef.value.plusTableInstance.tableInstance.store.states.lazyTreeNodeMap.value = {}
    plusPageRef.value.plusTableInstance.tableInstance.store.states.treeData.value = {}
    plusPageRef.value?.getList()
}

// 操作按钮事件
const handleTableOption = async ({ row, buttonRow }) => {
    switch (buttonRow.code) {
        case 'update':
            editInstance.value?.handleOpen(row)
            break
        case 'delete':
            await deleteDomain({ id: row.id })
            ElMessage.success('删除成功')
            refresh(row.id)
            break
    }
}

// 操作按钮配置
const { buttons } = useTable()
buttons.value = [
    { text: '编辑', code: 'update', props: { type: 'primary' } },
    {
        text: '删除',
        code: 'delete',
        confirm: { title: (data) => `确认删除【${data.row.name}】字典类型？`, message: '操作不可恢复，是否继续？', options: { type: 'warning' } },
        props: { type: 'danger' },
    },
]

// 表格列配置
const columns = [
    { label: '领域名称', width: 240, prop: 'name' },
    { label: '领域编码', width: 240, prop: 'code', hideInSearch: true },
    { label: '是否启用', width: 240, prop: 'status', hideInSearch: true, render: (value) => (value ? '是' : '否') },
    { label: '领域说明', prop: 'description', hideInSearch: true },
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
            :table="{
                maxHeight: tableHeight,
                actionBar: { buttons },
                onClickAction: handleTableOption,
                lazy: true,
                load: load,
                treeProps: { children: 'children', hasChildren: 'hasChildren' },
            }"
        >
            <template #table-title>
                <el-row class="button-row">
                    <el-button type="primary" :icon="Plus" size="small" @click="handleCreate">新增</el-button>
                </el-row>
            </template>
        </PlusPage>
        <!-- 新增/编辑 -->
        <Edit ref="editRef" @refresh="refresh" />
    </div>
</template>
