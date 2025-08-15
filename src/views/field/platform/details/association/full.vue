<template>
    <div class="full">
        <div class="full_header">
            <h3>{{ fieldName }} - 字段映射</h3>
            <el-radio-group v-model="model">
                <el-radio-button label="表格模式" value="table" />
                <el-radio-button label="视图模式" value="view" />
            </el-radio-group>
        </div>
        <!-- 搜索 -->
        <PlusSearch v-if="model === 'table'" v-model="searchForm" :columns="columns" labelWidth="100px" @search="handleSearch" @reset="handleReset" style="margin-bottom: 10px" />
        <!-- 表格 -->
        <AssociationTable ref="associationTableRef" v-if="model === 'table'" />
        <!-- 视图模式 -->
        <AssociationGraph v-else />
    </div>
</template>
<script setup>
import { ref, reactive, useTemplateRef } from 'vue'
import AssociationTable from './components/table.vue'
import AssociationGraph from './components/graph.vue'

defineProps(['fieldName'])
const emits = defineEmits('search')
const model = ref('table')

// 列表Ref
const associationTableInstance = useTemplateRef('associationTableRef')

const searchForm = ref({
    mappingFieldNameCn: undefined,
    mappingFieldNameEn: undefined,
})

const handleSearch = () => {
    associationTableInstance.value.customSearch(searchForm.value)
}
const handleReset = () => {
    searchForm.value = {
        mappingFieldNameCn: undefined,
        mappingFieldNameEn: undefined,
    }
    associationTableInstance.value.customSearch(searchForm.value)
}

// 定义表单项
const columns = [
    { label: '映射字段名称', prop: 'mappingFieldNameCn' },
    { label: '映射字段英文', prop: 'mappingFieldNameEn' },
]
</script>

<style lang="scss" scoped>
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
            font-weight: 600;
        }
    }
    .full_form {
        margin-bottom: 10px;
    }
}
</style>
