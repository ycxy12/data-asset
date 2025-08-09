import http from '@/utils/request';

// 登录
export function codeLoginApi(code) {
    return http.get(`/auth/${code}?redirectUrl=`);
}

// 登出
export function logoutApi() {
    return http.get('/api/login/out');
}

// 获取菜单
export function listMenuApi() {
    return http.get('/api/sys/menu/select/router');
}
