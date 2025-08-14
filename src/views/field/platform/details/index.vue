<template>
    <div class="details">
        <div class="back">
            <el-button :icon="ArrowLeftBold" @click="handleBack" size="small">返回</el-button>
        </div>
        <template v-if="isShow === 'details'">
            <BaseInfo @updateFieldName="updateFieldName" />
            <Association @full="handleFull" />
            <CallInfo @full="handleFull" />
        </template>
        <template v-if="isShow === 'association'">
            <fullAssociation :fieldName="fieldName" />
        </template>
        <template v-if="isShow === 'callInfo'">
            <fullCallInfo :fieldName="fieldName" />
        </template>
    </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeftBold } from '@element-plus/icons-vue'
import BaseInfo from './baseInfo/index.vue'
import CallInfo from './callInfo/index.vue'
import Association from './association/index.vue'
import fullAssociation from './association/full.vue'
import fullCallInfo from './callInfo/full.vue'

const router = useRouter()
// details:详情, association:字段关联映射, callInfo:字段调用信息
const isShow = ref('details')
const fieldName = ref('')

//显示
const handleFull = (type) => {
    isShow.value = type
}
//传递字段名称参数
const updateFieldName = (val) => {
    fieldName.value = val
}

// 返回
const handleBack = () => {
    if (isShow.value !== 'details') {
        isShow.value = 'details'
        return
    }
    router.push('/field/platform')
}
</script>

<style lang="scss" scoped>
.details {
    .back {
        display: flex;
        justify-content: flex-end;
    }
}
</style>
