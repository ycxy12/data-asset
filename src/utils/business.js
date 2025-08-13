// 业务相关的js方法
import { dayjs } from 'element-plus'

//判断是否是最新 今天和昨天
export const checkTime = (creatTime) => {
    if (!creatTime) return false
    const input = dayjs(creatTime)
    const today = dayjs()
    const yesterday = today.subtract(1, 'day')
    return input.isSame(today, 'day') || input.isSame(yesterday, 'day')
}
