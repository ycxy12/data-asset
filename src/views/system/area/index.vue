<template>
    <div>
        <PlusPage
            :columns="tableConfig"
            :request="getList"
            :table="{
                actionBar: { buttons, width: 140 },
                onClickAction: handleTableOption,
            }"
        >
            <template #table-title>
                <el-row class="button-row">
                    <el-button :icon="Plus" size="small" @click="handleCreate">新增</el-button>
                </el-row>
            </template>
        </PlusPage>
    </div>
</template>

<script setup>
import { reactive, toRefs } from 'vue'
import { listDomain, deleteDomain, getDomainByParentId } from '@/api/area'
import { useTable } from 'plus-pro-components'
import { Plus, Delete } from '@element-plus/icons-vue'

const state = reactive({
    query: { groupName: '' },
    currentRow: {},
    visible: false,
    detailsVisible: false,
    confirmLoading: false,
    isCreate: true,
    isBatch: false,
    form: {
        groupName: '',
        remark: '',
        userGroupId: undefined,
    },
    rules: {
        groupName: [{ required: true, message: '请输入', trigger: 'blur' }],
    },
})

const getList = async (query) => {
    const { page = 1, pageSize = 20, name } = query || {}
    const { data, totalCount } = await listDomain({ currPage: page, pageSize, name })
    return { data: data, success: true, total: totalCount }
}

const { buttons } = useTable()
buttons.value = [
    { text: '编辑', code: 'update', props: { type: 'primary' } },
    { text: '删除', code: 'delete', confirm: true, props: { type: 'danger' } },
]
// 按钮操作
const handleTableOption = ({ row, buttonRow }) => {
    state.currentRow = { ...row }
    switch (buttonRow.code) {
        case 'update':
            state.form = { ...row }
            state.isCreate = false
            state.visible = true
            break
        case 'delete':
            state.isBatch = false
            handleDelete()
            break
    }
}

const tableConfig = [
    { label: '领域名称', width: 240, prop: 'name' },
    { label: '领域编码', width: 240, prop: 'code', hideInSearch: true },
    { label: '是否启用', width: 240, prop: 'status', hideInSearch: true, valueType: 'switch' },
    { label: '领域说明', prop: 'description', hideInSearch: true },
]

const { form, confirmLoading, rules, currentRow, visible, detailsVisible } = toRefs(state)
</script>
