<script setup>
import { ref, reactive, toRefs, toRaw, computed, watchEffect, useTemplateRef } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { useTable } from 'plus-pro-components'
import { listDictType, deleteDictType, addDictType, updateDictType } from '@/api/dict'
import { getDatabases, getTablesInDatabases, getColumnsInTables } from '@/api/databases'
import { useTableHeight } from '@/hooks/useTableHeight'

/** 引用组件实例 */
const plusPageRef = useTemplateRef('plusPageRef')
const dialogFormRef = useTemplateRef('plusDialogFormRef')

/** 表单默认结构 */
const defaultForm = () => ({
    sourceAlias: 'polardb',
    dictType: '',
    dictName: '',
    dbName: '',
    tableName: '',
    fieldName: '',
    remark: '',
})

/** 状态管理 */
const state = reactive({
    query: {},
    visible: false,
    confirmLoading: false,
    isCreate: true,
    form: defaultForm(),
    rules: {
        dictType: [{ required: true, message: '请输入字典类型标识', trigger: 'blur' }],
        dictName: [{ required: true, message: '请输入字典类型名称', trigger: 'blur' }],
    },
})

const { form, confirmLoading, rules, visible } = toRefs(state)
const dialogTitle = computed(() => (state.isCreate ? '新增' : '编辑'))

/** 下拉数据源 */
const databases = ref([])
const tableOptions = ref([])
const columnOptions = ref([])

/** 表格列配置 */
const columns = [
    { label: '字典类型标识', prop: 'dictType' },
    { label: '字典类型名称', prop: 'dictName' },
    { label: '库名称', prop: 'dbName', hideInSearch: true, valueType: 'select', options: computed(() => databases.value), fieldProps: { filterable: true }, render: (value) => value },
    { label: '表名称', prop: 'tableName', hideInSearch: true, valueType: 'select', options: computed(() => tableOptions.value), fieldProps: { filterable: true }, render: (value) => value },
    { label: '字段名称', prop: 'fieldName', hideInSearch: true, valueType: 'select', options: computed(() => columnOptions.value), fieldProps: { filterable: true }, render: (value) => value },
    { label: '备注', prop: 'remark',hideInSearch: true, },
]

/** 查询列表 */
const getList = async (query) => {
    const { page = 1, pageSize = 20, dictType, dictName } = query || {}
    const { data, totalCount } = await listDictType({ currPage: page, pageSize, dictType, dictName })
    return { data, success: true, total: totalCount }
}

/** 操作按钮 */
const { buttons } = useTable()
buttons.value = [
    { text: '查看字典', code: 'view', props: { type: 'primary' } },
    { text: '编辑', code: 'update', props: { type: 'primary' } },
    {
        text: '删除',
        code: 'delete',
        confirm: {
            title: (data) => `确认删除【${data.row.dictName}】字典类型？`,
            message: '操作不可恢复，是否继续？',
            options: { type: 'warning' },
        },
        props: { type: 'danger' },
    },
]

/** 操作按钮事件 */
const handleTableOption = ({ row, buttonRow }) => {
    switch (buttonRow.code) {
        case 'update':
            state.form = { ...row }
            state.isCreate = false
            state.visible = true
            break
        case 'delete':
            handleDelete(row)
            break
    }
}

/** 删除操作 */
const handleDelete = async (row) => {
    await deleteDictType({ id: row.id })
    ElMessage.success('删除成功')
    refresh()
}

/** 新建操作 */
const handleCreate = () => {
    state.form = defaultForm()
    state.isCreate = true
    state.visible = true
}

/** 刷新列表 */
const refresh = () => {
    plusPageRef.value?.getList()
}

/** 取消并重置 */
const handleCancel = () => {
    dialogFormRef.value.formInstance.resetFields()
    state.visible = false
}

/** 提交表单 */
const handleSubmit = async () => {
    state.confirmLoading = true
    try {
        const api = state.isCreate ? addDictType : updateDictType
        await api(toRaw(state.form))
        ElMessage.success(`${state.isCreate ? '新增' : '编辑'}成功`)
        handleCancel()
        refresh()
    } finally {
        state.confirmLoading = false
    }
}

/** 表单字段变化触发级联下拉请求 */
const handleChange = (values, column) => {
    if (column.prop === 'dbName') {
        state.form.tableName = ''
        state.form.fieldName = ''
        tableOptions.value = []
        columnOptions.value = []
    }
    if (column.prop === 'tableName') {
        state.form.fieldName = ''
        columnOptions.value = []
    }
}

/** 数据级联加载 */
watchEffect(async () => {
    if (state.visible) {
        const { data } = await getDatabases(toRaw(state.form))
        databases.value = data.map((item) => ({ value: item, label: item }))
    }
})

watchEffect(async () => {
    if (state.form.dbName) {
        const { data } = await getTablesInDatabases(toRaw(state.form))
        tableOptions.value = data.map((item) => ({
            label: item.tableName,
            value: item.tableName,
        }))
    }
})

watchEffect(async () => {
    if (state.form.dbName && state.form.tableName) {
        const { data } = await getColumnsInTables(toRaw(state.form))
        columnOptions.value = data.map((item) => ({
            label: item.columnName,
            value: item.columnName,
        }))
    }
})

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
                    <el-button :icon="Plus" size="small" @click="handleCreate">新增</el-button>
                </el-row>
            </template>
        </PlusPage>

        <PlusDialogForm
            ref="plusDialogFormRef"
            v-model:visible="visible"
            v-model="form"
            :form="{ columns, labelPosition: 'right', labelWidth: '120px', rules }"
            :dialog="{
                title: dialogTitle + '字典类型',
                width: '700px',
                top: '12vh',
                confirmLoading,
            }"
            @confirm="handleSubmit"
            @cancel="handleCancel"
            @change="handleChange"
            @close="handleCancel"
        />
    </div>
</template>
