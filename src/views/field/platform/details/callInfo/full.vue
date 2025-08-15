<template>
    <div class="full">
        <div class="full_header">
            <h3>{{ fieldName }} - 字段调用</h3>
        </div>
        <PlusSearch v-model="searchForm" :columns="columns" :show-number="3" labelWidth="50px" @search="handleSearch" @reset="handleReset" style="margin-bottom: 10px" />
        <!-- 表格 -->
        <CallInfoTable ref="callInfoTableRef" />
    </div>
</template>
<script setup>
import { ref, useTemplateRef, computed } from 'vue'
import CallInfoTable from './components/table.vue'

defineProps(['fieldName'])
const emits = defineEmits('search')

// 列表Ref
const callInfoTableInstance = useTemplateRef('callInfoTableRef')

const searchForm = ref({ dbName: undefined, tableName: undefined, fieldName: undefined })

const handleSearch = () => {
    callInfoTableInstance.value.customSearch(searchForm.value)
}
const handleReset = () => {
    searchForm.value = { dbName: undefined, tableName: undefined, fieldName: undefined }
    callInfoTableInstance.value.customSearch(searchForm.value)
}

// 定义表单项
const columns = computed(() => [
    { label: '库名', prop: 'dbName' },
    { label: '表名', prop: 'tableName' },
    { label: '字段', prop: 'fieldName' },
])
</script>

<style lang="scss" scoped>
.full {
    background-color: #fff;
    margin-top: 10px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    padding: 12px;
    .full_header {
        margin: 10px 0 20px;
        font-weight: 600;
    }
    .full_form {
        margin-bottom: 10px;
    }
}
</style>
