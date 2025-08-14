<template>
    <Card title="字段调用信息">
        <template #headerLeft>
            <el-tooltip effect="dark" content="添加" placement="top">
                <el-icon v-auth="'platform:callInfo:add'" class="card_icon" color="#1677ff" size="16px" @click="addHandler"><CirclePlus /></el-icon>
            </el-tooltip>
        </template>
        <template #headerRight>
            <el-tooltip effect="dark" content="展开" placement="top">
                <el-icon class="card_icon" color="#1677ff" size="16px" @click="fullHandler"><FullScreen /></el-icon>
            </el-tooltip>
        </template>
        <CallInfoTable ref="callInfoTableRef" />
    </Card>
</template>
<script setup>
import { useTemplateRef } from 'vue'
import Card from '../components/Card.vue'
import CallInfoTable from './components/table.vue'

const emits = defineEmits(['full'])
// 列表Ref
const callInfoTableInstance = useTemplateRef('callInfoTableRef')

// 新增
const addHandler = () => {
    callInfoTableInstance.value.addHandler()
}

// 展开
const fullHandler = () => {
    emits('full', 'callInfo')
}
</script>

<style lang="less" scoped></style>
