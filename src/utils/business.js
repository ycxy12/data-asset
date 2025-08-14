// 业务相关的js方法
import { dayjs } from 'element-plus'
import { h } from 'vue'

//判断是否是最新 今天和昨天
export const checkTime = (creatTime) => {
    if (!creatTime) return false
    const input = dayjs(creatTime)
    const today = dayjs()
    const yesterday = today.subtract(1, 'day')
    return input.isSame(today, 'day') || input.isSame(yesterday, 'day')
}

/**
 * 解析通知内容字符串，自动识别 [字段]，添加点击事件，返回 VNode。
 * @param {string} contentStr - 原始内容字符串，例如：'您关注的字段“[测试SSE]”发生了变更。'
 * @param {Function} onFieldClick - 点击字段时触发的回调，接收字段文本作为参数
 * @returns {VNode} 可直接用于 notification 的 description 字段
 */
export const parseNotificationContent = (info, onFieldClick) => {
    const nodes = []
    let contentStr = info.content

    let currentIndex = 0
    const regex = /\[([^\]]+)\]/g // 匹配 [字段名]

    let match
    while ((match = regex.exec(contentStr)) !== null) {
        const fieldText = match[1] // 获取 [测试SSE] 中的 测试SSE
        const matchStart = match.index
        const matchEnd = regex.lastIndex

        // 添加前面的普通文本
        if (matchStart > currentIndex) {
            nodes.push(contentStr.slice(currentIndex, matchStart))
        }

        // 添加可点击的字段部分
        nodes.push(h('span', { style: { color: '#e6a23c', cursor: 'pointer' }, onClick: () => onFieldClick(info) }, `【${fieldText}】`))
        currentIndex = matchEnd
    }

    // 添加剩余的文本
    if (currentIndex < contentStr.length) {
        nodes.push(contentStr.slice(currentIndex))
    }

    return h('div', { style: { color: 'rgba(0, 0, 0, 0.88)' } }, nodes)
}
