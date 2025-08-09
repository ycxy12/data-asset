<template>
    <div class="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/store/modules/user';
import { codeLoginApi } from '@/api/login';

// 获取路由
const route = useRoute();
const router = useRouter();

// pinia store
const userStore = useUserStore();

// 创建生命周期
onMounted(() => {
    router.options.routes = [];
    const code = route.query.code;
    if (code) {
        unityAuthLogin(code);
    } else {
        redirectToUnityLogin();
    }
});

function saveLoginData(data) {
    userStore.setToken(data.accessToken);
    userStore.setExpireTime(data.expireTime);
    userStore.setUserInfo(data.userInfo);
    // accountStore.setRoles(data.roles);
}

function unityAuthLogin(code) {
    codeLoginApi(code).then((r) => {
        const data = r.data;
        saveLoginData(data);
        router.push({ path: '/', query: { key: route.query.key } });
    });
}

// 跳转到统一登录平台登录
function redirectToUnityLogin() {
    const query = {
        domain: import.meta.env.VITE_APP_SSO_URL,
        scope: 'all',
        response_type: 'code',
        redirect_uri: encodeURIComponent(window.location.href),
        state: 'all',
        client_id: 'data-asset',
    };

    const location = `${query.domain}?scope=${query.scope}&response_type=${query.response_type}&redirect_uri=${query.redirect_uri}&state=${query.state}&client_id=${query.client_id}`;
    window.location = location;
}
</script>
