<script setup>
import { ref, reactive, toRaw, computed, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'
import { getDict } from '@/api/dict'
import { listStandardField, addMappingField, updateMappingField } from '@/api/platform'

const emits = defineEmits(['refresh'])
const route = useRoute()

/** 引用组件实例 */
const dialogFormRef = useTemplateRef('plusDialogFormRef')

const initForm = {
    id: undefined,
    mappedFieldId: undefined,
    mappingFieldNameEn: undefined,
    mappingFieldSource: undefined,
    mappingType: undefined,
    mappingMode: 2,
    remark: undefined,
}
const form = reactive({ ...initForm })
const confirmLoading = ref(false)

// 打开对话框
const visible = ref(false)
const handleOpen = async (ids, record) => {
    listDict() // 获取映射关系字典
    getMappingField(ids)
    if (record) Object.assign(form, record)
    visible.value = true
}

// 提交表单
const handleSubmit = async () => {
    try {
        confirmLoading.value = true
        let params = toRaw(form)
        const RequestApi = params.id ? updateMappingField : addMappingField
        await RequestApi(Object.assign({}, params, { fieldId: route.query.id }))
        ElMessage.success(`${params.id ? '编辑' : '新增'}字段关联映射成功`)
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

const nameOption = ref([])
// 获取字段详情
const getMappingField = async (ids) => {
    const { data } = await listStandardField({ currPage: 1, pageSize: 1000 })
    nameOption.value = data.map((item) => {
        return { ...item, fieldItemProps: { disabled: ids.includes(item.id) } }
    })
}

// 下拉选择映射字段名称
const handleChange = (values, column) => {
    if (column.prop === 'mappedFieldId') {
        const mappedField = nameOption.value.find((item) => item.id === values.mappedFieldId)
        form.mappingFieldNameEn = mappedField.nameEn
        form.mappingFieldSource = mappedField.source
    }
}

const options = ref([])
// 获取映射类型字典
const listDict = async () => {
    const { data } = await getDict('MAPPING_TYPE')
    options.value = data.dataList
}

// 定义表单验证规则
const rules = {
    mappedFieldId: [{ required: true, message: '请输入映射字段名称', trigger: 'change' }],
    mappingFieldNameEn: [{ required: true, message: '请输入映射字段英文', trigger: 'change' }],
    mappingFieldSource: [{ required: true, message: '请选择映射字段来源', trigger: 'change' }],
    mappingType: [{ required: true, message: '请输入映射类型', trigger: 'change' }],
    mappingMode: [{ required: true, message: '请输入映射关联方式', trigger: 'change' }],
}

const options1 = [
    { label: '表内字段', value: 2 },
    { label: '其他', value: 1 },
]
// 定义表单项
const columns = [
    { label: '映射字段名称', prop: 'mappedFieldId', valueType: 'select', options: computed(() => nameOption.value), optionsMap: { label: 'nameCn', value: 'id' }, fieldProps: { filterable: true, disabled: form.id ? true : false } },
    { label: '映射字段英文', prop: 'mappingFieldNameEn', fieldProps: { disabled: true } },
    { label: '映射字段来源', prop: 'mappingFieldSource', fieldProps: { disabled: true } },
    { label: '映射类型', prop: 'mappingType', valueType: 'select', options: computed(() => options.value) },
    { label: '映射关联方式', prop: 'mappingMode', valueType: 'radio', options: options1 },
]

// 暴露方法
defineExpose({ handleOpen })
</script>
<template>
    <PlusDialogForm
        ref="plusDialogFormRef"
        v-model:visible="visible"
        v-model="form"
        :form="{ columns, labelPosition: 'right', labelWidth: '120px', rules }"
        :dialog="{
            title: form.id ? '编辑字段映射 - ' + form.mappingFieldNameCn : '新增字段映射',
            width: '600px',
            top: '10vh',
            confirmLoading,
        }"
        @confirm="handleSubmit"
        @change="handleChange"
        @cancel="handleCancel"
        @close="handleCancel"
    >
        <template #plus-extra-mappingMode>
            <div style="margin-left: 120px">
                <el-input v-model="form.remark" :rows="4" type="textarea" placeholder="请输入补充信息" />
            </div>
        </template>
    </PlusDialogForm>
</template>
