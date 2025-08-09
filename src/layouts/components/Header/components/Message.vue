<template>
    <div class="message">
        <el-badge :value="5">
            <el-icon><Bell /></el-icon>
        </el-badge>
    </div>
</template>

<script setup></script>

<style scoped lang="scss">
.message {
    padding: 5px;
    i {
        font-size: 18px;
    }
    &:hover {
        cursor: pointer;
        background-color: rgba(102, 152, 255, 0.1);
        i {
            color: #2072f5;
        }
    }
}
</style>
