<template>
    <a-table :dataSource="filteredData" :columns="columns" bordered size="small">
        <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
                <a-button v-hasPermission="'platform:callInfo:delete'" type="link" @click="deleteHandler(record)" style="color: #ff4d4f">删除</a-button>
            </template>
        </template>
    </a-table>
    <!-- 新增/编辑 -->
    <editCallInfo ref="editCallInfoRef" @refresh="onFefresh" />
</template>
<script setup>
import { ref, computed, useTemplateRef, defineAsyncComponent, toRaw, reactive, onMounted, unref } from 'vue';
import { useRoute } from 'vue-router';
import { listCallingField, deleteCallingField } from '@/api/platform';
import { useHandleData } from '@/hooks/useHandleData.js';
import { useTable } from '@/hooks/useTable';
const editCallInfo = defineAsyncComponent(() => import('@/views/field/platform/details/callInfo/editCallInfo.vue'));

// 编辑区域Ref
const editCallInfoInstance = useTemplateRef('editCallInfoRef');
// 路由
const route = useRoute();
// 初始化参数
const searchForm = reactive({
    dbName: undefined,
    tableName: undefined,
    fieldName: undefined,
});

// // 表格操作 Hooks
const { dataSource, getTableList } = useTable(listCallingField, { id: route.query.id }, false);

// 模糊搜索
const filteredData = computed(() => {
    return dataSource.value.filter((item) => {
        const dbName = searchForm.dbName ? item.dbName.includes(searchForm.dbName) : true;
        const tableName = searchForm.tableName ? item.tableName.includes(searchForm.tableName) : true;
        const fieldName = searchForm.fieldName ? item.fieldName.includes(searchForm.fieldName) : true;
        return dbName && tableName && fieldName;
    });
});

// 列表项
const columns = computed(() => [
    { title: '库名', dataIndex: 'dbName' },
    { title: '表名', dataIndex: 'tableName' },
    { title: '字段', dataIndex: 'fieldName' },
    { title: '操作', dataIndex: 'operation', width: 140, slot: 'custom', fixed: 'right' },
]);

//刷新
const onFefresh = () => {
    getTableList();
};
// 新增
const addHandler = () => {
    editCallInfoInstance.value.openDialog();
};
// 删除
const deleteHandler = async (params) => {
    await useHandleData(deleteCallingField, params, `删除【${params.dbName}.${params.tableName}.${params.fieldName}】字段调用信息`);
    getTableList();
};
// 自定义搜索
const customSearch = (form) => {
    Object.assign(searchForm, form);
};

onMounted(() => {
    getTableList();
});
defineExpose({ addHandler, customSearch });
</script>
