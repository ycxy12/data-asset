import http from '@/utils/request';

/**
 * @name 字段标准-平台字段 API
 * @description 平台字段相关的 API 接口
 */

// 平台字段 - 分页列表
export function listStandardField(params) {
    return http.post('/api/v1/standard-field/page', params);
}

// 平台字段 - 新增
export function addStandardField(params) {
    return http.post('/api/v1/standard-field/create', params);
}

// 平台字段 - 修改
export function updateStandardField(params) {
    return http.post('/api/v1/standard-field/update', params);
}

// 平台字段 - 删除
export function deleteStandardField(params) {
    return http.post(`/api/v1/standard-field/delete`, params);
}

// 平台字段 - 详情
export function getStandardFieldById(id) {
    return http.get(`/api/v1/standard-field/detail/${id}`);
}

// 平台字段 - 订阅/取消订阅标准字段
export function subscribeStandardField(params) {
    return http.post('/api/v1/standard-field/subscribe', params);
}

// 平台字段 - 分页查询标准字段变更日志
export function logStandardField(params) {
    return http.post('/api/v1/standard-field/log/page', params);
}

/*********************************** 字段调用信息 *****************************************/

// 字段调用信息 - 分页列表
export function listCallingField({ id }) {
    return http.get(`/api/v1/standard-field/calling/${id}`);
}

// 字段调用信息 - 新增
export function addCallingField(params) {
    return http.post('/api/v1/standard-field/calling/add', params);
}

// 字段调用信息 - 修改
export function updateCallingField(params) {
    return http.post('/api/v1/standard-field/calling/update', params);
}

// 字段调用信息 - 删除
export function deleteCallingField({ id }) {
    return http.delete(`/api/v1/standard-field/calling/delete/${id}`);
}

/*********************************** 字段关联映射 *****************************************/

// 字段关联映射 - 分页列表
export function listMappingField({ id }) {
    return http.get(`/api/v1/standard-field/mapping/${id}`);
}

// 字段关联映射 - 新增
export function addMappingField(params) {
    return http.post('/api/v1/standard-field/mapping/add', params);
}

// 字段关联映射 - 修改
export function updateMappingField(params) {
    return http.post('/api/v1/standard-field/mapping/update', params);
}

// 字段关联映射 - 删除
export function deleteMappingField({ id }) {
    return http.delete(`/api/v1/standard-field/mapping/delete/${id}`);
}
