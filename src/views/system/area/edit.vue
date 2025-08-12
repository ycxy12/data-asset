<script setup>
import { ref, reactive, toRaw, computed, useTemplateRef } from 'vue'
import { addDomain, updateDomain, treeDomain } from '@/api/area'

// emits
const emits = defineEmits(['refresh'])

/** 引用组件实例 */
const dialogFormRef = useTemplateRef('plusDialogFormRef')

// 初始化表单
const initForm = {
    id: undefined,
    parentId: undefined,
    name: undefined,
    code: undefined,
    color: undefined,
    status: 0,
    description: undefined,
}
const form = reactive({ ...initForm })
const confirmLoading = ref(false)

// 打开对话框
const visible = ref(false)
const handleOpen = async (row) => {
    getDomainTree()
    if (row) Object.assign(form, row, { parentId: [row.parentId] })
    console.log(form)
    visible.value = true
}

const props = { value: 'id', label: 'name', checkStrictly: true }

/** 提交表单 */
const handleSubmit = async () => {
    console.log(form)
    confirmLoading.value = true
    try {
        let params = toRaw(form)
        if (params.parentId && params.parentId.length) params.parentId = params.parentId[params.parentId.length - 1]
        const RequestApi = params.id ? updateDomain : addDomain
        await RequestApi(toRaw(form))
        ElMessage.success(`${params.id ? '编辑' : '新增'}字典类型成功`)
        handleCancel()
        emits('refresh')
    } finally {
        confirmLoading.value = false
    }
}

/** 取消并重置 */
const handleCancel = () => {
    dialogFormRef.value.formInstance.resetFields()
    visible.value = false
    Object.assign(form, initForm)
}

// 获取tree
const treeData = ref([])
const getDomainTree = async () => {
    const { data } = await treeDomain()
    treeData.value = data || []
}

/** 表格列配置 */
const columns = [
    { label: '领域名称', width: 240, prop: 'name', fieldProps: { disabled: computed(() => (form.id ? true : false)) } },
    { label: '领域编码', width: 240, prop: 'code', fieldProps: { disabled: computed(() => (form.id ? true : false)) } },
    { label: '是否启用', width: 240, prop: 'status', valueType: 'switch', fieldProps: { activeValue: 1, inactiveValue: 0 } },
    { label: '领域说明', prop: 'description' },
    { label: '颜色', prop: 'color', valueType: 'color-picker', fieldProps: { style: { width: '32px' } } },
    { label: '父级领域', prop: 'parentId', valueType: 'cascader', options: computed(() => treeData.value), fieldProps: { showAllLevels: false, clearable: true, props: props, filterable: true } },
]

/** 校验 */
const rules = {
    name: [{ required: true, message: '请输入领域名称', trigger: 'blur' }],
    code: [
        { required: true, message: '请输入领域编码', trigger: 'blur' },
        { pattern: /^[A-Za-z]+$/, message: '仅支持大小写英文字母', trigger: 'blur' },
    ],
}

defineExpose({ handleOpen })
</script>
<template>
    <PlusDialogForm
        ref="plusDialogFormRef"
        v-model:visible="visible"
        v-model="form"
        :form="{ columns, labelPosition: 'right', labelWidth: '120px', rules }"
        :dialog="{
            title: form.id ? '修改领域' : '新增领域',
            width: '700px',
            top: '10vh',
            confirmLoading,
        }"
        @confirm="handleSubmit"
        @cancel="handleCancel"
        @close="handleCancel"
    />
</template>
