<template>
    <div class="card">
        <div class="card_header">
            <div class="card_header_left">
                <span class="card_title">{{ title }}</span>
                <slot name="headerLeft"></slot>
            </div>
            <div class="card_deader_right">
                <slot name="headerRight"></slot>
            </div>
        </div>
        <div class="card_content">
            <slot></slot>
        </div>
    </div>
</template>
<script setup>
const props = defineProps({
    title: {
        type: String,
        default: '',
    },
})
</script>

<style lang="scss" scoped>
.card {
    background-color: #fff;
    margin-top: 10px;
    // box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.08);
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    .card_header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        min-height: 38px;
        border-bottom: 1px solid #f0f0f0;
        :deep(.card_icon) {
            font-size: 16px;
            margin-left: 10px;
            cursor: pointer;
        }
        .card_header_left,
        .card_deader_right {
            display: flex;
            align-items: center;
        }
    }

    .card_title {
        font-size: 15px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.88);
    }
    .card_content {
        padding: 12px;
    }
}
</style>
