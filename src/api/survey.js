import http from '@/utils/request';

// 菜单管理 - 列表
export function getSystemMenuApi(params) {
    return http.post('/api/sys/menu/list', params);
}

// 菜单管理 - 新增
export function addSystemMenuApi(param) {
    return http.post('/api/sys/menu/add', param);
}

// 菜单管理 - 编辑
export function updateSystemMenuApi(param) {
    return http.post('/api/sys/menu/update', param);
}

// 菜单管理 - 删除
export function deleteSystemMenuApi({ id }) {
    return http.get(`/api/sys/menu/delete/${id}`);
}

// 菜单管理 - 详情
export function detailSystemMenuApi(id) {
    return http.get(`/api/sys/menu/${id}`);
}
