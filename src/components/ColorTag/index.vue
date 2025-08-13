<template>
    <el-tag :style="tagStyle">
        <slot />
    </el-tag>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    color: { type: String, required: true }, // 支持 #hex / rgb(...) / rgba(...)
    bgAlpha: { type: Number, default: 0.05 }, // 背景透明度（plain 的浅背景）
    borderAlpha: { type: Number, default: 0.5 }, // 边框透明度（通常为不透明）
    textAlpha: { type: Number, default: 1 }, // 文字透明度
})

/**
 * 把 hex 转成 {r,g,b}，不支持带 # 的 8 位 hex （rgba hex）
 */
function hexToRgb(hex) {
    if (!hex) return null
    hex = hex.replace('#', '')
    if (hex.length === 3) {
        hex = hex
            .split('')
            .map((c) => c + c)
            .join('')
    }
    if (hex.length !== 6) return null
    const n = parseInt(hex, 16)
    return {
        r: (n >> 16) & 255,
        g: (n >> 8) & 255,
        b: n & 255,
    }
}

/**
 * 将任意支持的 color 字符串转成可用的 rgba(...) 字符串
 * 支持：#rrggbb / #rgb / rgb(...) / rgba(...)
 */
function toRgbaString(color, alpha = 1) {
    if (!color) return ''
    color = color.trim()
    if (color.startsWith('rgb')) {
        // rgb(...) 或 rgba(...)，如果是 rgba 且提供了 alpha，则保留原 alpha 或覆盖？
        if (color.startsWith('rgba')) {
            // 强制用外部 alpha：把 rgb 部分抽出
            const parts = color.match(/rgba?\(([^)]+)\)/)
            if (!parts) return color
            const channels = parts[1].split(',').map((s) => s.trim())
            return `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${alpha})`
        } else {
            // rgb(...)
            const parts = color.match(/rgb\(([^)]+)\)/)
            if (!parts) return color
            const channels = parts[1].split(',').map((s) => s.trim())
            return `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${alpha})`
        }
    } else if (color.startsWith('#')) {
        const rgb = hexToRgb(color)
        if (!rgb) return color
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
    }
    // 其他（比如 color name），直接返回 color（可能不支持 alpha）
    return color
}

const tagStyle = computed(() => {
    const baseColor = props.color
    // 用作文本色（完全或按 textAlpha）
    const textColor = toRgbaString(baseColor, props.textAlpha)
    // 背景色要比文本淡很多，默认 0.08（可通过 bgAlpha 调整）
    const bgColor = toRgbaString(baseColor, props.bgAlpha)
    // 边框颜色通常比文本浅一些，这里用 borderAlpha（默认 1）
    const borderColor = toRgbaString(baseColor, props.borderAlpha)

    return {
        color: textColor,
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        // 使样式更接近 element-plus plain：圆角、微小内边距（按需调整）
        borderRadius: '4px',
        padding: '0 6px',
        fontWeight: 500,
        cursor: 'default',
    }
})
</script>
