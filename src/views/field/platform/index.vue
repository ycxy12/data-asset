<script setup>
import { ref, reactive, toRefs, toRaw, computed, watchEffect, useTemplateRef, defineAsyncComponent, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { useTable } from 'plus-pro-components'
import { listStandardField } from '@/api/platform'
import { treeDomain } from '@/api/area'
import { useTableHeight } from '@/hooks/useTableHeight'
import { checkTime } from '@/utils/business'
import { dayjs } from 'element-plus'
import { useRouter } from 'vue-router'
import ColorTag from '@/components/ColorTag/index.vue'
const Edit = defineAsyncComponent(() => import('./edit.vue'))

const router = useRouter()
// 引用组件实例
const plusPageRef = useTemplateRef('plusPageRef')
const editInstance = useTemplateRef('editRef')

//默认搜索
const defaultValues = reactive({
    keyword: undefined,
    domainId: undefined,
    onlySubscribed: false,
    updateTime: false,
})

// 查询列表
const getList = async (query) => {
    const { page = 1, pageSize = 20, domainId, keyword, onlySubscribed, updateTime } = query || {}
    const params = { currPage: page, pageSize, keyword, domainId: domainId ? domainId[domainId.length - 1] : undefined, onlySubscribed }
    if (updateTime) {
        params.startTime = dayjs().subtract(1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss')
        params.endTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
    const { data, totalCount } = await listStandardField(params)
    return { data, success: true, total: totalCount }
}

// 新增
const handleCreate = () => {
    editInstance.value?.handleOpen()
}

// 刷新列表
const refresh = () => {
    plusPageRef.value?.getList()
}

// 操作按钮事件
const handleTableOption = async ({ row, buttonRow }) => {
    switch (buttonRow.code) {
        case 'view':
            router.push({ path: `/field/platform/details`, query: { id: row.id } })
            break
    }
}

// 操作按钮配置
const { buttons } = useTable()
buttons.value = [{ text: '查看明细', code: 'view', props: { type: 'primary' } }]

const props = { value: 'id', label: 'name' }
// 获取tree
const treeData = ref([])
const getDomainTree = async () => {
    const { data } = await treeDomain()
    treeData.value = data || []
}

// 表格列配置
const columns = [
    { label: '字段编码', prop: 'fieldCode', width: 150, hideInSearch: true },
    { label: '字段名称', prop: 'nameCn', width: 240, hideInSearch: true },
    { label: '字段名称', prop: 'keyword', hideInForm: true, hideInTable: true },
    { label: '字段英文', prop: 'nameEn', width: 240, hideInSearch: true },
    { label: '业务展示名称', prop: 'displayName', width: 200, hideInSearch: true },
    { label: '领域', prop: 'domainId', valueType: 'cascader', options: computed(() => treeData.value), fieldProps: { showAllLevels: false, clearable: true, props: props, filterable: true } },
    { label: '字段说明', prop: 'description', hideInSearch: true },
    { label: '我关注的', prop: 'onlySubscribed', valueType: 'switch', hideInForm: true, hideInTable: true, colProps: { span: 3 } },
    { label: '有更新', prop: 'updateTime', valueType: 'switch', hideInForm: true, hideInTable: true, colProps: { span: 3 } },
]

onMounted(() => {
    getDomainTree()
})

// 使用自定义 hook 计算表格高度
const { tableHeight } = useTableHeight({ getSearchElement: () => plusPageRef.value?.plusSearchInstance })
</script>
<template>
    <div>
        <PlusPage
            ref="plusPageRef"
            :columns="columns"
            :request="getList"
            :table="{
                maxHeight: tableHeight,
                actionBar: { buttons },
                onClickAction: handleTableOption,
            }"
            :search="{ showNumber: 4, defaultValues: defaultValues }"
        >
            <template #table-title>
                <el-row class="button-row">
                    <el-button type="primary" plain :icon="Plus" size="small" @click="handleCreate">新增</el-button>
                </el-row>
            </template>
            <!-- cell自定义 -->
            <template #plus-cell-fieldCode="{ row }">
                <div class="field_custom">
                    <span>{{ row.fieldCode }}</span>
                    <div class="new" v-if="checkTime(row.createTime)">new</div>
                    <div class="new update" v-if="!checkTime(row.createTime) && checkTime(row.updateTime)">有更新</div>
                </div>
            </template>
            <template #plus-cell-domainId="{ row }">
                <ColorTag color="#c41d7f">{{ row.domainName }}</ColorTag>
            </template>
        </PlusPage>
        <!-- 新增/编辑 -->
        <Edit ref="editRef" @refresh="refresh" />
    </div>
</template>
<style lang="scss" scoped>
.field_custom {
    display: flex;
    align-items: center;
    .new {
        color: #fff;
        background-color: #f36161;
        line-height: 17px;
        font-size: 12px;
        border-radius: 20px;
        padding: 0 5px 2px;
        margin-left: 10px;
    }
    .update {
        font-size: 10px;
        background-color: #e6a23c;
        padding: 1px 5px;
    }
}
</style>
