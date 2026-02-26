// Main Dashboard Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem('hd_authenticated');
    const isPublic = sessionStorage.getItem('hd_public');
    const user = sessionStorage.getItem('hd_user') || 'Guest';
    const role = sessionStorage.getItem('hd_role') || 'Viewer';

    if (!isAuthenticated && !isPublic) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize Dashboard
    DashboardManager.init();
});

class DashboardManager {
    static init() {
        // Set user info
        this.setUserInfo();

        // Initialize components
        this.initTime();
        this.initNavigation();
        this.initSidebar();
        this.initAlerts();
        this.initEventListeners();

        // Load initial data
        this.loadOverview();

        // Start updates
        if (typeof AUTO_REFRESH_ENABLED !== 'undefined' && AUTO_REFRESH_ENABLED) {
            this.startAutoRefresh();
        } else {
            console.info('Dashboard auto-refresh is disabled (AUTO_REFRESH_ENABLED=false)');
        }

        console.log('%c🚀 HoneyDash Dashboard Initialized', 'color: #56d364; font-size: 16px; font-weight: bold;');
    }

    static setUserInfo() {
        const user = sessionStorage.getItem('hd_user') || 'Guest';
        const role = sessionStorage.getItem('hd_role') || 'Viewer';

        document.getElementById('userDisplay').textContent = user;
        document.getElementById('roleDisplay').textContent = role;

        // Update avatar based on role
        const avatarIcon = document.querySelector('.user-avatar i');
        if (role === 'admin') {
            avatarIcon.className = 'fas fa-user-shield';
        } else if (role === 'analyst') {
            avatarIcon.className = 'fas fa-user-secret';
        } else {
            avatarIcon.className = 'fas fa-user';
        }
    }

    static initTime() {
        function updateTime() {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            const timeElement = document.getElementById('currentTime');
            const lastUpdatedElement = document.getElementById('lastUpdated');

            if (timeElement) timeElement.textContent = timeString + ' UTC';
            if (lastUpdatedElement) lastUpdatedElement.textContent = timeString;
        }

        updateTime();
        setInterval(updateTime, 1000);
    }

    static initNavigation() {
        const navItems = document.querySelectorAll('.nav-item[data-page]');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();

                // Remove active class from all items
                navItems.forEach(nav => nav.classList.remove('active'));

                // Add active class to clicked item
                item.classList.add('active');

                // Load the page
                const page = item.dataset.page;
                this.loadPage(page);

                // Close mobile sidebar if open
                this.closeMobileSidebar();
            });
        });
    }

    static initSidebar() {
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = document.getElementById('mobileMenuToggle');
        const closeBtn = document.getElementById('sidebarClose');
        const collapseBtn = document.getElementById('sidebarCollapse');

        if (!sidebar || !toggleBtn) return;

        // Mobile toggle
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('sidebar-active');
        });

        // Close button
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                sidebar.classList.remove('sidebar-active');
            });
        }

        // Collapse button
        if (collapseBtn) {
            collapseBtn.addEventListener('click', () => {
                sidebar.classList.toggle('sidebar-collapsed');
                const icon = collapseBtn.querySelector('i');
                if (sidebar.classList.contains('sidebar-collapsed')) {
                    icon.className = 'fas fa-chevron-right';
                } else {
                    icon.className = 'fas fa-chevron-left';
                }
            });
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 992 &&
                sidebar &&
                !sidebar.contains(e.target) &&
                toggleBtn && !toggleBtn.contains(e.target) &&
                sidebar.classList.contains('sidebar-active')) {
                sidebar.classList.remove('sidebar-active');
            }
        });
    }

    static initAlerts() {
        const alertButton = document.getElementById('alertButton');
        const alertPanel = document.getElementById('alertPanel');
        const closeAlertPanel = document.getElementById('closeAlertPanel');

        if (!alertButton || !alertPanel) return;

        alertButton.addEventListener('click', () => {
            alertPanel.classList.toggle('active');
        });

        if (closeAlertPanel) {
            closeAlertPanel.addEventListener('click', () => {
                alertPanel.classList.remove('active');
            });
        }

        // Close alert panel when clicking outside
        document.addEventListener('click', (e) => {
            if (alertPanel && !alertPanel.contains(e.target) &&
                alertButton && !alertButton.contains(e.target) &&
                alertPanel.classList.contains('active')) {
                alertPanel.classList.remove('active');
            }
        });
    }

    static initEventListeners() {
        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshData();
            });
        }

        // Fullscreen button
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }

        // Auto-refresh interval change
        const refreshInterval = document.getElementById('refreshInterval');
        if (refreshInterval) {
            refreshInterval.addEventListener('click', () => {
                this.changeRefreshInterval();
            });
        }
    }

    static async loadOverview() {
        const mainContent = document.getElementById('pageContent');
        if (!mainContent) return;

        // Show loading state
        mainContent.innerHTML = `
            <div class="loading-overlay" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                <div class="loading-spinner" style="display: inline-block; width: 40px; height: 40px; border: 3px solid rgba(31, 111, 235, 0.3); border-radius: 50%; border-top-color: var(--accent-blue); animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 1rem;">Loading dashboard...</p>
            </div>
        `;

        try {
            // Load sample data (in real app, use API)
            const stats = {
                totalAttacks: 8451,
                uniqueAttackers: 2187,
                countries: 68,
                avgResponseTime: 1.2,
                attackTrend: 12,
                attackerTrend: 8,
                countriesChange: 0,
                responseTimeChange: -0.3
            };

            const sessions = [
                { time: '14:45:23', ip: '192.168.1.105', type: 'SSH Brute Force', country: 'USA', severity: 'high', id: '1' },
                { time: '14:42:11', ip: '10.0.0.45', type: 'Port Scan', country: 'Germany', severity: 'medium', id: '2' },
                { time: '14:38:05', ip: '203.0.113.25', type: 'Malware Download', country: 'China', severity: 'critical', id: '3' },
                { time: '14:35:52', ip: '172.16.0.22', type: 'SQL Injection', country: 'Russia', severity: 'high', id: '4' },
                { time: '14:32:18', ip: '198.51.100.10', type: 'DDoS Probe', country: 'Brazil', severity: 'medium', id: '5' }
            ];

            const threats = [
                { name: 'Mirai Botnet', severity: 'critical', count: 145, trend: 'increasing' },
                { name: 'Cobalt Strike', severity: 'high', count: 87, trend: 'stable' },
                { name: 'Metasploit', severity: 'medium', count: 42, trend: 'decreasing' },
                { name: 'Shodan Scans', severity: 'low', count: 215, trend: 'increasing' }
            ];

            const metrics = [
                { label: 'CPU Usage', value: 65 },
                { label: 'Memory', value: 42 },
                { label: 'Storage', value: 78 },
                { label: 'Network I/O', value: 31 }
            ];

            // Update honeypot status
            const honeypots = [
                { name: 'Cowrie (SSH)', status: 'online', sessions: 842 },
                { name: 'Dionaea (Malware)', status: 'online', sessions: 312 },
                { name: 'ElasticPot (ES)', status: 'warning', sessions: 93 }
            ];

            this.renderHoneypotStatus(honeypots);

            // Render the overview page
            mainContent.innerHTML = this.createOverviewHTML(stats, sessions, threats, metrics);

            // Initialize charts and map
            setTimeout(() => {
                this.initializePageComponents('overview');
            }, 100);

        } catch (error) {
            console.error('Error loading overview:', error);
            mainContent.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-exclamation-circle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">Error Loading Content</h3>
                    <p>${error.message}</p>
                    <button onclick="DashboardManager.loadOverview()" style="background: var(--accent-blue); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; margin-top: 1rem;">
                        <i class="fas fa-redo"></i>
                        <span>Retry</span>
                    </button>
                </div>
            `;
        }
    }

    static createOverviewHTML(stats, sessions, threats, metrics) {
        return `
            <!-- Quick Stats Row -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-header">
                        <h4>Total Attacks</h4>
                        <i class="fas fa-broadcast-tower"></i>
                    </div>
                    <div class="stat-value">${stats.totalAttacks.toLocaleString()}</div>
                    <div class="stat-trend ${stats.attackTrend >= 0 ? 'positive' : 'negative'}">
                        <i class="fas fa-arrow-${stats.attackTrend >= 0 ? 'up' : 'down'}"></i>
                        <span>${Math.abs(stats.attackTrend)}% from yesterday</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <h4>Unique Attackers</h4>
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-value">${stats.uniqueAttackers.toLocaleString()}</div>
                    <div class="stat-trend ${stats.attackerTrend >= 0 ? 'positive' : 'negative'}">
                        <i class="fas fa-arrow-${stats.attackerTrend >= 0 ? 'up' : 'down'}"></i>
                        <span>${Math.abs(stats.attackerTrend)}% from yesterday</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <h4>Countries</h4>
                        <i class="fas fa-globe-americas"></i>
                    </div>
                    <div class="stat-value">${stats.countries}</div>
                    <div class="stat-trend">
                        <i class="fas fa-minus"></i>
                        <span>${stats.countriesChange === 0 ? 'No change' :
                stats.countriesChange > 0 ? `+${stats.countriesChange} new` :
                    `${Math.abs(stats.countriesChange)} fewer`}</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <h4>Avg Response Time</h4>
                        <i class="fas fa-stopwatch"></i>
                    </div>
                    <div class="stat-value">${stats.avgResponseTime}s</div>
                    <div class="stat-trend ${stats.responseTimeChange < 0 ? 'positive' : 'negative'}">
                        <i class="fas fa-arrow-${stats.responseTimeChange < 0 ? 'up' : 'down'}"></i>
                        <span>${Math.abs(stats.responseTimeChange)}s ${stats.responseTimeChange < 0 ? 'improvement' : 'increase'}</span>
                    </div>
                </div>
            </div>

            <!-- Charts Row -->
            <div class="charts-row">
                <div class="chart-container">
                    <div class="chart-header">
                        <h4><i class="fas fa-chart-line"></i> Attack Timeline (24h)</h4>
                        <div class="chart-controls">
                            <button class="time-btn active" data-range="24h">24H</button>
                            <button class="time-btn" data-range="7d">7D</button>
                            <button class="time-btn" data-range="30d">30D</button>
                        </div>
                    </div>
                    <div class="chart-wrapper">
                        <canvas id="timelineChart"></canvas>
                    </div>
                </div>

                <div class="chart-container">
                    <div class="chart-header">
                        <h4><i class="fas fa-chart-pie"></i> Attack Types</h4>
                    </div>
                    <div class="chart-wrapper">
                        <canvas id="attackTypeChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Map & Sessions Row -->
            <div class="data-row">
                <div class="map-container">
                    <div class="map-header">
                        <h4><i class="fas fa-map"></i> Attack Origins</h4>
                        <div class="map-legend">
                            <span class="legend-item"><span class="legend-dot high"></span> High</span>
                            <span class="legend-item"><span class="legend-dot medium"></span> Medium</span>
                            <span class="legend-item"><span class="legend-dot low"></span> Low</span>
                        </div>
                    </div>
                    <div class="map-wrapper">
                        <div id="attackMap" style="width: 100%; height: 100%; border-radius: 6px;"></div>
                    </div>
                </div>

                <div class="sessions-container">
                    <div class="sessions-header">
                        <h4><i class="fas fa-list"></i> Recent Attack Sessions</h4>
                        <a href="#" class="view-all" data-page="sessions">View All →</a>
                    </div>
                    <div class="sessions-table-container">
                        <table class="sessions-table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Source IP</th>
                                    <th>Type</th>
                                    <th>Country</th>
                                    <th>Severity</th>
                                </tr>
                            </thead>
                            <tbody id="sessionsTable">
                                ${sessions.map(session => `
                                    <tr>
                                        <td><span class="time-cell">${session.time}</span></td>
                                        <td><code class="ip-cell">${session.ip}</code></td>
                                        <td>${session.type}</td>
                                        <td>${session.country}</td>
                                        <td><span class="severity-badge severity-${session.severity}">${session.severity.toUpperCase()}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Bottom Row -->
            <div class="bottom-row">
                <div class="threat-card">
                    <div class="threat-header">
                        <h4><i class="fas fa-exclamation-triangle"></i> Top Threats</h4>
                    </div>
                    <div class="threat-list" id="threatList">
                        ${threats.map(threat => `
                            <div class="threat-item">
                                <div class="threat-info">
                                    <div class="threat-name">${threat.name}</div>
                                    <div class="threat-meta">
                                        <span class="threat-count">${threat.count} incidents</span>
                                        <span class="threat-trend trend-${threat.trend}">
                                            <i class="fas fa-arrow-${threat.trend === 'increasing' ? 'up' : threat.trend === 'decreasing' ? 'down' : 'right'}"></i>
                                            ${threat.trend}
                                        </span>
                                    </div>
                                </div>
                                <div class="threat-severity severity-${threat.severity}">
                                    ${threat.severity.toUpperCase()}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="system-card">
                    <div class="system-header">
                        <h4><i class="fas fa-server"></i> System Metrics</h4>
                    </div>
                    <div class="system-metrics">
                        ${metrics.map(metric => `
                            <div class="metric">
                                <span class="metric-label">${metric.label}</span>
                                <div class="metric-bar">
                                    <div class="metric-fill" style="width: ${metric.value}%"></div>
                                </div>
                                <span class="metric-value">${metric.value}%</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    static renderHoneypotStatus(honeypots) {
        const statusContainer = document.getElementById('honeypotStatusList');
        if (!statusContainer) return;

        statusContainer.innerHTML = honeypots.map(honeypot => `
            <div class="status-item ${honeypot.status}">
                <span class="status-dot"></span>
                <span>${honeypot.name}</span>
                <span class="status-count">${honeypot.sessions}</span>
            </div>
        `).join('');
    }

    static initializePageComponents(page) {
        switch (page) {
            case 'overview':
                DashboardCharts.initTimelineChart();
                DashboardCharts.initAttackTypeChart();
                DashboardMap.init();
                break;
            case 'attack-map':
                DashboardMap.initFullScreen();
                break;
        }
    }

    static async loadPage(page) {
        const mainContent = document.getElementById('pageContent');
        if (!mainContent) return;

        // Show loading state
        mainContent.innerHTML = `
            <div class="loading-overlay" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                <div class="loading-spinner" style="display: inline-block; width: 40px; height: 40px; border: 3px solid rgba(31, 111, 235, 0.3); border-radius: 50%; border-top-color: var(--accent-blue); animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 1rem;">Loading ${page}...</p>
            </div>
        `;

        try {
            switch (page) {
                case 'overview':
                    await this.loadOverview();
                    break;
                case 'attack-map':
                    await this.loadAttackMap();
                    break;
                case 'analytics':
                    await this.loadAnalytics();
                    break;
                case 'sessions':
                    await this.loadSessions();
                    break;
                case 'threat-intel':
                    await this.loadThreatIntel();
                    break;
                case 'configuration':
                    await this.loadConfiguration();
                    break;
                case 'log-explorer':
                    await this.loadLogExplorer();
                    break;
                case 'documentation':
                    await this.loadDocumentation();
                    break;
                default:
                    await this.loadOverview();
            }
        } catch (error) {
            console.error(`Error loading ${page}:`, error);
            mainContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Error Loading ${page}</h3>
                    <p>${error.message}</p>
                    <button onclick="DashboardManager.loadPage('${page}')" class="btn-primary">
                        <i class="fas fa-redo"></i>
                        <span>Retry</span>
                    </button>
                </div>
            `;
        }
    }

    // Add these new methods for each page:
    static async loadAnalytics() {
        const mainContent = document.getElementById('pageContent');
        mainContent.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-chart-bar"></i> Analytics</h2>
                <p>Detailed threat analytics and reporting</p>
            </div>
            <div class="charts-row">
                <div class="chart-container">
                    <div class="chart-header">
                        <h4><i class="fas fa-chart-area"></i> Attack Trends</h4>
                    </div>
                    <div class="chart-wrapper">
                        <canvas id="analyticsChart1"></canvas>
                    </div>
                </div>
                <div class="chart-container">
                    <div class="chart-header">
                        <h4><i class="fas fa-chart-bar"></i> Top Attack Sources</h4>
                    </div>
                    <div class="chart-wrapper">
                        <canvas id="analyticsChart2"></canvas>
                    </div>
                </div>
            </div>
            <!-- Add more analytics content as needed -->
        `;
    }

    static async loadSessions() {
        const mainContent = document.getElementById('pageContent');
        mainContent.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-terminal"></i> Attack Sessions</h2>
                <p>Detailed view of all captured attack sessions</p>
            </div>
            <div class="sessions-container">
                <div class="sessions-header">
                    <h4><i class="fas fa-list"></i> All Attack Sessions</h4>
                    <div class="session-filters">
                        <input type="text" id="sessionSearch" placeholder="Search sessions..." class="form-input">
                        <select id="severityFilter" class="form-input">
                            <option value="all">All Severity</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                        <select id="typeFilter" class="form-input">
                            <option value="all">All Types</option>
                            <option value="ssh">SSH Brute Force</option>
                            <option value="port">Port Scan</option>
                            <option value="malware">Malware</option>
                            <option value="sql">SQL Injection</option>
                        </select>
                    </div>
                </div>
                <div class="sessions-table-container">
                    <table class="sessions-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Source IP</th>
                                <th>Type</th>
                                <th>Country</th>
                                <th>Severity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="sessionsTableBody">
                            <!-- Sessions will be loaded dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Load sessions data
        setTimeout(() => {
            DashboardData.initSessionsTable();
        }, 100);
    }

    static async loadThreatIntel() {
        const mainContent = document.getElementById('pageContent');
        mainContent.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-shield-alt"></i> Threat Intelligence</h2>
                <p>Threat indicators, IOCs, and intelligence feeds</p>
            </div>
            <div class="threat-intel-grid">
                <!-- Threat intel content -->
            </div>
        `;
    }

    static async loadConfiguration() {
        const mainContent = document.getElementById('pageContent');
        mainContent.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-cogs"></i> Configuration</h2>
                <p>System settings and honeypot configuration</p>
            </div>
            <div class="config-container">
                <!-- Configuration content -->
            </div>
        `;
    }

    static async loadLogExplorer() {
        const mainContent = document.getElementById('pageContent');
        mainContent.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-database"></i> Log Explorer</h2>
                <p>Search and analyze raw log data</p>
            </div>
            <div class="log-explorer">
                <!-- Log explorer content -->
            </div>
        `;
    }

    static async loadDocumentation() {
        const mainContent = document.getElementById('pageContent');
        mainContent.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-question-circle"></i> Documentation</h2>
                <p>User guide and API documentation</p>
            </div>
            <div class="documentation">
                <!-- Documentation content -->
            </div>
        `;
    }

    static async loadAttackMap() {
        const mainContent = document.getElementById('pageContent');
        if (!mainContent) return;

        mainContent.innerHTML = `
            <div class="chart-container" style="height: calc(100vh - 200px);">
                <div class="chart-header">
                    <h4><i class="fas fa-map-marked-alt"></i> Attack Map</h4>
                    <div class="map-legend">
                        <span class="legend-item"><span class="legend-dot high"></span> High</span>
                        <span class="legend-item"><span class="legend-dot medium"></span> Medium</span>
                        <span class="legend-item"><span class="legend-dot low"></span> Low</span>
                    </div>
                </div>
                <div class="map-wrapper" style="height: calc(100% - 60px);">
                    <div id="fullScreenMap" style="width: 100%; height: 100%; border-radius: 6px;"></div>
                </div>
            </div>
        `;

        setTimeout(() => {
            DashboardMap.initFullScreen();
        }, 100);
    }

    static logout() {
        // Clear session storage
        sessionStorage.clear();

        // Redirect to login
        window.location.href = 'index.html';
    }

    static refreshData() {
        const currentPage = 'overview'; // Default to overview
        this.loadPage(currentPage);

        // Show refresh notification
        this.showNotification('Data refreshed successfully', 'success');
    }

    static toggleFullscreen() {
        const elem = document.documentElement;

        if (!document.fullscreenElement) {
            elem.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    static changeRefreshInterval() {
        const intervals = [30, 60, 120, 300]; // seconds
        const currentEl = document.getElementById('refreshInterval');
        if (!currentEl) return;

        const current = parseInt(currentEl.textContent);
        const currentIndex = intervals.indexOf(current);
        const nextIndex = (currentIndex + 1) % intervals.length;
        const next = intervals[nextIndex];

        currentEl.textContent = next + 's';

        // Update the auto-refresh interval
        clearInterval(this.refreshIntervalId);
        this.startAutoRefresh();

        this.showNotification(`Auto-refresh interval changed to ${next} seconds`, 'info');
    }

    static startAutoRefresh() {
        const intervalEl = document.getElementById('refreshInterval');
        if (!intervalEl) return;

        const interval = parseInt(intervalEl.textContent) * 1000; // Convert to milliseconds

        clearInterval(this.refreshIntervalId);

        this.refreshIntervalId = setInterval(() => {
            this.refreshData();
        }, interval);
    }

    static showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: var(--dark-surface);
            border: 1px solid var(--dark-border);
            border-left: 4px solid;
            border-radius: 6px;
            display: flex;
            align-items: center;
            gap: 1rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        // Set border color based on type
        const colors = {
            info: '#1f6feb',
            success: '#56d364',
            error: '#f85149',
            warning: '#f0883e'
        };
        notification.style.borderLeftColor = colors[type] || colors.info;

        const icons = {
            info: 'info-circle',
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle'
        };

        notification.innerHTML = `
            <i class="fas fa-${icons[type]}" style="color: ${colors[type] || colors.info};"></i>
            <span>${message}</span>
            <button class="notification-close" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; margin-left: auto; padding: 0.25rem;">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);

        // Add to DOM
        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    static closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth <= 992 && sidebar && sidebar.classList.contains('sidebar-active')) {
            sidebar.classList.remove('sidebar-active');
        }
    }
}