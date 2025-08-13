<template>
    <div class="full">
        <div class="full_header">
            <h3>{{ fieldName }} - 字段映射</h3>
            <a-radio-group v-model:value="model" button-style="solid">
                <a-radio-button value="table">表格模式</a-radio-button>
                <a-radio-button value="view">视图模式</a-radio-button>
            </a-radio-group>
        </div>
        <a-form ref="formRef" layout="inline" :model="searchForm" class="full_form" v-if="model === 'table'">
            <a-form-item label="映射字段名称" name="mappingFieldNameCn">
                <a-input v-model:value="searchForm.mappingFieldNameCn" placeholder="请输入映射字段名称" />
            </a-form-item>
            <a-form-item label="映射字段英文" name="mappingFieldNameEn">
                <a-input v-model:value="searchForm.mappingFieldNameEn" placeholder="请输入映射字段英文" />
            </a-form-item>
            <div style="margin-left: auto">
                <a-button type="primary" @click="search">搜索</a-button>
                <a-button style="margin-left: 10px" @click="reset">重置</a-button>
            </div>
        </a-form>
        <!-- 表格 -->
        <AssociationTable ref="associationTableRef" v-if="model === 'table'" />
        <!-- 视图模式 -->
        <AssociationGraph v-else />
    </div>
</template>
<script setup>
import { ref, reactive, useTemplateRef } from 'vue';
import AssociationTable from './components/table.vue';
import AssociationGraph from './components/graph.vue';

defineProps(['fieldName']);
const emits = defineEmits('search');
const model = ref('table');

// 搜索Ref
const formInstance = useTemplateRef('formRef');
// 列表Ref
const associationTableInstance = useTemplateRef('associationTableRef');
const searchForm = reactive({
    mappingFieldNameCn: undefined,
    mappingFieldNameEn: undefined,
});
const search = () => {
    associationTableInstance.value.customSearch(searchForm);
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
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 10px 0 20px;
        position: relative;
        h3 {
            position: absolute;
            top: 0;
            left: 0;
        }
    }
    .full_form {
        margin-bottom: 10px;
    }
}
</style>
