<script setup>
import { ref, reactive, toRefs, toRaw, computed, watchEffect, useTemplateRef, defineAsyncComponent, h } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { useTable } from 'plus-pro-components'
import { listDomain, deleteDomain, getDomainByParentId } from '@/api/area'
import { getSystemMenuApi, deleteSystemMenuApi } from '@/api/survey.js'
import { useTableHeight } from '@/hooks/useTableHeight'
import SvgIcon from '@/components/SvgIcon/index.vue'
const EditMenu = defineAsyncComponent(() => import('./editMenu.vue'))
const EditButton = defineAsyncComponent(() => import('./editButton.vue'))

// 引用组件实例
const plusPageRef = useTemplateRef('plusPageRef')
const editMenuInstance = useTemplateRef('editMenuRef')
const editButtonInstance = useTemplateRef('editButtonRef')

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
const handleCreate = (type, cancel) => {
    if (type == '0') {
        editMenuInstance.value?.handleOpen()
    } else {
        editButtonInstance.value?.handleOpen()
    }
    cancel()
}

// 刷新列表
const refresh = () => {
    plusPageRef.value?.getList()
}

// 删除
const handleDelete = async () => {
    if (multipleSelection.value.length === 0) {
        ElMessage.error('请选择需要删除的记录')
        return
    }
    const ids = multipleSelection.value.map((item) => item.id).join(',')

    ElMessageBox.confirm('当您点击确定按钮后，这些记录将会被彻底删除，如果其包含子记录，也将一并删除！', '删除所选择的菜单/按钮', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        await deleteSystemMenuApi({ id: ids })
        ElMessage.success('删除成功')
        refresh()
    })
}

// 操作按钮事件
const handleTableOption = async ({ row, buttonRow }) => {
    switch (buttonRow.code) {
        case 'update':
            if (row.type == '0') {
                editMenuInstance.value?.handleOpen(row.id)
            } else {
                editButtonInstance.value?.handleOpen(row.id)
            }
            break
        case 'delete':
            break
    }
}

// 操作按钮配置
const { buttons } = useTable()
buttons.value = [{ text: '编辑', code: 'update', props: { type: 'primary' } }]

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
                    <el-popconfirm class="box-item" title="请选择创建类型" placement="top">
                        <template #reference>
                            <el-button type="primary" plain :icon="Plus" size="small">新增</el-button>
                        </template>
                        <template #actions="{ cancel }">
                            <el-button type="primary" plain size="small" @click="handleCreate('0', cancel)">菜单</el-button>
                            <el-button type="primary" plain size="small" @click="handleCreate('1', cancel)">按钮</el-button>
                        </template>
                    </el-popconfirm>
                    <el-button type="danger" plain :icon="Delete" size="small" @click="handleDelete">删除</el-button>
                </el-row>
            </template>
        </PlusPage>
        <!-- 新增/编辑 菜单-->
        <EditMenu ref="editMenuRef" @refresh="refresh" />
        <!-- 新增/编辑 按钮-->
        <EditButton ref="editButtonRef" @refresh="refresh" />
    </div>
</template>
