<script setup>
import { ref, reactive, toRaw, useTemplateRef } from 'vue'
import { getSystemMenuApi, detailSystemMenuApi, addSystemMenuApi, updateSystemMenuApi } from '@/api/survey.js'

// emits
const emits = defineEmits(['refresh'])

/** 引用组件实例 */
const dialogFormRef = useTemplateRef('plusDrawerFormRef')

// 初始化表单
const initForm = {
    id: undefined,
    permissionName: undefined,
    permissionCode: undefined,
    remark: undefined,
    pcode: undefined,
    type: '1', //菜单标识
    sysType: '8',
}
const form = reactive({ ...initForm })
const confirmLoading = ref(false)

// 打开对话框
const visible = ref(false)
const handleOpen = async (id) => {
    initPermissionTree()
    if (id) getMenuDetail(id)
    visible.value = true
}

/** 提交表单 */
const handleSubmit = async () => {
    console.log(form)
    confirmLoading.value = true
    try {
        let params = toRaw(form)
        const RequestApi = params.id ? updateSystemMenuApi : addSystemMenuApi
        await RequestApi(toRaw(form))
        ElMessage.success(`${params.id ? '编辑' : '新增'}成功`)
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

// 获取菜单详情
const getMenuDetail = async (id) => {
    const { data } = await detailSystemMenuApi(id)
    Object.assign(form, data, { pcode: data.pcode === 0 ? undefined : data.pcode })
}

// 获取tree
const menuTree = ref([])
const initPermissionTree = async () => {
    const { data } = await getSystemMenuApi({ sysType: '8' })
    menuTree.value = data || []
}

const props = { value: 'id', label: 'permissionName' }
/** 表格列配置 */
const columns = [
    { label: '按钮名称', prop: 'permissionName', fieldProps: { maxlength: '10', showWordLimit: true } },
    { label: '相关权限', prop: 'permissionCode', fieldProps: { maxlength: '50', showWordLimit: true } },
    { label: '备注', prop: 'remark', valueType: 'textarea' },
    { label: '上级菜单', prop: 'pcode', valueType: 'tree-select', fieldProps: { nodeKey: 'id', data: menuTree, props: props, checkStrictly: true, showCheckbox: true, renderAfterExpand: false, filterable: true } },
]

/** 校验 */
const rules = {
    permissionName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
    remark: [{ required: true, message: '请输入备注', trigger: 'blur' }],
    pcode: [{ required: true, message: '请选择上级菜单', trigger: 'change' }],
}

defineExpose({ handleOpen })
</script>
<template>
    <PlusDrawerForm
        ref="plusDrawerFormRef"
        v-model:visible="visible"
        v-model="form"
        :form="{
            columns,
            labelPosition: 'right',
            labelWidth: '100px',
            rules,
        }"
        :title="form.id ? '修改按钮' : '新增按钮'"
        :size="650"
        :confirmLoading="confirmLoading"
        @confirm="handleSubmit"
        @cancel="handleCancel"
        @close="handleCancel"
    />
</template>
