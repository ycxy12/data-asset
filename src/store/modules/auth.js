import { defineStore } from 'pinia'
import { listMenuApi } from '@/api/login'
import { getFlatMenuList, getShowMenuList, transformMenuData } from '@/utils'

export const useAuthStore = defineStore('mb-auth', {
    state: () => ({
        // 折叠菜单
        isCollapse: false,
        // 按钮权限列表
        authButtonList: [],
        // 菜单权限列表
        authMenuList: [],
        // 当前页面的 router name，用来做按钮权限筛选
        routeName: '',
        headerMenuList: [],
    }),
    getters: {
        // 按钮权限列表
        authButtonListGet: (state) => state.authButtonList,
        // 菜单权限列表 ==> 这里的菜单没有经过任何处理
        authMenuListGet: (state) => state.authMenuList,
        // 菜单权限列表 ==> 左侧菜单栏渲染，需要剔除 isHide == true
        showMenuListGet: (state) => getShowMenuList(state.authMenuList),
        // 菜单权限列表 ==> 扁平化之后的一维数组菜单，主要用来添加动态路由
        flatMenuListGet: (state) => getFlatMenuList(state.authMenuList),
    },
    actions: {
        // Get AuthMenuList
        async getAuthMenuList() {
            const { data } = await listMenuApi()
            const routes = [{ path: '/home', name: 'home', component: '/home/index', meta: { icon: 'unit', isAffix: true, isHide: false, title: '首页' } }, ...transformMenuData(data.routers[0].children)]
            this.authMenuList = routes
            this.headerMenuList = data.headerMenus
            this.authButtonList = data.permission
        },
        // Set RouteName
        async setRouteName(name) {
            this.routeName = name
        },
        setCollapse(collapse) {
            this.isCollapse = collapse
        },
    },
})
