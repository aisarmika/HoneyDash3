// Dashboard Real-time Updates
class DashboardUpdates {
    static updateInterval = null;
    static wsConnection = null;
    static lastUpdate = null;

    static init() {
        // Initialize WebSocket connection
        this.initWebSocket();

        // Start periodic updates
        this.startPeriodicUpdates();

        // Listen for real-time events
        this.initEventListeners();
    }

    static initWebSocket() {
        // Only connect if not in public mode
        if (sessionStorage.getItem('hd_public') === 'true') {
            console.log('Public mode: WebSocket disabled');
            return;
        }

        try {
            // Use the API client's WebSocket connection
            this.wsConnection = HoneyDashAPI.connectWebSocket();

            if (this.wsConnection) {
                this.wsConnection.onopen = () => {
                    console.log('Real-time updates connected');
                    this.updateConnectionStatus(true);
                };

                this.wsConnection.onclose = () => {
                    console.log('Real-time updates disconnected');
                    this.updateConnectionStatus(false);
                    // Attempt reconnect after 5 seconds
                    setTimeout(() => this.initWebSocket(), 5000);
                };

                this.wsConnection.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    this.updateConnectionStatus(false);
                };
            }
        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
        }
    }

    static initEventListeners() {
        // Listen for custom events from API client
        window.addEventListener('new-attack', (e) => {
            this.handleNewAttack(e.detail);
        });

        window.addEventListener('new-alert', (e) => {
            this.handleNewAlert(e.detail);
        });

        window.addEventListener('honeypot-status', (e) => {
            this.updateHoneypotStatus(e.detail);
        });

        window.addEventListener('system-metrics', (e) => {
            this.updateSystemMetrics(e.detail);
        });

        // Listen for page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseUpdates();
            } else {
                this.resumeUpdates();
            }
        });
    }

    static startPeriodicUpdates() {
        clearInterval(this.updateInterval);
        this.updateInterval = null;

        const intervalEl = document.getElementById('refreshInterval');
        if (intervalEl) intervalEl.textContent = 'Off';

        this.performPeriodicUpdate();
    }

    static async performPeriodicUpdate() {
        try {
            console.log('Performing periodic update...');

            // Update dashboard stats
            await this.updateDashboardStats();

            // Update recent sessions
            await this.updateRecentSessions();

            // Update active alerts
            await this.updateActiveAlerts();

            // Update honeypot status
            await this.updateHoneypotStatus();

            this.lastUpdate = new Date();
            this.updateLastUpdatedTime();

        } catch (error) {
            console.error('Periodic update failed:', error);
        }
    }

    static async updateDashboardStats() {
        try {
            const stats = await HoneyDashAPI.getDashboardStats();
            this.updateStatsDisplay(stats);
        } catch (error) {
            console.error('Failed to update dashboard stats:', error);
        }
    }

    static updateStatsDisplay(stats) {
        // Update live attack count
        const liveAttackEl = document.getElementById('liveAttackCount');
        if (liveAttackEl) {
            liveAttackEl.textContent = stats.liveAttacks.toLocaleString();
        }

        // Update total attacks
        const totalAttackEl = document.querySelector('.stat-card:nth-child(1) .stat-value');
        if (totalAttackEl) {
            totalAttackEl.textContent = stats.totalAttacks.toLocaleString();
        }

        // Update unique attackers
        const attackerEl = document.querySelector('.stat-card:nth-child(2) .stat-value');
        if (attackerEl) {
            attackerEl.textContent = stats.uniqueAttackers.toLocaleString();
        }

        // Update countries
        const countriesEl = document.querySelector('.stat-card:nth-child(3) .stat-value');
        if (countriesEl) {
            countriesEl.textContent = stats.countries;
        }

        // Update response time
        const responseTimeEl = document.querySelector('.stat-card:nth-child(4) .stat-value');
        if (responseTimeEl) {
            responseTimeEl.textContent = `${stats.avgResponseTime}s`;
        }
    }

    static async updateRecentSessions() {
        try {
            const sessions = await HoneyDashAPI.getRecentSessions(10);

            // Only update if we're on the overview or sessions page
            const currentPage = document.querySelector('.nav-item.active')?.dataset.page;
            if (currentPage === 'overview' || currentPage === 'sessions') {
                DashboardData.sessions = sessions;

                if (currentPage === 'overview') {
                    this.updateOverviewSessions(sessions);
                } else if (currentPage === 'sessions') {
                    DashboardData.renderSessionsTable(sessions);
                }
            }
        } catch (error) {
            console.error('Failed to update recent sessions:', error);
        }
    }

    static updateOverviewSessions(sessions) {
        const tableBody = document.getElementById('sessionsTable');
        if (!tableBody) return;

        // Only update if the table exists (we're on overview page)
        const firstRow = tableBody.querySelector('tr');
        if (!firstRow) return;

        // Update the table with new sessions
        const newRows = sessions.slice(0, 8).map(session => `
            <tr>
                <td><span class="time-cell">${DashboardData.formatTime(session.timestamp)}</span></td>
                <td><code class="ip-cell">${session.source_ip}</code></td>
                <td>${session.type}</td>
                <td>${session.country || 'Unknown'}</td>
                <td><span class="severity-badge severity-${session.severity}">${session.severity.toUpperCase()}</span></td>
            </tr>
        `).join('');

        tableBody.innerHTML = newRows;
    }

    static async updateActiveAlerts() {
        try {
            const alerts = await HoneyDashAPI.getActiveAlerts();
            DashboardData.alerts = alerts;

            // Update alert panel if open
            const alertPanel = document.getElementById('alertPanel');
            if (alertPanel && alertPanel.classList.contains('active')) {
                DashboardData.renderAlerts(alerts);
            }

            // Update alert count
            const alertCountEl = document.querySelector('.alert-count');
            if (alertCountEl) {
                alertCountEl.textContent = alerts.length;
                alertCountEl.style.display = alerts.length > 0 ? 'flex' : 'none';
            }
        } catch (error) {
            console.error('Failed to update active alerts:', error);
        }
    }

    static async updateHoneypotStatus() {
        try {
            const status = await HoneyDashAPI.getHoneypotStatus();
            this.renderHoneypotStatus(status);
        } catch (error) {
            console.error('Failed to update honeypot status:', error);
        }
    }

    static renderHoneypotStatus(statusList) {
        const statusContainer = document.getElementById('honeypotStatusList');
        if (!statusContainer) return;

        statusContainer.innerHTML = statusList.map(honeypot => `
            <div class="status-item ${honeypot.status}">
                <span class="status-dot"></span>
                <span>${honeypot.name} (${honeypot.type})</span>
                <span class="status-count">${honeypot.sessions}</span>
            </div>
        `).join('');

        // Update honeypot count in nav
        const honeypotCountEl = document.getElementById('honeypotCount');
        if (honeypotCountEl) {
            const onlineCount = statusList.filter(h => h.status === 'online').length;
            honeypotCountEl.textContent = onlineCount;
        }
    }

    static handleNewAttack(attack) {
        console.log('New attack received:', attack);

        // Update live attack count
        const liveAttackEl = document.getElementById('liveAttackCount');
        if (liveAttackEl) {
            const current = parseInt(liveAttackEl.textContent.replace(/,/g, '')) || 0;
            liveAttackEl.textContent = (current + 1).toLocaleString();
        }

        // Show notification
        this.showAttackNotification(attack);

        // Update map if visible
        if (DashboardMap.map) {
            DashboardMap.updateMapData([attack]);
        }

        // Update timeline chart
        if (DashboardCharts.charts.timeline) {
            // Add data point to timeline
            const chart = DashboardCharts.charts.timeline;
            const now = new Date();
            const hour = now.getHours();
            const label = `${hour.toString().padStart(2, '0')}:00`;

            // Find or add label
            const labelIndex = chart.data.labels.indexOf(label);
            if (labelIndex !== -1) {
                chart.data.datasets[0].data[labelIndex]++;
            } else {
                chart.data.labels.push(label);
                chart.data.datasets[0].data.push(1);
            }

            chart.update();
        }
    }

    static handleNewAlert(alert) {
        console.log('New alert received:', alert);

        // Add to alerts list
        DashboardData.alerts.unshift(alert);

        // Update alert count
        this.updateAlertCount();

        // Show notification
        this.showAlertNotification(alert);

        // Play notification sound
        this.playNotificationSound();
    }

    static updateHoneypotStatus(status) {
        console.log('Honeypot status update:', status);

        // Update UI
        this.renderHoneypotStatus([status]);

        // Show notification for status changes
        if (status.previousStatus && status.previousStatus !== status.status) {
            this.showNotification(
                `${status.name} is now ${status.status}`,
                status.status === 'online' ? 'success' : 'warning'
            );
        }
    }

    static updateSystemMetrics(metrics) {
        console.log('System metrics update:', metrics);

        // Update system metrics display
        const metricsContainer = document.querySelector('.system-metrics');
        if (metricsContainer) {
            metrics.forEach((metric, index) => {
                const metricFill = metricsContainer.querySelectorAll('.metric-fill')[index];
                if (metricFill) {
                    metricFill.style.width = `${metric.value}%`;
                }

                const metricValue = metricsContainer.querySelectorAll('.metric-value')[index];
                if (metricValue) {
                    metricValue.textContent = `${metric.value}%`;
                }
            });
        }
    }

    static showAttackNotification(attack) {
        const notification = {
            type: attack.severity,
            message: `New ${attack.type} from ${attack.source_ip}`,
            time: 'Just now'
        };

        this.showNotification(notification.message, notification.type);

        // Add to alert panel if open
        const alertPanel = document.getElementById('alertPanel');
        if (alertPanel && alertPanel.classList.contains('active')) {
            const alertList = document.getElementById('alertList');
            if (alertList) {
                const alertItem = document.createElement('div');
                alertItem.className = `alert-item alert-${notification.type}`;
                alertItem.innerHTML = `
                    <div class="alert-icon">
                        <i class="fas fa-${DashboardData.getAlertIcon(notification.type)}"></i>
                    </div>
                    <div class="alert-content">
                        <div class="alert-message">${notification.message}</div>
                        <div class="alert-time">${notification.time}</div>
                    </div>
                `;
                alertList.prepend(alertItem);
            }
        }
    }

    static showAlertNotification(alert) {
        this.showNotification(alert.message, alert.severity);
    }

    static updateAlertCount() {
        const count = DashboardData.alerts.length;
        const countElement = document.querySelector('.alert-count');

        if (countElement) {
            countElement.textContent = count;
            countElement.style.display = count > 0 ? 'flex' : 'none';

            // Animate the bell icon
            const bellIcon = document.querySelector('.nav-alert i');
            bellIcon.style.transform = 'scale(1.2)';
            setTimeout(() => {
                bellIcon.style.transform = 'scale(1)';
            }, 300);
        }
    }

    static updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connectionStatus');
        if (!statusElement) return;

        if (connected) {
            statusElement.innerHTML = '<i class="fas fa-circle connected"></i> Connected';
            statusElement.style.color = '#56d364';
        } else {
            statusElement.innerHTML = '<i class="fas fa-circle disconnected"></i> Disconnected';
            statusElement.style.color = '#f85149';
        }
    }

    static updateLastUpdatedTime() {
        const timeElement = document.getElementById('lastUpdated');
        if (timeElement && this.lastUpdate) {
            const timeString = this.lastUpdate.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            timeElement.textContent = timeString;
        }
    }

    static playNotificationSound() {
        // Create audio context for notification sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);

        } catch (error) {
            console.log('Audio context not supported:', error);
        }
    }

    static showNotification(message, type = 'info') {
        DashboardManager.showNotification(message, type);
    }

    static pauseUpdates() {
        console.log('Pausing updates (page hidden)');

        // Clear update interval
        clearInterval(this.updateInterval);

        // Close WebSocket connection
        if (this.wsConnection) {
            this.wsConnection.close();
            this.wsConnection = null;
        }
    }

    static resumeUpdates() {
        console.log('Resuming updates (page visible)');

        // Restart updates
        this.startPeriodicUpdates();
        this.initWebSocket();
    }

    static destroy() {
        // Cleanup
        clearInterval(this.updateInterval);

        if (this.wsConnection) {
            this.wsConnection.close();
            this.wsConnection = null;
        }
    }
}

// Auto-refresh configuration
const AUTO_REFRESH_MS = 30000; // keep existing interval value if needed
// Set to false to stop automatic refreshing by default
const AUTO_REFRESH_ENABLED = false;

let _refreshTimer = null;

function startAutoRefresh() {
    // Guard: don't start if auto-refresh is disabled
    if (!AUTO_REFRESH_ENABLED) {
        console.info('Auto-refresh is disabled');
        return;
    }

    // Prevent multiple timers
    if (_refreshTimer) return;

    _refreshTimer = setInterval(() => {
        // ...existing code that performs the refresh...
        // e.g. refreshDashboard(), DashboardData.initSessionsTable(), DashboardCharts.loadTimelineData('24h'), etc.
        /* ...existing refresh invocation... */
    }, AUTO_REFRESH_MS);
}

function stopAutoRefresh() {
    if (_refreshTimer) {
        clearInterval(_refreshTimer);
        _refreshTimer = null;
    }
}

// Ensure UI shows current state
(function updateAutoRefreshUI() {
    const el = document.getElementById('refreshInterval');
    if (!el) return;
    el.textContent = AUTO_REFRESH_ENABLED ? `${AUTO_REFRESH_MS / 1000}s` : 'Disabled';
})();

// If the original file called startAutoRefresh() unconditionally, locate that call and replace with the guarded call.
// Example replacement (near existing init/bootstrap code):
// startAutoRefresh();   <-- replace with:
startAutoRefresh();