import { ElMessage } from 'element-plus'

/**
 * @description: 校验网络请求状态码
 * @param {Number} status
 * @return void
 */
export const checkStatus = (status) => {
    switch (status) {
        case 400:
            ElMessage.error('请求错误！请您稍后重试')
            break
        case 401:
            location.reload()
            break
        case 403:
            ElMessage.error('当前账号无权限访问！')
            break
        case 404:
            ElMessage.error('你所访问的资源不存在！')
            break
        case 405:
            ElMessage.error('请求方式错误！请您稍后重试')
            break
        case 500:
            ElMessage.error('服务器内部错误！')
            break
        case 502:
            ElMessage.error('网关错误！')
            break
        default:
            ElMessage.error('请求失败！')
    }
}
