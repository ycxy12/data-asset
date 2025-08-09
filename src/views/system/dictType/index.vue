<template>
    <div>
        <PlusPage
            ref="plusPageRef"
            :columns="columns"
            :request="getList"
            :search="{ labelWidth: '100px' }"
            :table="{
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
        <!-- 新增/编辑 -->
        <PlusDialogForm ref="plusDialogFormRef" v-model:visible="visible" v-model="form" :form="{ columns, labelPosition: 'right', labelWidth: '120px', rules }" :dialog="{ title: dialogTitle + '字典类型', width: '700px', top: '12vh', confirmLoading }" @confirm="handleSubmit" @cancel="handleCancel" @change="handleChange" @close="handleCancel" />
    </div>
</template>

<script setup>
import { ref, reactive, toRefs, toRaw, computed, useTemplateRef } from 'vue'
import { listDictType, deleteDictType } from '@/api/dict'
import { addDictType, updateDictType } from '@/api/dict'
import { getDatabases, getTablesInDatabases, getColumnsInTables } from '@/api/databases'
import { useTable } from 'plus-pro-components'
import { Plus } from '@element-plus/icons-vue'

//Ref
const plusPageInstance = useTemplateRef('plusPageRef')
const dialogFormInstance = useTemplateRef('plusDialogFormRef')

//列表接口请求
const getList = async (query) => {
    const { page = 1, pageSize = 20, dictType, dictName } = query || {}
    const { data, totalCount } = await listDictType({ currPage: page, pageSize, dictType, dictName })
    return { data: data, success: true, total: totalCount }
}

// 基础信息
const state = reactive({
    query: { dictType: '', dictName: '' },
    currentRow: {},
    visible: false,
    detailsVisible: false,
    confirmLoading: false,
    isCreate: true,
    form: {
        sourceAlias: 'polardb',
        dictType: undefined,
        dictName: undefined,
        dbName: undefined,
        tableName: undefined,
        fieldName: undefined,
        remark: undefined,
    },
    rules: {
        dictType: [{ required: true, message: '请输入字典类型标识', trigger: 'blur' }],
        dictName: [{ required: true, message: '请输入字典类型名称', trigger: 'blur' }],
    },
})

//弹框名称
const dialogTitle = computed(() => (state.isCreate ? '新增' : '编辑'))
//操作按钮
const { buttons } = useTable()
buttons.value = [
    { text: '查看字典', code: 'view', props: { type: 'primary' } },
    { text: '编辑', code: 'update', props: { type: 'primary' } },
    { text: '删除', code: 'delete', confirm: { title: (data) => `确认是否删除【${data.row.dictName}】字典类型?`, message: '操作不可恢复，是否继续？', options: { type: 'warning' } }, props: { type: 'danger' } },
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

//删除
const handleDelete = async () => {
    await deleteDictType({ id: state.currentRow.id })
    ElMessage.success('删除成功')
    refresh()
}

// 创建
const handleCreate = () => {
    state.currentRow = {}
    state.form = {
        sourceAlias: 'polardb',
        dictType: undefined,
        dictName: undefined,
        dbName: undefined,
        tableName: undefined,
        fieldName: undefined,
        remark: undefined,
    }
    state.isCreate = true
    state.visible = true
}

// 重新请求列表接口
const refresh = () => {
    plusPageInstance.value?.getList()
}

// 取消
const handleCancel = async () => {
    dialogFormInstance.value.formInstance.resetFields()
    state.visible = false
}

// 提交表单成功
const handleSubmit = async () => {
    try {
        state.confirmLoading = true
        const params = { ...state.form }
        const RequestApi = state.isCreate ? addDictType : updateDictType
        await RequestApi(params)
        ElMessage.success(`${state.isCreate ? '新增' : '编辑'}字典类型成功`)
        handleCancel()
        refresh()
    } catch (error) {}
    state.confirmLoading = false
}

// 下拉框
const databases = ref([])
const tableOptions = ref([])
const columnOptions = ref([])

// 数据库
const fetchDatabases = async () => {
    const { data } = await getDatabases(toRaw(state.form))
    databases.value = data.map((item) => ({ value: item, label: item }))
}
// 表
const fetchTables = async () => {
    if (!state.form.dbName) return
    const { data } = await getTablesInDatabases(toRaw(state.form))
    tableOptions.value = data.map((table) => ({ label: table.tableName, value: table.tableName }))
}
// 字段
const fetchColumns = async () => {
    if (!state.form.dbName || !state.form.tableName) return
    const { data } = await getColumnsInTables(toRaw(state.form))
    columnOptions.value = data.map((col) => ({ label: col.columnName, value: col.columnName }))
}

//表单发生变化
const handleChange = (values, column) => {
    if (column.prop === 'dbName') {
        tableOptions.value = []
        columnOptions.value = []
        state.form.tableName = undefined
        state.form.fieldName = undefined
        fetchTables()
    }
    if (column.prop === 'tableName') {
        columnOptions.value = []
        state.form.fieldName = undefined
        fetchColumns()
    }
}

fetchDatabases()

const columns = [
    { label: '字典类型标识', prop: 'dictType' },
    { label: '字典类型名称', prop: 'dictName' },
    { label: '库名称', prop: 'dbName', hideInSearch: true, valueType: 'select', options: computed(() => databases.value), fieldProps: { filterable: true } },
    { label: '表名称', prop: 'tableName', hideInSearch: true, valueType: 'select', options: computed(() => tableOptions.value), fieldProps: { filterable: true } },
    { label: '字段名称', prop: 'fieldName', hideInSearch: true, valueType: 'select', options: computed(() => columnOptions.value), fieldProps: { filterable: true } },
    { label: '备注', prop: 'remark', hideInSearch: true },
]

const { form, confirmLoading, rules, currentRow, visible, detailsVisible } = toRefs(state)
</script>
