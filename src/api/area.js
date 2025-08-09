import http from '@/utils/request';

/**
 * @name 系统管理-领域管理 API
 * @description 领域管理相关的 API 接口
 */

// 领域管理 - 分页列表
export function listDomain(params) {
    return http.post('/api/sys/domain/page', params);
}

// 领域管理 - 新增
export function addDomain(params) {
    return http.post('/api/sys/domain/add', params);
}

// 领域管理 - 修改
export function updateDomain(params) {
    return http.post('/api/sys/domain/update', params);
}

// 领域管理 - 删除
export function deleteDomain({ id }) {
    return http.post(`/api/sys/domain/delete/${id}`);
}

// 领域管理 - 通过parentId获取子领域
export function getDomainByParentId(parentId) {
    return http.get(`/api/sys/domain/detail/${parentId}`);
}

// 领域管理 - tree
export function treeDomain() {
    return http.get('/api/sys/domain/tree');
}
