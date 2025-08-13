<template>
    <div class="full">
        <div class="full_header">
            <h3>{{ fieldName }} - 字段调用</h3>
        </div>
        <a-form ref="formRef" layout="inline" :model="searchForm" class="full_form">
            <a-form-item label="库名" name="dbName">
                <a-input v-model:value="searchForm.dbName" placeholder="请输入库名" />
            </a-form-item>
            <a-form-item label="表名" name="tableName">
                <a-input v-model:value="searchForm.tableName" placeholder="请输入表名" />
            </a-form-item>
            <a-form-item label="字段" name="fieldName">
                <a-input v-model:value="searchForm.fieldName" placeholder="请输入字段" />
            </a-form-item>
            <div style="margin-left: auto">
                <a-button type="primary" @click="search">搜索</a-button>
                <a-button style="margin-left: 10px" @click="reset">重置</a-button>
            </div>
        </a-form>
        <!-- 表格 -->
        <CallInfoTable ref="callInfoTableRef" />
    </div>
</template>
<script setup>
import { ref, reactive, useTemplateRef } from 'vue';
import CallInfoTable from './components/table.vue';

defineProps(['fieldName']);
const emits = defineEmits('search');

// 搜索Ref
const formInstance = useTemplateRef('formRef');
// 列表Ref
const callInfoTableInstance = useTemplateRef('callInfoTableRef');
const searchForm = reactive({
    dbName: undefined,
    tableName: undefined,
    fieldName: undefined,
});
const search = () => {
    callInfoTableInstance.value.customSearch(searchForm);
};
const reset = () => {
    formInstance.value.resetFields();
    search();
};
</script>

<style lang="less" scoped>
.full {
    background-color: #fff;
    margin-top: 10px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    padding: 12px;
    .full_header {
        margin: 10px 0 20px;
    }
    .full_form {
        margin-bottom: 10px;
    }
}
</style>
