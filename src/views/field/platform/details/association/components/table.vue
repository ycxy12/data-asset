<template>
    <a-table :dataSource="filteredData" :columns="columns" bordered size="small" :pagination="{ hideOnSinglePage: true }">
        <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'mappingFieldNameCn'">
                <span @click="handleFieldClick(record)" :style="{ color: '#2072f5', cursor: 'pointer' }">{{ record.mappingFieldNameCn }}</span>
            </template>
            <template v-if="column.dataIndex === 'operation'">
                <a-button v-hasPermission="'platform:association:edit'" type="link" @click="editHandler(record)">编辑</a-button>
                <a-button v-hasPermission="'platform:association:delete'" type="link" @click="deleteHandler(record)" style="color: #ff4d4f">删除</a-button>
            </template>
        </template>
    </a-table>
    <!-- 新增/编辑 -->
    <EditAssociation ref="editAssociationRef" @refresh="onFefresh" />
</template>
<script setup>
import { ref, computed, useTemplateRef, defineAsyncComponent, toRaw, reactive, onMounted, unref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { listMappingField, deleteMappingField } from '@/api/platform';
import { useHandleData } from '@/hooks/useHandleData.js';
import { getDict } from '@/api/dict';
import { useTable } from '@/hooks/useTable';
const EditAssociation = defineAsyncComponent(() => import('@/views/field/platform/details/association/editAssociation.vue'));

// 编辑区域Ref
const editAssociationInstance = useTemplateRef('editAssociationRef');
// 路由
const route = useRoute();
const router = useRouter();
// 初始化参数
const searchForm = reactive({
    mappingFieldNameCn: undefined,
    mappingFieldNameEn: undefined,
});

//获取列表id
const ids = ref([]);
const dataCallback = (data) => {
    ids.value = data.map((item) => item.id);
    ids.value.push(Number(route.query.id));
    return data;
};

// // 表格操作 Hooks
const { dataSource, getTableList } = useTable(listMappingField, { id: route.query.id }, false, dataCallback);

// 模糊搜索
const filteredData = computed(() => {
    return dataSource.value.filter((item) => {
        const mappingFieldNameCn = searchForm.mappingFieldNameCn ? item.mappingFieldNameCn.includes(searchForm.mappingFieldNameCn) : true;
        const mappingFieldNameEn = searchForm.mappingFieldNameEn ? item.mappingFieldNameEn.includes(searchForm.mappingFieldNameEn) : true;
        return mappingFieldNameCn && mappingFieldNameEn;
    });
});

const options = ref([]);
// 获取映射类型字典
const listDict = async () => {
    const { data } = await getDict('MAPPING_TYPE');
    options.value = data.dataList;
};

// 列表项
const columns = [
    { title: '映射字段名称', dataIndex: 'mappingFieldNameCn' },
    { title: '映射字段英文', dataIndex: 'mappingFieldNameEn' },
    { title: '映射字段来源', dataIndex: 'mappingFieldSource' },
    { title: '映射类型', dataIndex: 'mappingType', customRender: ({ text }) => options.value.find((item) => item.value === text)?.label },
    { title: '映射关联方式', dataIndex: 'mappingMode', customRender: ({ text, record }) => (text === 1 ? record.remark : '表内字段') },
    { title: '操作', dataIndex: 'operation', width: 140, slot: 'custom', fixed: 'right' },
];

//刷新
const onFefresh = () => {
    getTableList();
};
// 新增
const addHandler = () => {
    editAssociationInstance.value.openDialog(unref(ids));
};
// 编辑
const editHandler = (record) => {
    editAssociationInstance.value.openDialog(toRaw(record));
};
// 删除
const deleteHandler = async (params) => {
    await useHandleData(deleteMappingField, { id: params.id }, `删除【${params.mappingFieldNameCn}】字段关联映射`);
    getTableList();
};

// 处理映射字段名称点击事件
const handleFieldClick = (record) => {
    router.push({ path: `/field/platform/details`, query: { id: record.mappedFieldId } });
};
// 自定义搜索
const customSearch = (form) => {
    Object.assign(searchForm, form);
};

onMounted(() => {
    listDict();
    getTableList();
});
defineExpose({ addHandler, customSearch });
</script>
