/**
 * @description 获取localStorage
 * @param {String} key Storage名称
 * @returns {String}
 */
export function localGet(key) {
    const value = window.localStorage.getItem(key)
    try {
        return JSON.parse(window.localStorage.getItem(key))
    } catch (error) {
        return value
    }
}

/**
 * @description 存储localStorage
 * @param {String} key Storage名称
 * @param {*} value Storage值
 * @returns {void}
 */
export function localSet(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value))
}

/**
 * @description 清除localStorage
 * @param {String} key Storage名称
 * @returns {void}
 */
export function localRemove(key) {
    window.localStorage.removeItem(key)
}

/**
 * @description 清除所有localStorage
 * @returns {void}
 */
export function localClear() {
    window.localStorage.clear()
}

/**
 * @description 使用递归扁平化菜单，方便添加动态路由
 * @param {Array} menuList 菜单列表
 * @returns {Array}
 */
export function getFlatMenuList(menuList) {
    let newMenuList = JSON.parse(JSON.stringify(menuList))
    return newMenuList.flatMap((item) => [item, ...(item.children ? getFlatMenuList(item.children) : [])])
}

/**
 * @description 使用递归过滤出需要渲染在左侧菜单的列表 (需剔除 isHide == true 的菜单)
 * @param {Array} menuList 菜单列表
 * @returns {Array}
 * */
export function getShowMenuList(menuList) {
    let newMenuList = JSON.parse(JSON.stringify(menuList))
    return newMenuList.filter((item) => {
        item.children?.length && (item.children = getShowMenuList(item.children))
        return !item.meta?.isHide
    })
}

/**
 * @description 获取不同路由模式所对应的 url + params
 * @returns {String}
 */
export function getUrlWithParams() {
    const url = {
        hash: location.hash.substring(1),
        history: location.pathname + location.search,
    }
    return url[mode]
}

/**
 * @description 处理后端返回的路由数据，增加 parentPath 记录
 * @param {Array} data 路由数据
 * @returns {String}
 */
export function transformMenuData(data) {
    // 工具函数：将中文或路径变成驼峰名称
    const toCamelCase = (str) => {
        if (!str) return ''
        return str
            .replace(/\/([\u4e00-\u9fa5\w])/g, (_, c) => (c ? c.toUpperCase() : ''))
            .replace(/^\//, '')
            .replace(/^\w/, (c) => c.toLowerCase())
    }

    // 递归处理每个菜单项，增加 parentPath 记录
    const transformItem = (item, parentPath = '') => {
        const isHide = item.meta?.isShow === false

        const transformed = {
            path: item.path || '',
            name: item.nameKey || toCamelCase(item.path),
            redirect: item.redirect || undefined,
            component: item.component ? '/' + item.component.replace(/^\//, '') : undefined,
            meta: {
                icon: item.icon || '',
                title: item.name || '',
                isLink: '',
                isHide,
                isKeepAlive: !item.meta?.closeable,
                // 如果当前项隐藏，则设置 activeMenu 为父级 path
                ...(isHide && parentPath ? { activeMenu: parentPath } : {}),
            },
        }

        if (Array.isArray(item.children) && item.children.length) {
            transformed.children = item.children.map((child) => transformItem(child, transformed.path))
        }

        return transformed
    }

    return Array.isArray(data) ? data.map((item) => transformItem(item)) : []
}
