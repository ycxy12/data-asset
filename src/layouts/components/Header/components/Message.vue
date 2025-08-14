<template>
    <div class="message">
        <el-badge :value="unreadCount">
            <el-icon @click="showDrawer"><Bell /></el-icon>
        </el-badge>
        <NoticeDrawer ref="noticeDrawerRef" @update="getUnreadCountFn" />
    </div>
</template>

<script setup>
import { h, computed, ref, useTemplateRef, onMounted, onBeforeUnmount } from 'vue'
import { readNotification, getUnreadCount } from '@/api/notice'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import NotificationClient from '@/utils/notification-client'
import { parseNotificationContent } from '@/utils/business'
import NoticeDrawer from '../../Drawer/noticeDrawer.vue'

const userStore = useUserStore()
const router = useRouter()

// 系统通知
const noticeDrawerInstance = useTemplateRef('noticeDrawerRef')

const notification = ref({})

// 获取未读消息数量
const unreadCount = ref(0)
const getUnreadCountFn = async () => {
    const { data } = await getUnreadCount()
    unreadCount.value = data
}

const handleFieldClick = async (info) => {
    const params = JSON.parse(info.param)
    await readNotification(info.id)
    await getUnreadCountFn()
    router.push({ path: `/field/platform/details`, query: { id: params.fieldId } })
    // notification.close(info.id)
    notification.value[info.id].close()
}

// 打开消息列表
const showDrawer = () => {
    noticeDrawerInstance.value.handleOpen()
}

// 响应式状态
let notificationClient = null

// 建立连接
const connect = () => {
    if (notificationClient) {
        notificationClient.disconnect()
    }

    notificationClient = new NotificationClient({
        baseUrl: import.meta.env.VITE_APP_SSE_URL,
        token: userStore.token,
        onConnected: (data) => {
            console.log('连接成功', `实例ID: ${data.instanceId || 'unknown'}`)
        },
        onNotification: (info) => {
            console.log('通知', info)
            notification.value[info.id] = ElNotification({
                title: info.title,
                dangerouslyUseHTMLString: true,
                message: parseNotificationContent(info, handleFieldClick),
                type: 'warning',
                duration: 10000,
            })
            getUnreadCountFn()
        },
        onNotificationGroup: (group) => {
            console.log('分组通知', `${group.title} - ${group.count}条通知`)
        },
        onNotificationSummary: (summary) => {
            console.log('通知汇总', summary.message)
        },
        onHeartbeat: () => {
            console.log('心跳')
        },
        onError: (error) => {
            console.log('连接错误', error)
        },
        onDisconnected: () => {
            console.log('断开连接', '与服务器的连接已断开')
        },
    })

    notificationClient.connect()
}

// 断开连接
const disconnect = () => {
    if (notificationClient) {
        notificationClient.disconnect()
        notificationClient = null
    }
}

onMounted(() => {
    connect()
    getUnreadCountFn()
})
onBeforeUnmount(() => {
    disconnect()
})
</script>

<style scoped lang="scss">
.message {
    padding: 5px;
    i {
        font-size: 18px;
    }
    &:hover {
        cursor: pointer;
        background-color: rgba(102, 152, 255, 0.1);
        i {
            color: #2072f5;
        }
    }
}
</style>
