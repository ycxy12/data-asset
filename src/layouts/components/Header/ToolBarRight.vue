<template>
    <div class="tool-bar-ri">
        <div class="header-icon">
            <SearchMenu id="searchMenu" />
            <System />
            <Message id="message" />
        </div>
        <Avatar />
    </div>
</template>

<script setup>
import SearchMenu from './components/SearchMenu.vue'
import Message from './components/Message.vue'
import Avatar from './components/Avatar.vue'
import System from './components/System.vue'
</script>

<style scoped lang="scss">
.tool-bar-ri {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-right: 5px;
    .header-icon {
        display: flex;
        align-items: center;
        & > * {
            margin-left: 21px;
            color: var(--el-header-text-color);
        }
    }
}
</style>
