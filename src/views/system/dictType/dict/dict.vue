<script setup>
import { ref, reactive, useTemplateRef, defineAsyncComponent } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { useTable } from 'plus-pro-components'
import auth from '@/directives/modules/auth'
import { getDictByType, deleteDict } from '@/api/dict'
import { ElMessage } from 'element-plus'
const editDict = defineAsyncComponent(() => import('./editDict.vue'))

// 列表Ref
const editDictInstance = useTemplateRef('editDictRef')
// 弹框是否显示
const show = ref(false)
// 初始化参数
const initParam = reactive({ dictType: undefined, typeId: undefined })
//表格数据
const tableData = ref([])

// 打开弹框
const handleOpen = async ({ dictType, typeId }) => {
    initParam.dictType = dictType
    initParam.typeId = typeId
    await getList()
    show.value = true
}

// 获取列表数据
const getList = async () => {
    const { data } = await getDictByType(initParam)
    tableData.value = data.dataList.map((item) => {
        return { id: item.id, dictLabel: item.label, dictValue: item.value }
    })
}

// 新增
const handleCreate = () => {
    editDictInstance.value?.handleOpen(initParam)
}

// 删除
const handleDelete = async (row) => {
    await deleteDict({ id: row.id })
    ElMessage.success('删除成功')
    getList()
}

// 操作按钮
const { buttons } = useTable()
buttons.value = [
    { text: '编辑', code: 'update', props: { type: 'primary' }, directives: [[auth, 'dict:edit']] },
    {
        text: '删除',
        code: 'delete',
        confirm: { title: (data) => `确认删除【${data.row.dictLabel}】字典？`, message: '操作不可恢复，是否继续？', options: { type: 'warning' } },
        props: { type: 'danger' },
        directives: [[auth, 'dict:delete']],
    },
]
/** 操作按钮事件 */
const handleClickButton = ({ row, buttonRow }) => {
    switch (buttonRow.code) {
        case 'update':
            const params = Object.assign({}, row, initParam)
            editDictInstance.value?.handleOpen(params)
            break
        case 'delete':
            handleDelete(row)
            break
    }
}

/** 表格列配置 */
const columns = [
    { label: '字典名称', prop: 'dictLabel' },
    { label: '字典标识', prop: 'dictValue' },
]

defineExpose({ handleOpen })
</script>
<template>
    <PlusDialog v-model="show" title="查看字典" width="700px" top="10vh" :hasFooter="false">
        <PlusTable :columns="columns" :table-data="tableData" :action-bar="{ buttons: buttons }" @clickAction="handleClickButton">
            <template #title>
                <el-row class="button-row">
                    <el-button v-auth="'dict:add'" type="primary" plain :icon="Plus" size="small" @click="handleCreate">新增</el-button>
                </el-row>
            </template>
        </PlusTable>
        <!-- 新增/编辑 -->
        <editDict ref="editDictRef" @refresh="getList" />
    </PlusDialog>
</template>
