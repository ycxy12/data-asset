<template>
    <el-table :data="filteredData" border>
        <el-table-column prop="mappingFieldNameCn" label="映射字段名称">
            <template #default="{ row }">
                <el-link type="primary" underline="never" @click="handleFieldClick(row)">{{ row.mappingFieldNameCn }}</el-link>
            </template>
        </el-table-column>
        <el-table-column prop="mappingFieldNameEn" label="映射字段英文" />
        <el-table-column prop="mappingFieldSource" label="映射字段来源" />
        <el-table-column prop="mappingType" label="映射类型">
            <template #default="{ row }">
                {{ options.find((item) => item.value === row.mappingType)?.label || '' }}
            </template>
        </el-table-column>
        <el-table-column prop="mappingMode" label="映射关联方式">
            <template #default="{ row }">
                {{ row.mappingMode === 1 ? row.remark : '表内字段' }}
            </template>
        </el-table-column>
        <el-table-column label="操作" width="140">
            <template #default="{ row }">
                <el-button v-auth="'platform:association:edit'" link type="primary" size="small" @click.prevent="editHandler(row)">编辑</el-button>
                <el-button v-auth="'platform:association:delete'" link type="danger" size="small" @click.prevent="deleteHandler(row)">删除</el-button>
            </template>
        </el-table-column>
    </el-table>
    <!-- 新增/编辑 -->
    <EditAssociation ref="editAssociationRef" @refresh="onFefresh" />
</template>
<script setup>
import { ref, computed, useTemplateRef, defineAsyncComponent, toRaw, reactive, onMounted, unref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { listMappingField, deleteMappingField } from '@/api/platform'
import { useHandleData } from '@/hooks/useHandleData.js'
import { getDict } from '@/api/dict'
import { useTable } from '@/hooks/useTable'
const EditAssociation = defineAsyncComponent(() => import('@/views/field/platform/details/association/editAssociation.vue'))

// 编辑区域Ref
const editAssociationInstance = useTemplateRef('editAssociationRef')
// 路由
const route = useRoute()
const router = useRouter()
// 初始化参数
const searchForm = reactive({
    mappingFieldNameCn: undefined,
    mappingFieldNameEn: undefined,
})

//获取列表id
const ids = ref([])
const dataCallback = (data) => {
    ids.value = data.map((item) => item.id)
    ids.value.push(Number(route.query.id))
    return data
}

// // 表格操作 Hooks
const { dataSource, getTableList } = useTable(listMappingField, { id: route.query.id }, false, dataCallback)

// 模糊搜索
const filteredData = computed(() => {
    return dataSource.value.filter((item) => {
        const mappingFieldNameCn = searchForm.mappingFieldNameCn ? item.mappingFieldNameCn.includes(searchForm.mappingFieldNameCn) : true
        const mappingFieldNameEn = searchForm.mappingFieldNameEn ? item.mappingFieldNameEn.includes(searchForm.mappingFieldNameEn) : true
        return mappingFieldNameCn && mappingFieldNameEn
    })
})

const options = ref([])
// 获取映射类型字典
const listDict = async () => {
    const { data } = await getDict('MAPPING_TYPE')
    options.value = data.dataList
}

//刷新
const onFefresh = () => {
    getTableList()
}
// 新增
const addHandler = () => {
    editAssociationInstance.value.handleOpen(unref(ids))
}
// 编辑
const editHandler = (record) => {
    editAssociationInstance.value.handleOpen(unref(ids), toRaw(record))
}
// 删除
const deleteHandler = async (params) => {
    await useHandleData(deleteMappingField, { id: params.id }, `删除【${params.mappingFieldNameCn}】字段关联映射`)
    getTableList()
}

// 处理映射字段名称点击事件
const handleFieldClick = (record) => {
    router.push({ path: `/field/platform/details`, query: { id: record.mappedFieldId } })
}
// 自定义搜索
const customSearch = (form) => {
    Object.assign(searchForm, form)
}

onMounted(() => {
    listDict()
    getTableList()
})
defineExpose({ addHandler, customSearch })
</script>
