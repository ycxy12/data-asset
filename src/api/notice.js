import http from '@/utils/request';

/**
 * @name 通知管理 API
 * @description 通知相关的 API 接口
 */

// 通知 - 标记为已读
export function readNotification(id) {
    return http.post(`/api/notifications/${id}/read`);
}

// 通知 - 归档
export function archiveNotification(id) {
    return http.post(`/api/notifications/${id}/archive`);
}

// 通知 - 标记所有为已读
export function addReadNotifications() {
    return http.post('/api/notifications/read-all');
}

// 通知 - 批量标记为已读
export function batchReadNotifications(params) {
    return http.post('/api/notifications/batch-read', params);
}

// 通知 - 批量归档
export function batchArchiveNotifications(params) {
    return http.post('/api/notifications/batch-archive', params);
}

// 通知 - 获取未读数量
export function getUnreadCount() {
    return http.get('/api/notifications/unread-count');
}

// 通知 - 分页列表
export function getNotificationList(params) {
    return http.get('/api/notifications/list', params);
}
