/**
 * 通知客户端 - SSE连接管理
 * 用于建立和管理与服务器的SSE连接，接收实时通知
 *
 * @author system
 * @since 2025-01-21
 */
class NotificationClient {
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || '';
        this.subscribeUrl = `${this.baseUrl}/data-asset-api/api/notifications/subscribe`;
        this.token = options.token || 'abc'; // 设置默认的测试token为'abc'
        this.eventSource = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
        this.reconnectInterval = options.reconnectInterval || 3000;
        this.heartbeatTimeout = options.heartbeatTimeout || 60000;
        this.heartbeatTimer = null;

        // 事件回调
        this.onConnected = options.onConnected || (() => {});
        this.onNotification = options.onNotification || (() => {});
        this.onNotificationGroup = options.onNotificationGroup || (() => {});
        this.onNotificationSummary = options.onNotificationSummary || (() => {});
        this.onHeartbeat = options.onHeartbeat || (() => {});
        this.onError = options.onError || (() => {});
        this.onDisconnected = options.onDisconnected || (() => {});

        console.log('NotificationClient initialized');
    }

    /**
     * 建立SSE连接
     */
    connect() {
        if (this.eventSource && this.eventSource.readyState !== EventSource.CLOSED) {
            console.log('SSE connection already exists');
            return;
        }

        console.log('Connecting to SSE endpoint:', this.subscribeUrl);

        try {
            let url = this.subscribeUrl;
            if (this.token) {
                const separator = url.includes('?') ? '&' : '?';
                url += `${separator}authToken=${encodeURIComponent(this.token)}`;
            }

            this.eventSource = new EventSource(url);

            // 连接成功事件
            this.eventSource.addEventListener('connected', (event) => {
                console.log('SSE connected:', event.data);
                this.reconnectAttempts = 0;
                this.startHeartbeatMonitor();

                try {
                    const data = JSON.parse(event.data);
                    this.onConnected(data);
                } catch (e) {
                    console.warn('Failed to parse connected event data:', e);
                    this.onConnected({ message: 'Connected', timestamp: Date.now() });
                }
            });

            // 通知事件
            this.eventSource.addEventListener('notification', (event) => {
                console.log('Received notification:', event.data);
                this.resetHeartbeatMonitor();

                try {
                    const notification = JSON.parse(event.data);
                    this.onNotification(notification);
                } catch (e) {
                    console.error('Failed to parse notification:', e);
                }
            });

            // 分组通知事件
            this.eventSource.addEventListener('notification_group', (event) => {
                console.log('Received notification group:', event.data);
                this.resetHeartbeatMonitor();

                try {
                    const notificationGroup = JSON.parse(event.data);
                    this.onNotificationGroup(notificationGroup);
                } catch (e) {
                    console.error('Failed to parse notification group:', e);
                }
            });

            // 通知汇总事件
            this.eventSource.addEventListener('notification_summary', (event) => {
                console.log('Received notification summary:', event.data);
                this.resetHeartbeatMonitor();

                try {
                    const summary = JSON.parse(event.data);
                    this.onNotificationSummary(summary);
                } catch (e) {
                    console.error('Failed to parse notification summary:', e);
                }
            });

            // 心跳事件
            this.eventSource.addEventListener('heartbeat', (event) => {
                console.debug('Received heartbeat:', event.data);
                this.resetHeartbeatMonitor();

                try {
                    const heartbeat = JSON.parse(event.data);
                    this.onHeartbeat(heartbeat);
                } catch (e) {
                    console.warn('Failed to parse heartbeat:', e);
                }
            });

            // 连接错误事件
            this.eventSource.onerror = (event) => {
                console.error('SSE connection error:', event);
                this.stopHeartbeatMonitor();
                this.onError(event);

                if (this.eventSource.readyState === EventSource.CLOSED) {
                    console.log('SSE connection closed, attempting to reconnect...');
                    this.handleReconnect();
                }
            };
        } catch (error) {
            console.error('Failed to create SSE connection:', error);
            this.onError(error);
            this.handleReconnect();
        }
    }

    /**
     * 断开SSE连接
     */
    disconnect() {
        console.log('Disconnecting SSE connection');

        this.stopHeartbeatMonitor();

        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }

        this.reconnectAttempts = 0;
        this.onDisconnected();
    }

    /**
     * 处理重连逻辑
     */
    handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnect attempts reached, giving up');
            this.onError(new Error('Max reconnect attempts reached'));
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1); // 指数退避

        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(() => {
            if (this.eventSource && this.eventSource.readyState === EventSource.CLOSED) {
                this.connect();
            }
        }, delay);
    }

    /**
     * 启动心跳监控
     */
    startHeartbeatMonitor() {
        this.stopHeartbeatMonitor();

        this.heartbeatTimer = setTimeout(() => {
            console.warn('Heartbeat timeout, connection may be lost');
            this.onError(new Error('Heartbeat timeout'));

            // 尝试重新连接
            if (this.eventSource) {
                this.eventSource.close();
            }
        }, this.heartbeatTimeout);
    }

    /**
     * 重置心跳监控
     */
    resetHeartbeatMonitor() {
        this.startHeartbeatMonitor();
    }

    /**
     * 停止心跳监控
     */
    stopHeartbeatMonitor() {
        if (this.heartbeatTimer) {
            clearTimeout(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    /**
     * 获取连接状态
     */
    getConnectionState() {
        if (!this.eventSource) {
            return 'DISCONNECTED';
        }

        switch (this.eventSource.readyState) {
            case EventSource.CONNECTING:
                return 'CONNECTING';
            case EventSource.OPEN:
                return 'CONNECTED';
            case EventSource.CLOSED:
                return 'DISCONNECTED';
            default:
                return 'UNKNOWN';
        }
    }

    /**
     * 检查是否已连接
     */
    isConnected() {
        return this.eventSource && this.eventSource.readyState === EventSource.OPEN;
    }
}

export default NotificationClient;

// 使用示例
/*
const notificationClient = new NotificationClient({
    baseUrl: '', // 如果需要指定基础URL
    maxReconnectAttempts: 5,
    reconnectInterval: 3000,
    heartbeatTimeout: 60000,
    
    onConnected: (data) => {
        console.log('Connected to notification service:', data);
        showNotification('已连接到通知服务', 'success');
    },
    
    onNotification: (notification) => {
        console.log('New notification:', notification);
        showNotification(notification.title || '新通知', 'info', notification);
    },
    
    onNotificationGroup: (group) => {
        console.log('Notification group:', group);
        showNotification(`${group.title} (${group.count}条)`, 'info', group);
    },
    
    onNotificationSummary: (summary) => {
        console.log('Notification summary:', summary);
        showNotification(summary.message, 'info', summary);
    },
    
    onHeartbeat: (heartbeat) => {
        console.debug('Heartbeat received:', heartbeat);
    },
    
    onError: (error) => {
        console.error('Notification service error:', error);
        showNotification('通知服务连接异常', 'error');
    },
    
    onDisconnected: () => {
        console.log('Disconnected from notification service');
        showNotification('已断开通知服务连接', 'warning');
    }
});

// 启动连接
notificationClient.connect();

// 页面卸载时断开连接
window.addEventListener('beforeunload', () => {
    notificationClient.disconnect();
});
*/
