<template>
    <div class="dictionary">
        <a-radio-group v-bind="{ ...$attrs, ...props }" style="margin: 5px 0 10px" />
        <a-form-item-rest>
            <a-textarea v-model:value="sample" placeholder="补充信息" :rows="4" @change="onchange" />
        </a-form-item-rest>
    </div>
</template>

<script setup>
import { createVNode, ref, watch } from 'vue';
import { Modal, message } from 'ant-design-vue';
import { useDebounceFn } from '@vueuse/core';

const props = defineProps({
    extraKey: {
        type: String,
        default: '',
    },
    remark: {
        type: String,
        default: '',
    },
});

const emit = defineEmits(['extra']);

// 样例数据
const sample = ref(undefined);
const onchange = useDebounceFn((e) => {
    emit('extra', props.extraKey, sample.value);
});
watch(
    () => props.remark,
    (newVal) => {
        sample.value = newVal;
    },
);
</script>
<style lang="less" scoped>
.dictionary {
    .dictionary-content {
        margin-top: 16px;
        width: 60%;
        .title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
            div {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background-color: #1890ff;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
            }
        }
        p {
            color: rgba(0, 0, 0, 0.88);
            font-size: 14px;
        }
    }
}
</style>
