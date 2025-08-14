<template>
    <Card title="字段关联映射">
        <template #headerLeft>
            <el-tooltip effect="dark" content="添加" placement="top">
                <el-icon v-hasPermission="'platform:association:add'" class="card_icon" color="#1677ff" size="16px" @click="addHandler"><CirclePlus /></el-icon>
            </el-tooltip>
        </template>
        <template #headerRight>
            <el-tooltip effect="dark" content="展开" placement="top">
                <el-icon class="card_icon" color="#1677ff" size="16px" @click="fullHandler"><FullScreen /></el-icon>
            </el-tooltip>
        </template>
        <AssociationTable ref="associationTableRef" />
    </Card>
</template>
<script setup>
import { useTemplateRef } from 'vue'
import Card from '../components/Card.vue'
import AssociationTable from './components/table.vue'

const emits = defineEmits(['full'])
// 列表Ref
const associationTableInstance = useTemplateRef('associationTableRef')

// 新增
const addHandler = () => {
    associationTableInstance.value.addHandler()
}
// 展开
const fullHandler = () => {
    emits('full', 'association')
}
</script>
