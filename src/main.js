import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router' // vue Router
import pinia from '@/store' // pinia store
import SvgIcon from '@/components/SvgIcon/index.vue'
import '@/style/tailwind.css'
import '@/style/common.scss' // CSS通用样式表
import * as Icons from '@element-plus/icons-vue' // element icons

const app = createApp(App)
app.component('SvgIcon', SvgIcon)

// 注册 Element Icons 组件
Object.keys(Icons).forEach((key) => {
    app.component(key, Icons[key])
})

app.use(router).use(pinia).mount('#app')
