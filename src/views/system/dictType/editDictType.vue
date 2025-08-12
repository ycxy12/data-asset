<script setup>
import { ref, reactive, toRefs, toRaw, computed, watchEffect, useTemplateRef } from 'vue'
import { getDatabases, getTablesInDatabases, getColumnsInTables } from '@/api/databases'
import { listDictType, deleteDictType, addDictType, updateDictType } from '@/api/dict'
// emits
const emits = defineEmits(['refresh'])

/** 引用组件实例 */
const dialogFormRef = useTemplateRef('plusDialogFormRef')

// 初始化表单
const initForm = {
    id: undefined,
    dictName: undefined,
    dictType: undefined,
    remark: undefined,
    sourceAlias: 'polardb',
    dbName: undefined,
    tableName: undefined,
    fieldName: undefined,
}
const form = reactive({ ...initForm })
const confirmLoading = ref(false)

// 打开对话框
const visible = ref(false)
const handleOpen = async (row) => {
    if (row) Object.assign(form, row)
    visible.value = true
}

/** 下拉数据源 */
const databases = ref([])
const tableOptions = ref([])
const columnOptions = ref([])

/** 表格列配置 */
const columns = [
    { label: '字典类型标识', prop: 'dictType', fieldProps: { disabled: computed(() => (form.id ? true : false)) } },
    { label: '字典类型名称', prop: 'dictName' },
    { label: '库名称', prop: 'dbName', valueType: 'select', options: computed(() => databases.value), fieldProps: { filterable: true } },
    { label: '表名称', prop: 'tableName', valueType: 'select', options: computed(() => tableOptions.value), fieldProps: { filterable: true } },
    { label: '字段名称', prop: 'fieldName', valueType: 'select', options: computed(() => columnOptions.value), fieldProps: { filterable: true } },
    { label: '备注', prop: 'remark', valueType: 'textarea' },
]

/** 校验 */
const rules = ref({
    dictType: [{ required: true, message: '请输入字典类型标识', trigger: 'blur' }],
    dictName: [{ required: true, message: '请输入字典类型名称', trigger: 'blur' }],
})

/** 取消并重置 */
const handleCancel = () => {
    dialogFormRef.value.formInstance.resetFields()
    visible.value = false
    Object.assign(form, initForm)
}

/** 提交表单 */
const handleSubmit = async () => {
    confirmLoading.value = true
    try {
        let params = toRaw(form)
        const RequestApi = params.id ? updateDictType : addDictType
        await RequestApi(toRaw(form))
        ElMessage.success(`${params.id ? '编辑' : '新增'}字典类型成功`)
        handleCancel()
        emits('refresh')
    } finally {
        confirmLoading.value = false
    }
}

/** 表单字段变化触发级联下拉请求 */
const handleChange = (values, column) => {
    if (column.prop === 'dbName') {
        form.tableName = ''
        form.fieldName = ''
        tableOptions.value = []
        columnOptions.value = []
    }
    if (column.prop === 'tableName') {
        form.fieldName = ''
        columnOptions.value = []
    }
}

/** 数据级联加载 */
watchEffect(async () => {
    if (visible.value) {
        const { data } = await getDatabases(toRaw(form))
        databases.value = data.map((item) => ({ value: item, label: item }))
    }
})

watchEffect(async () => {
    if (form.dbName) {
        const { data } = await getTablesInDatabases(toRaw(form))
        tableOptions.value = data.map((item) => ({
            label: item.tableName,
            value: item.tableName,
        }))
    }
})

watchEffect(async () => {
    if (form.dbName && form.tableName) {
        const { data } = await getColumnsInTables(toRaw(form))
        columnOptions.value = data.map((item) => ({
            label: item.columnName,
            value: item.columnName,
        }))
    }
})

defineExpose({ handleOpen })
</script>
<template>
    <PlusDialogForm
        ref="plusDialogFormRef"
        v-model:visible="visible"
        v-model="form"
        :form="{ columns, labelPosition: 'right', labelWidth: '120px', rules }"
        :dialog="{
            title: form.id ? '修改字典类型' : '新增字典类型',
            width: '700px',
            top: '10vh',
            confirmLoading,
        }"
        @confirm="handleSubmit"
        @cancel="handleCancel"
        @change="handleChange"
        @close="handleCancel"
    />
</template>
