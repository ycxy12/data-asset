<template>
    <Card title="字段调用信息">
        <template #headerLeft>
            <a-tooltip>
                <template #title>添加</template>
                <PlusCircleOutlined v-hasPermission="'platform:callInfo:add'" class="card_icon" style="color: #1677ff" @click="addHandler" />
            </a-tooltip>
        </template>
        <template #headerRight>
            <a-tooltip>
                <template #title>展开</template>
                <ExpandOutlined class="card_icon" style="color: #1677ff" @click="fullHandler" />
            </a-tooltip>
        </template>
        <CallInfoTable ref="callInfoTableRef" />
    </Card>
</template>
<script setup>
import { useTemplateRef } from 'vue';
import Card from '../components/Card.vue';
import CallInfoTable from './components/table.vue';

const emits = defineEmits(['full']);
// 列表Ref
const callInfoTableInstance = useTemplateRef('callInfoTableRef');

// 新增
const addHandler = () => {
    callInfoTableInstance.value.addHandler();
};

// 展开
const fullHandler = () => {
    emits('full', 'callInfo');
};
</script>

<style lang="less" scoped></style>
