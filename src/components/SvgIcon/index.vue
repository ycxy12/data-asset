<!-- src/components/SvgIcon.vue -->
<template>
    <component :is="iconComponent" v-if="iconComponent" v-bind="attrs" class="svg-icon" />
</template>

<script setup>
import { computed } from 'vue'
import { useAttrs } from 'vue'

// 传入 name (不含.svg)
const props = defineProps({
    name: {
        type: String,
        required: true,
    },
})

// 继承其他绑定属性（如 class, style）
const attrs = useAttrs()

// 动态加载 icons 目录下的所有 SVG（vite-svg-loader 会把它们转成组件）
const modules = import.meta.glob('@/assets/icons/*.svg', { eager: true })

const iconComponent = computed(() => {
    const entry = Object.entries(modules).find(([path]) => path.endsWith(`${props.name}.svg`))
    return entry?.[1]?.default || null
})
</script>

<style scoped>
.svg-icon {
    width: 1em;
    height: 1em;
    vertical-align: middle;
    fill: currentColor;
}
</style>
