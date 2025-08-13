<template>
    <div class="graph_node">
        <template v-if="nodeType === 'virtual'">
            <div class="field virtual">
                <p>{{ node.text }}</p>
                <p style="font-size: 12px; font-style: italic">引用节点</p>
            </div>
        </template>

        <template v-else-if="nodeType === 'middleware'">
            <div class="field middleware" :style="{ backgroundColor: colors[node.text] || '#ff9e93' }">
                <p>{{ node.text }}</p>
                <a-tooltip>
                    <template #title>{{ node.data.mappingType === 1 ? '表内字段' : node.data.remark }}</template>
                    <p>{{ node.data.mappingType === 1 ? '表内字段' : node.data.remark }}</p>
                </a-tooltip>
            </div>
        </template>

        <template v-else-if="nodeType === 'field'">
            <div class="field standard">
                <p>{{ node.data.nameCn }}</p>
                <p>{{ node.data.nameEn }}</p>
                <a-tooltip>
                    <template #title>{{ node.data.source }}</template>
                    <p>{{ node.data.source }}</p>
                </a-tooltip>
            </div>
        </template>

        <template v-else-if="nodeType === 'mapped'">
            <div class="field mapping">
                <p>{{ node.text }}</p>
                <p>{{ node.data.mappingFieldNameEn }}</p>
                <a-tooltip>
                    <template #title>{{ node.data.mappingFieldSource }}</template>
                    <p>{{ node.data.mappingFieldSource }}</p>
                </a-tooltip>
            </div>
        </template>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    node: { type: Object, default: () => ({}) },
});

const colors = {
    一一对应: '#ff9e93',
    一对多: '#67C23A',
    多对一: '#54d691',
    多对多: '#fdd144',
};

const nodeType = computed(() => {
    if (props.node.data.isVirtual) return 'virtual';
    if (props.node.data.middleware) return 'middleware';
    if (props.node.data.fieldCode) return 'field';
    if (props.node.data.mappedFieldId) return 'mapped';
    return 'unknown';
});
</script>

<style lang="less" scoped>
.graph_node {
    border-radius: 5px;
    overflow: hidden;

    .field {
        padding: 8px 10px;
        p {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-align: left;
            line-height: 24px;
        }

        &.standard {
            width: 280px;
            color: #fff;
            background-color: rgba(21, 133, 252, 0.8);
        }

        &.middleware {
            width: 120px;
            color: #1f292e;
        }

        &.mapping {
            width: 280px;
            color: #1f292e;
            background-color: #d9ebfe;
        }

        &.virtual {
            width: 200px;
            color: #666;
            background-color: #f5f5f5;
            border: 1px dashed #bbb;
        }
    }
}
</style>
