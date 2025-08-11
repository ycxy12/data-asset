<script setup>
import { ref, reactive, toRefs, toRaw, computed, watchEffect, useTemplateRef, defineAsyncComponent, h } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { useTable } from 'plus-pro-components'
import { listDomain, deleteDomain, getDomainByParentId } from '@/api/area'
import { getSystemMenuApi, deleteSystemMenuApi } from '@/api/survey.js'
import { useTableHeight } from '@/hooks/useTableHeight'
import SvgIcon from '@/components/SvgIcon/index.vue'
const Edit = defineAsyncComponent(() => import('./edit.vue'))

// 引用组件实例
const plusPageRef = useTemplateRef('plusPageRef')
const editInstance = useTemplateRef('editRef')

// 查询列表
const getList = async (query) => {
    const { name } = query || {}
    const { data } = await getSystemMenuApi({ sysType: '8', name })
    return { data, success: true }
}

// 多选
const multipleSelection = ref([])
const handleSelectionChange = (selection) => {
    console.log(selection)
    multipleSelection.value = selection
}

// 新增
const handleCreate = () => {
    editInstance.value?.handleOpen()
}

// 刷新列表
const refresh = () => {
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
    { label: '名称', width: 240, prop: 'permissionName', minWidth: 250, tableColumnProps: { fixed: 'left' } },
    { label: '图标', width: 240, prop: 'icon', hideInSearch: true, width: 100, render: (value) => (value ? h(SvgIcon, { name: value }) : '') },
    {
        label: '类型',
        width: 240,
        prop: 'type',
        hideInSearch: true,
        width: 150,
        valueType: 'tag',
        fieldProps: (value) => {
            return { type: value == '0' ? 'primary' : 'warning' }
        },
        formatter: (value) => (value == '0' ? '菜单' : '按钮'),
    },
    { label: '地址', prop: 'url', hideInSearch: true, minWidth: 200 },
    { label: '路径', prop: 'path', hideInSearch: true, minWidth: 200 },
    { label: 'Vue组件', prop: 'component', hideInSearch: true, minWidth: 200 },
    { label: '权限', prop: 'permissionCode', hideInSearch: true, width: 200 },
    { label: '排序', prop: 'orderNum', hideInSearch: true, width: 100 },
    { label: '备注', prop: 'remark', hideInSearch: true, width: 200 },
    { label: '创建时间', prop: 'createdAt', hideInSearch: true, width: 200 },
    { label: '修改时间', prop: 'updatedAt', hideInSearch: true, width: 200 },
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
            :pagination="false"
            :search="{ labelWidth: 50 }"
            :table="{
                maxHeight: tableHeight,
                actionBar: { buttons },
                onClickAction: handleTableOption,
                isSelection: true,
                onSelectionChange: handleSelectionChange,
                treeProps: { checkStrictly: true },
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
