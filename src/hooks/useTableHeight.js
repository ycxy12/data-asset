import { computed } from 'vue'
import { useElementSize } from '@vueuse/core'

/**
 * 计算表格动态高度的 hook
 * @param {Object} options 配置选项
 * @param {Function} options.getSearchElement 获取搜索区域元素的函数
 * @param {number} options.offsetHeight 额外的偏移高度，默认 110px
 * @param {string} options.baseHeight 基础高度，默认 100vh
 * @returns {Object} { tableHeight }
 */
export function useTableHeight(options = {}) {
    // 110 + 32 + 128
    const { getSearchElement, offsetHeight = 270, baseHeight = '100vh' } = options

    // 获取搜索区域的响应式引用
    const searchRef = computed(() => {
        if (typeof getSearchElement === 'function') {
            return getSearchElement()?.$el
        }
        return getSearchElement
    })

    // 监听搜索区域高度变化
    const { height } = useElementSize(searchRef)

    // 计算表格高度
    const tableHeight = computed(() => {
        if (height.value === 0) {
            return `calc(${baseHeight} - ${offsetHeight}px)`
        }
        return `calc(${baseHeight} - ${offsetHeight}px - ${height.value}px)`
    })

    return { tableHeight }
}
