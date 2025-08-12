<script setup>
import { ref, reactive, toRaw, defineAsyncComponent, useTemplateRef, h } from 'vue'
import { Setting } from '@element-plus/icons-vue'
import { getSystemMenuApi, detailSystemMenuApi, addSystemMenuApi, updateSystemMenuApi } from '@/api/survey.js'
const Icon = defineAsyncComponent(() => import('./icon.vue'))

// emits
const emits = defineEmits(['refresh'])

/** 引用组件实例 */
const dialogFormRef = useTemplateRef('plusDrawerFormRef')
const iconInstance = useTemplateRef('iconRef')

// 初始化表单
const initForm = {
    id: undefined,
    permissionName: undefined,
    url: undefined,
    path: undefined,
    component: undefined,
    permissionCode: undefined,
    icon: undefined,
    showFlag: undefined,
    orderNum: undefined,
    remark: undefined,
    pcode: undefined,
    type: '0', //菜单标识
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
        ElMessage.success(`${params.id ? '编辑' : '新增'}菜单成功`)
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
const options = [
    { label: '是', value: 1 },
    { label: '否', value: 0 },
]
/** 表格列配置 */
const columns = [
    { label: '菜单名称', prop: 'permissionName', fieldProps: { maxlength: '10', showWordLimit: true } },
    { label: '菜单URL(浏览器显示)', prop: 'url', fieldProps: { maxlength: '50', showWordLimit: true } },
    { label: '路由路径', prop: 'path', fieldProps: { maxlength: '100', showWordLimit: true } },
    { label: '组件地址', prop: 'component', fieldProps: { maxlength: '100', showWordLimit: true } },
    { label: '相关权限', prop: 'permissionCode', fieldProps: { maxlength: '50', showWordLimit: true } },
    { label: '菜单图标', prop: 'icon', fieldSlots: { append: () => h(ElButton, { icon: Setting, onClick: () => iconInstance.value.handleOpen(form.icon) }) } },
    { label: '菜单排序', prop: 'orderNum', fieldProps: { type: 'number' } },
    { label: '备注', prop: 'remark', valueType: 'textarea' },
    { label: '是否显示', prop: 'showFlag', valueType: 'radio', options: options },
    { label: '上级菜单', prop: 'pcode', valueType: 'tree-select', fieldProps: { nodeKey: 'id', data: menuTree, props: props, checkStrictly: true, showCheckbox: true, renderAfterExpand: false, filterable: true } },
]

/** 校验 */
const rules = {
    permissionName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
    url: [{ required: true, message: '请输入菜单URL', trigger: 'blur' }],
    path: [{ required: true, message: '请输入路由路径', trigger: 'blur' }],
    component: [{ required: true, message: '请输入组件地址', trigger: 'blur' }],
    remark: [{ required: true, message: '请输入备注', trigger: 'blur' }],
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
            labelWidth: '160px',
            rules,
        }"
        :title="form.id ? '修改菜单' : '新增菜单'"
        :size="650"
        :confirmLoading="confirmLoading"
        @confirm="handleSubmit"
        @cancel="handleCancel"
        @close="handleCancel"
    />
    <Icon ref="iconRef" @confirm="form.icon = $event" />
</template>
