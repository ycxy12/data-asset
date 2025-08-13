<template>
    <custom-dialog :open="open" :title="title" :width="600" @close="handleCancel" @sure="handleSubmit">
        <template #content>
            <DynamicForm ref="formRef" :formItems="formItems" v-model="form" :rules="rules" :labelCol="{ style: { width: '120px' } }"></DynamicForm>
        </template>
    </custom-dialog>
</template>

<script setup>
defineOptions({ name: 'EditAssociation' });
import { ref, reactive, toRaw, computed, useTemplateRef, unref, defineOptions } from 'vue';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import DynamicForm from '@/components/Form/DynamicForm.vue';
import RadioInput from '../components/RadioInput.vue';
import { getDict } from '@/api/dict';
import { listStandardField, addMappingField, updateMappingField } from '@/api/platform';

const emits = defineEmits(['refresh']);
const route = useRoute();

const initForm = {
    id: undefined,
    mappedFieldId: undefined,
    mappingFieldNameEn: undefined,
    mappingFieldSource: undefined,
    mappingType: undefined,
    mappingMode: 0,
};
const form = reactive({ ...initForm });
const loading = ref(false);

// 打开对话框
const open = ref(false);
const openDialog = async (record) => {
    listDict(); // 获取映射关系字典
    if (Array.isArray(record)) {
        getMappingField(record);
    } else {
        getMappingField();
        Object.assign(form, record);
    }

    open.value = true;
};

// 表单实例
const formInstance = useTemplateRef('formRef');
// 提交表单
const handleSubmit = async () => {
    await formInstance.value.validate().then(async () => {
        loading.value = true;
        let params = toRaw(form);
        const RequestApi = params.id ? updateMappingField : addMappingField;
        const { code } = await RequestApi(Object.assign({}, params, { fieldId: route.query.id }));
        if (code === 200) {
            message.success(`${params.id ? '编辑' : '新增'}字段关联映射成功`);
            handleCancel();
            emits('refresh');
        }
        loading.value = false;
    });
};

// 取消重置表单
const handleCancel = () => {
    open.value = false;
    formInstance.value.resetFields();
    Object.assign(form, initForm);
};

const nameOption = ref([]);
// 获取字段详情
const getMappingField = async (ids) => {
    const { data } = await listStandardField({ currPage: 1, pageSize: 1000 });
    nameOption.value = data.map((item) => {
        return { ...item, disabled: ids.includes(item.id) };
    });
};

// 下拉选择映射字段名称
const onChange = (value, option) => {
    form.mappingFieldNameEn = option.nameEn;
    form.mappingFieldSource = option.source;
};

const options = ref([]);
// 获取映射类型字典
const listDict = async () => {
    const { data } = await getDict('MAPPING_TYPE');
    options.value = data.dataList;
};

// 定义表单验证规则
const rules = {
    mappedFieldId: [{ required: true, message: '请输入映射字段名称', trigger: 'change' }],
    mappingFieldNameEn: [{ required: true, message: '请输入映射字段英文', trigger: 'change' }],
    mappingFieldSource: [{ required: true, message: '请选择映射字段来源', trigger: 'change' }],
    mappingType: [{ required: true, message: '请输入映射类型', trigger: 'change' }],
    mappingMode: [{ required: true, message: '请输入映射关联方式', trigger: 'change' }],
};

const fieldNames = { label: 'nameCn', value: 'id' };
const options1 = [
    { label: '表内字段', value: 2 },
    { label: '其他', value: 1 },
];
//过滤
const filterOption = (input, option) => {
    return option.nameCn.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};
// 定义表单项
const formItems = computed(() => [
    { label: '映射字段名称', key: 'mappedFieldId', type: 'select', options: unref(nameOption), fieldNames, onChange, disabled: form.id ? true : false, filterOption: filterOption, showSearch: true },
    { label: '映射字段英文', key: 'mappingFieldNameEn', disabled: true },
    { label: '映射字段来源', key: 'mappingFieldSource', disabled: true },
    { label: '映射类型', key: 'mappingType', type: 'select', options: options },
    { label: '映射关联方式', key: 'mappingMode', type: RadioInput, options: options1, extraKey: 'remark', remark: form.remark },
]);

// 弹框标题
const title = computed(() => {
    return form.id ? '编辑字段映射 - ' + form.mappingFieldNameCn : '新增字段映射';
});

// 暴露方法
defineExpose({ openDialog });
</script>
