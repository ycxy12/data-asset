<template>
    <custom-dialog :open="open" :title="title" :width="600" @close="handleCancel" @sure="handleSubmit">
        <template #content>
            <DynamicForm ref="formRef" :formItems="formItems" v-model="form" :rules="rules" :labelCol="{ style: { width: '60px' } }"></DynamicForm>
        </template>
    </custom-dialog>
</template>

<script setup>
import { ref, reactive, toRaw, computed, useTemplateRef, unref } from 'vue';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import DynamicForm from '@/components/Form/DynamicForm.vue';
import { addCallingField, updateCallingField } from '@/api/platform';
import { getDatabases, getTablesInDatabases, getColumnsInTables } from '@/api/databases';

const emits = defineEmits(['refresh']);
const route = useRoute();

const initForm = {
    id: undefined,
    sourceAlias: 'polardb',
    dbName: undefined,
    tableName: undefined,
    fieldName: undefined,
    fieldId: route.query.id,
};
const form = reactive({ ...initForm });
const loading = ref(false);

// 打开对话框
const open = ref(false);
const openDialog = async () => {
    fetchDatabases();
    open.value = true;
};

// 表单实例
const formInstance = useTemplateRef('formRef');
// 提交表单
const handleSubmit = async () => {
    await formInstance.value.validate().then(async () => {
        loading.value = true;
        let params = toRaw(form);
        const RequestApi = params.id ? updateCallingField : addCallingField;
        const { code } = await RequestApi(params);
        if (code === 200) {
            message.success(`${params.id ? '编辑' : '新增'}字段调用信息成功`);
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

const databases = ref([]);
const tableOptions = ref([]);
const columnOptions = ref([]);

// 定义表单验证规则
const rules = {
    dbName: [{ required: true, message: '请输入映射字段名称', trigger: 'change' }],
    tableName: [{ required: true, message: '请输入映射字段英文', trigger: 'change' }],
    fieldName: [{ required: true, message: '请选择映射字段来源', trigger: 'change' }],
};

// 定义表单项
const formItems = computed(() => [
    { label: '库名', key: 'dbName', type: 'select', options: unref(databases), onChange: onDatabaseChange, showSearch: true },
    { label: '表名', key: 'tableName', type: 'select', options: unref(tableOptions), onChange: onTableChange, showSearch: true },
    { label: '字段', key: 'fieldName', type: 'select', options: unref(columnOptions), showSearch: true },
]);

// 数据库发生改变
const onDatabaseChange = () => {
    tableOptions.value = [];
    columnOptions.value = [];
    form.tableName = undefined;
    form.columnName = undefined;
    fetchTables();
};

// 表发生改变
const onTableChange = () => {
    columnOptions.value = [];
    form.columnName = undefined;
    fetchColumns();
};

// 数据库
const fetchDatabases = async () => {
    const { data } = await getDatabases(toRaw(form));
    databases.value = data.map((item) => ({ value: item, label: item }));
};
// 表
const fetchTables = async () => {
    if (!form.dbName) return;
    const { data } = await getTablesInDatabases(form);
    tableOptions.value = data.map((table) => ({ label: table.tableName, value: table.tableName }));
};
// 字段
const fetchColumns = async () => {
    if (!form.dbName || !form.tableName) return;
    const { data } = await getColumnsInTables(form);
    columnOptions.value = data.map((col) => ({ label: col.columnName, value: col.columnName }));
};

// 弹框标题
const title = computed(() => {
    return form.id ? '编辑字段调用 - ' + form.dbName : '新增字段调用';
});

// 暴露方法
defineExpose({ openDialog });
</script>
