import { getStandardFieldById } from '@/api/platform' //平台字段详情

export const getNameById = async (fullPath, name) => {
    const id = await getIdFromUrl(fullPath)

    if (!id) return
    switch (name) {
        case '平台字段详情':
            const { data } = await getStandardFieldById(id)
            return data.nameCn
        default:
            return ''
    }
}

const getIdFromUrl = async (url) => {
    // 分割URL获取查询参数部分
    const queryString = url.split('?')[1]
    if (!queryString) return null

    const urlParams = new URLSearchParams(queryString)
    return urlParams.get('id')
}
