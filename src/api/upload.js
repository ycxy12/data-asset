import http from '@/utils/request';

/**
 * @name 通用上传 API
 * @description 通用上传相关的 API 接口
 */

// 通用上传 - 上传
export function uploadFile(params) {
    return http.post('/api/v1/upload/file', params);
}

// 通用上传 - 上传
export function uploadText(params) {
    return http.post('/api/v1/upload/text', params);
}

// 通用上传 - 获取单个上传地址
export function getFileUrl(params) {
    return http.get('/api/v1/upload/signed-url', params);
}

// 通用上传 - 删除上传文件
export function deleteFile(params) {
    return http.delete('/api/v1/upload', params);
}
