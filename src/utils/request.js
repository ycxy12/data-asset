import axios from 'axios'
import { checkStatus } from './checkStatus'
import router from '@/router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { dayjs } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { localClear } from '@/utils'

const config = {
    // 默认地址请求地址
    baseURL: import.meta.env.VITE_APP_API_BASE_URL,
    // 设置超时时间
    timeout: 30000,
    // 跨域时候允许携带凭证
    withCredentials: true,
}

class RequestHttp {
    constructor(config) {
        // 创建axios实例
        this.service = axios.create(config)

        /**
         * @description 请求拦截器
         * 客户端发送请求 -> [请求拦截器] -> 服务器
         * token校验(JWT) : 接受服务器返回的 token,存储到 vuex/pinia/本地储存当中
         */
        this.service.interceptors.request.use(
            (config) => {
                const userStore = useUserStore()

                const now = dayjs().valueOf()
                // 让token早10秒种过期，提升“请重新登录”弹窗体验
                if (now - userStore.expireTime * 1000 >= -10) {
                    ElMessageBox.alert('很抱歉，登录已过期，请重新登录', '登录已过期', {
                        confirmButtonText: '重新登录',
                        callback: () => {
                            localClear()
                            location.reload()
                        },
                    })
                }

                // 当前请求不需要显示 loading，在 api 服务中通过指定的第三个参数: { noLoading: true } 来控制
                // config.noLoading || showFullScreenLoading();
                if (config.headers && typeof config.headers.set === 'function') {
                    config.headers.set('Authorization', 'Bearer ' + userStore.token)
                }
                return config
            },
            (error) => {
                return Promise.reject(error)
            },
        )

        /**
         * @description 响应拦截器
         *  服务器换返回信息 -> [拦截统一处理] -> 客户端JS获取到信息
         */
        this.service.interceptors.response.use(
            (response) => {
                const { data } = response
                // const userStore = useUserStore();
                // tryHideFullScreenLoading();
                // 全局错误信息拦截（防止下载文件的时候返回数据流，没有 code 直接报错）
                if (data.code && data.code !== 200) {
                    ElMessage.error(data.msg || '请求失败，请稍后重试')
                    return Promise.reject(data)
                }
                // 成功请求（在页面上除非特殊情况，否则不用处理失败逻辑）
                return data
            },
            async (error) => {
                const { response } = error
                // tryHideFullScreenLoading();
                // 请求超时 && 网络错误单独判断，没有 response
                if (error.message.indexOf('timeout') !== -1) ElMessage.error('请求超时！请您稍后重试')
                if (error.message.indexOf('Network Error') !== -1) ElMessage.error('网络错误！请您稍后重试')
                // 根据服务器响应的错误状态码，做不同的处理
                if (response) checkStatus(response.status)
                // 服务器结果都没有返回(可能服务器错误可能客户端断网)，断网处理:可以跳转到断网页面
                if (!window.navigator.onLine) router.replace('/500')
                return Promise.reject(error)
            },
        )
    }

    /**
     * @description 常用请求方法封装
     */
    get(url, params, _object = {}) {
        return this.service.get(url, { params, ..._object })
    }
    post(url, params, _object = {}) {
        return this.service.post(url, params, _object)
    }
    put(url, params, _object = {}) {
        return this.service.put(url, params, _object)
    }
    delete(url, params, _object = {}) {
        return this.service.delete(url, { params, ..._object })
    }
    download(url, params, _object = {}) {
        return this.service.post(url, params, { ..._object, responseType: 'blob' })
    }
}

export default new RequestHttp(config)
