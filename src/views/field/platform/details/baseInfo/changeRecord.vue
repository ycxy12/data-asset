<template>
    <a-drawer title="变更记录" :mask-closable="false" :confirm-loading="loading" width="650" placement="right" :closable="false" :keyboard="true" v-model:open="open" @close="onClose" class="change_record">
        <div class="search_form">
            <a-form :model="searchForm" layout="inline">
                <a-form-item label="变更类型" name="changeType">
                    <a-select v-model:value="searchForm.changeType" placeholder="请选择变更类型" style="width: 160px" allowClear>
                        <a-select-option :value="0">新增</a-select-option>
                        <a-select-option :value="1">编辑</a-select-option>
                        <a-select-option :value="2">删除</a-select-option>
                    </a-select>
                </a-form-item>
                <div style="margin-left: auto">
                    <a-button type="primary" @click="search">搜索</a-button>
                    <a-button style="margin-left: 10px" @click="reset">重置</a-button>
                </div>
            </a-form>
        </div>
        <a-timeline class="timeline">
            <a-timeline-item v-for="item in list" :key="item.id">
                <div>
                    <p>操作人：{{ item.operatorName }}</p>
                    <p>操作时间：{{ item.createTime }}</p>
                    <p>
                        操作内容：
                        <span v-if="item.changeTypeDesc === '新增'">
                            <span style="font-weight: 600">{{ item.changeTypeDesc }}</span>
                            {{ item.fieldTypeDesc }}：
                            <span style="font-weight: 600">{{ item.newValue }}</span>
                        </span>
                        <span v-if="item.changeTypeDesc === '修改'">
                            <span style="font-weight: 600">{{ item.changeTypeDesc }}</span>
                            {{ `${item.fieldTypeDesc}-${item.fieldName}` }} 由
                            <span style="font-weight: 600">{{ item.oldValue ? item.oldValue : '--' }}</span>
                            变更为
                            <span style="font-weight: 600">{{ item.newValue ? item.newValue : '--' }}</span>
                        </span>
                        <span v-if="item.changeTypeDesc === '删除'">
                            <span style="font-weight: 600">{{ item.changeTypeDesc }}</span>
                            {{ item.fieldName }}：
                            <span style="font-weight: 600">{{ item.oldValue }}</span>
                        </span>
                    </p>
                </div>
            </a-timeline-item>
        </a-timeline>
        <div class="pagination">
            <a-pagination v-model:current="page.currPage" v-model:pageSize="page.pageSize" :total="page.total" show-size-changer @change="onPaginationChange" />
        </div>
        <template #footer>
            <a-button type="primary" @click="onClose">关闭</a-button>
        </template>
    </a-drawer>
</template>

<script setup>
import { ref, reactive, toRaw, computed, useTemplateRef, unref, onMounted } from 'vue';
import { logStandardField } from '@/api/platform';
import { useRoute } from 'vue-router';
const loading = ref(false);

const route = useRoute();
const list = ref([]);
const page = reactive({
    currPage: 1,
    pageSize: 10,
    total: 0,
});
const searchForm = reactive({
    fieldId: route.query.id,
    changeType: undefined,
});

// 打开对话框
const open = ref(false);
const openDialog = async () => {
    getLog();
    open.value = true;
};

// 获取操作日志
const getLog = async () => {
    const params = {
        currPage: page.currPage,
        pageSize: page.pageSize,
        fieldId: searchForm.fieldId,
        changeType: searchForm.changeType,
    };
    const { data, totalCount } = await logStandardField(params);
    list.value = flattenChangeDetails(data);
    page.total = totalCount;
};

const flattenChangeDetails = (data) => {
    const flatList = [];
    data.forEach((item) => {
        const { operatorName, createTime } = item;
        ['basicChangeDetails', 'mappingChangeDetails', 'callingChangeDetails'].forEach((key) => {
            if (Array.isArray(item[key])) {
                item[key].forEach((detail) => {
                    flatList.push({ ...detail, operatorName, createTime });
                });
            }
        });
    });
    // 按 createTime 倒序排序
    flatList.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    return flatList;
};

// 取消
const onClose = () => {
    open.value = false;
};

// 搜索
const search = () => {
    page.currPage = 1;
    getLog();
};
// 重置
const reset = () => {
    searchForm.changeType = undefined;
    page.currPage = 1;
    getLog();
};

//分页
const onPaginationChange = (currPage, pageSize) => {
    page.currPage = currPage;
    page.pageSize = pageSize;
    getLog();
};

// 暴露方法
defineExpose({ openDialog });
</script>
<style lang="less" scoped>
.search_form {
    margin-bottom: 15px;
}
.timeline {
    max-height: calc(100vh - 230px);
    overflow-y: auto;
    padding: 10px 0;
}
.pagination {
    padding-top: 15px;
    text-align: right;
}
</style>
<style lang="less">
.change_record {
    .ant-drawer-body {
        padding: 15px 24px;
    }
}
</style>
