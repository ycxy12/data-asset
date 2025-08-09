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

export function transformMenuData(data) {
    // 工具函数：将中文或路径变成驼峰名称
    const toCamelCase = (str) => {
        if (!str) return ''
        return str
            .replace(/[/](\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
            .replace(/^\//, '')
            .replace(/^\w/, (c) => c.toLowerCase())
    }

    // 递归处理每个菜单项
    const transformItem = (item) => {
        const transformed = {
            path: item.path,
            name: toCamelCase(item.path),
            redirect: item.redirect || undefined,
            component: item.component ? '/' + item.component : undefined,
            meta: {
                icon: item.icon || '',
                title: item.name || '',
                isLink: '',
                isHide: !(item.meta?.isShow ?? true),
                isKeepAlive: !!item.meta?.closeable,
            },
        }

        // 处理 children 递归
        if (item.children && Array.isArray(item.children) && item.children.length) {
            transformed.children = item.children.map(transformItem)
        }

        return transformed
    }

    return data.map(transformItem)
}
