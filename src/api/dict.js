import http from '@/utils/request';

/**
 * @name 系统关联-字典管理 API
 * @description 平台字段相关的 API 接口
 */

// 字典类型 - 分页列表
export function listDictType(params) {
    return http.post('/api/dict/types/page', params);
}

// 字典类型 - 新增
export function addDictType(params) {
    return http.post('/api/dict/types/create', params);
}

// 字典类型 - 修改
export function updateDictType(params) {
    return http.post('/api/dict/types/update', params);
}

// 字典类型 - 删除
export function deleteDictType({ id }) {
    return http.delete(`/api/dict/types/${id}`);
}

// 字典类型 - 根据字典类型标识查询字典数据
export function getDictByType({ dictType }) {
    return http.get(`/api/dict/data/${dictType}`);
}
export function getDict(dictType) {
    return http.get(`/api/dict/data/${dictType}`);
}

// 字典类型 - 根据字典名称查询字典数据
export function getDictByFieldName(fieldName) {
    return http.get(`/api/dict/dataByFieldName/${fieldName}`);
}

// 字典 - 分页列表
export function listDict(params) {
    return http.post('/api/dict/data/page', params);
}

// 字典 - 新增
export function addDict(params) {
    return http.post('/api/dict/data/create', params);
}

// 字典 - 修改
export function updateDict(params) {
    return http.post('/api/dict/data/update', params);
}

// 字典 - 删除
export function deleteDict({ id }) {
    return http.delete(`/api/dict/data/${id}`);
}

// 字典 - 详情
export function getDictById({ id }) {
    return http.get(`/api/dict/data/detail/${id}`);
}
