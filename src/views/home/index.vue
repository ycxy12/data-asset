<template>
    <div class="home-page">
        <h1>首页</h1>

        <!-- 测试主题色的Element Plus组件 -->
        <div class="test-components">
            <el-button type="primary">主要按钮 (#2072f5)</el-button>
            <el-button type="success">成功按钮</el-button>
            <el-button type="warning">警告按钮</el-button>
            <el-button type="danger">危险按钮</el-button>

            <br />
            <br />

            <el-switch v-model="switchValue" />
            <el-checkbox v-model="checkboxValue">复选框</el-checkbox>

            <br />
            <br />

            <el-input v-model="inputValue" placeholder="请输入内容" style="width: 200px" />

            <br />
            <br />

            <el-progress :percentage="70" />

            <br />
            <br />

            <el-tag type="primary">主要标签</el-tag>
            <el-tag type="success">成功标签</el-tag>
            <el-tag type="warning">警告标签</el-tag>
            <el-tag type="danger">危险标签</el-tag>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const switchValue = ref(true)
const checkboxValue = ref(true)
const inputValue = ref('')
</script>

<style lang="scss" scoped>
.home-page {
    padding: 20px;

    .test-components {
        margin-top: 20px;

        .el-button {
            margin-right: 10px;
        }

        .el-tag {
            margin-right: 10px;
        }
    }
}
</style>
