<script setup>
import { ref, reactive, toRaw, computed, useTemplateRef, unref } from 'vue'
import { useRoute } from 'vue-router'
import { useSource } from '@/views/field/platform/hooks/useSource'
import { addCallingField, updateCallingField } from '@/api/platform'
// import { getDatabases, getTablesInDatabases, getColumnsInTables } from '@/api/databases'
import { ElMessage } from 'element-plus'

const emits = defineEmits(['refresh'])
const route = useRoute()

/** 引用组件实例 */
const dialogFormRef = useTemplateRef('plusDialogFormRef')

const initForm = {
    id: undefined,
    sourceAlias: 'polardb',
    dbName: undefined,
    tableName: undefined,
    fieldName: undefined,
    fieldId: route.query.id,
}
const form = reactive({ ...initForm })
const confirmLoading = ref(false)

// 打开对话框
const visible = ref(false)
const handleOpen = async () => {
    visible.value = true
}

// 提交表单
const handleSubmit = async () => {
    try {
        confirmLoading.value = true
        let params = toRaw(form)
        const RequestApi = params.id ? updateCallingField : addCallingField
        await RequestApi(params)
        ElMessage.success(`${params.id ? '编辑' : '新增'}字典类型成功`)
        handleCancel()
        emits('refresh')
        confirmLoading.value = false
    } finally {
        confirmLoading.value = false
    }
}

// 取消重置表单
const handleCancel = () => {
    dialogFormRef.value.formInstance.resetFields()
    visible.value = false
    Object.assign(form, initForm)
}

const { databases, tableOptions, columnOptions, reset } = useSource(visible, form)
//数据来源
const handleChange = (values, column) => {
    if (column.prop === 'dbName') {
        form.tableName = undefined
        form.fieldName = undefined
    }
    if (column.prop === 'tableName') {
        form.fieldName = undefined
    }

    reset(undefined, column.prop)
}

// 定义表单验证规则
const rules = {
    dbName: [{ required: true, message: '请输入映射字段名称', trigger: 'change' }],
    tableName: [{ required: true, message: '请输入映射字段英文', trigger: 'change' }],
    fieldName: [{ required: true, message: '请选择映射字段来源', trigger: 'change' }],
}

// 定义表单项
const columns = [
    { label: '库名', prop: 'dbName', valueType: 'select', options: computed(() => databases.value), fieldProps: { filterable: true } },
    { label: '表名', prop: 'tableName', valueType: 'select', options: computed(() => tableOptions.value), fieldProps: { filterable: true } },
    { label: '字段', prop: 'fieldName', valueType: 'select', options: computed(() => columnOptions.value), fieldProps: { filterable: true } },
]

// 暴露方法
defineExpose({ handleOpen })
</script>
<template>
    <PlusDialogForm
        ref="plusDialogFormRef"
        v-model:visible="visible"
        v-model="form"
        :form="{ columns, labelPosition: 'right', rules }"
        :dialog="{
            title: form.id ? '编辑字段调用 - ' + form.dbName : '新增字段调用',
            width: '600px',
            top: '10vh',
            confirmLoading,
        }"
        @confirm="handleSubmit"
        @change="handleChange"
        @cancel="handleCancel"
        @close="handleCancel"
    />
</template>
