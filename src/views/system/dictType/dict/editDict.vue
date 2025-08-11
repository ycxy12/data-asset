<script setup>
import { ref, reactive, toRaw, useTemplateRef } from 'vue'
import { addDict, updateDict } from '@/api/dict'
import { ElMessage } from 'element-plus'

const emits = defineEmits(['refresh'])

// 引用组件实例
const dialogFormRef = useTemplateRef('plusDialogFormRef')

const initForm = {
    id: undefined,
    dictValue: undefined,
    dictLabel: undefined,
}
const form = reactive({ ...initForm })
const confirmLoading = ref(false)

// 打开对话框
const visible = ref(false) // 弹框是否显示
const handleOpen = async (record) => {
    Object.assign(form, record)
    visible.value = true
}

// 提交表单
const handleSubmit = async () => {
    confirmLoading.value = true
    try {
        let params = toRaw(form)
        const RequestApi = params.id ? updateDict : addDict
        await RequestApi(params)
        ElMessage.success(`${params.id ? '编辑' : '新增'}字典类型成功`)
        handleCancel()
        emits('refresh')
    } finally {
        confirmLoading.value = false
    }
}

// 取消重置表单
const handleCancel = () => {
    visible.value = false
    dialogFormRef.value.formInstance.resetFields()
    Object.assign(form, initForm)
}

// 定义表单验证规则
const rules = {
    dictLabel: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
    dictValue: [{ required: true, message: '请输入字典标识', trigger: 'blur' }],
}

// 表格列配置
const columns = [
    { label: '字典名称', prop: 'dictLabel' },
    { label: '字典标识', prop: 'dictValue' },
]

defineExpose({ handleOpen })
</script>
<template>
    <PlusDialogForm
        ref="plusDialogFormRef"
        v-model:visible="visible"
        v-model="form"
        :form="{ columns, labelPosition: 'right', labelWidth: '100px', rules }"
        :dialog="{
            title: '字典类型',
            width: '700px',
            top: '10vh',
            confirmLoading,
        }"
        @confirm="handleSubmit"
        @cancel="handleCancel"
        @close="handleCancel"
    />
</template>

<style lang="scss" scoped></style>
