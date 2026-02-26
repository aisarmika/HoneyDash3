// Dashboard Data Management
class DashboardData {
    static sessions = [];
    static alerts = [];
    static threats = [];

    static async initSessionsTable() {
        try {
            const sessions = await HoneyDashAPI.getRecentSessions(50);
            this.sessions = sessions;
            this.renderSessionsTable(sessions);
            this.initSessionFilters();
        } catch (error) {
            console.error('Error loading sessions:', error);
            this.renderEmptyState('sessions', 'Unable to load sessions data');
        }
    }

    static renderSessionsTable(sessions) {
        const tableBody = document.getElementById('sessionsTableBody');
        if (!tableBody) return;

        if (sessions.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-table">
                        <i class="fas fa-search"></i>
                        <p>No attack sessions found</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = sessions.map(session => `
            <tr class="session-row" data-id="${session.id}">
                <td>
                    <span class="session-time">${this.formatTime(session.timestamp)}</span>
                </td>
                <td>
                    <code class="session-ip" title="${session.source_ip}">${session.source_ip}</code>
                </td>
                <td>
                    <span class="session-type">${session.type}</span>
                </td>
                <td>
                    <span class="session-country">${session.country || 'Unknown'}</span>
                </td>
                <td>
                    <span class="severity-badge severity-${session.severity}">${session.severity.toUpperCase()}</span>
                </td>
            </tr>
        `).join('');

        // Add click handlers for session details
        this.addSessionClickHandlers();
    }

    static initSessionFilters() {
        const searchInput = document.getElementById('sessionSearch');
        const severityFilter = document.getElementById('severityFilter');
        const typeFilter = document.getElementById('typeFilter');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterSessions(e.target.value, severityFilter?.value, typeFilter?.value);
            });
        }

        if (severityFilter) {
            severityFilter.addEventListener('change', (e) => {
                this.filterSessions(searchInput?.value, e.target.value, typeFilter?.value);
            });
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.filterSessions(searchInput?.value, severityFilter?.value, e.target.value);
            });
        }
    }

    static filterSessions(searchText = '', severity = 'all', type = 'all') {
        let filtered = this.sessions;

        // Search filter
        if (searchText) {
            const search = searchText.toLowerCase();
            filtered = filtered.filter(session =>
                session.source_ip.toLowerCase().includes(search) ||
                session.type.toLowerCase().includes(search) ||
                (session.country && session.country.toLowerCase().includes(search))
            );
        }

        // Severity filter
        if (severity !== 'all') {
            filtered = filtered.filter(session => session.severity === severity);
        }

        // Type filter
        if (type !== 'all') {
            filtered = filtered.filter(session => session.type === type);
        }

        this.renderSessionsTable(filtered);
    }

    static addSessionClickHandlers() {
        const rows = document.querySelectorAll('.session-row');
        rows.forEach(row => {
            row.addEventListener('click', () => {
                const sessionId = row.dataset.id;
                this.showSessionDetails(sessionId);
            });
        });
    }

    static async showSessionDetails(sessionId) {
        try {
            // Fetch detailed session data
            const session = this.sessions.find(s => s.id === sessionId) ||
                await this.fetchSessionDetails(sessionId);

            // Create modal content
            const modalContent = `
                <div class="modal-header">
                    <h3>Session Details</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="session-details-grid">
                        <div class="detail-group">
                            <label>Time</label>
                            <div>${this.formatDateTime(session.timestamp)}</div>
                        </div>
                        <div class="detail-group">
                            <label>Source IP</label>
                            <div><code>${session.source_ip}</code></div>
                        </div>
                        <div class="detail-group">
                            <label>Type</label>
                            <div>${session.type}</div>
                        </div>
                        <div class="detail-group">
                            <label>Severity</label>
                            <div><span class="severity-badge severity-${session.severity}">${session.severity.toUpperCase()}</span></div>
                        </div>
                        <div class="detail-group">
                            <label>Country</label>
                            <div>${session.country || 'Unknown'}</div>
                        </div>
                        <div class="detail-group">
                            <label>Honeypot</label>
                            <div>${session.honeypot || 'Unknown'}</div>
                        </div>
                        ${session.payload ? `
                            <div class="detail-group full-width">
                                <label>Payload</label>
                                <pre class="payload-display">${session.payload}</pre>
                            </div>
                        ` : ''}
                        ${session.logs ? `
                            <div class="detail-group full-width">
                                <label>Logs</label>
                                <pre class="logs-display">${session.logs}</pre>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="exportSession">Export</button>
                    <button class="btn-primary" id="addToThreatIntel">Add to Threat Intel</button>
                </div>
            `;

            // Show modal
            this.showModal(modalContent, 'session-details-modal');

            // Add modal event listeners
            this.addModalEventListeners(session);

        } catch (error) {
            console.error('Error showing session details:', error);
            this.showNotification('Unable to load session details', 'error');
        }
    }

    static async fetchSessionDetails(sessionId) {
        // In a real implementation, this would fetch from API
        return {
            id: sessionId,
            timestamp: new Date().toISOString(),
            source_ip: '192.168.1.105',
            type: 'SSH Brute Force',
            severity: 'high',
            country: 'USA',
            honeypot: 'Cowrie',
            payload: 'SSH-2.0-OpenSSH_7.6p1 Ubuntu-4ubuntu0.3\n...',
            logs: 'Connection established\nAuthentication attempted\nSession closed'
        };
    }

    static async initAlerts() {
        try {
            const alerts = await HoneyDashAPI.getActiveAlerts();
            this.alerts = alerts;
            this.renderAlerts(alerts);
        } catch (error) {
            console.error('Error loading alerts:', error);
            this.renderEmptyState('alerts', 'Unable to load alerts');
        }
    }

    static renderAlerts(alerts) {
        const alertList = document.getElementById('alertList');
        if (!alertList) return;

        if (alerts.length === 0) {
            alertList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <p>No active alerts</p>
                </div>
            `;
            return;
        }

        alertList.innerHTML = alerts.map(alert => `
            <div class="alert-item alert-${alert.severity}" data-id="${alert.id}">
                <div class="alert-icon">
                    <i class="fas fa-${this.getAlertIcon(alert.severity)}"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-message">${alert.message}</div>
                    <div class="alert-meta">
                        <span class="alert-time">${this.formatRelativeTime(alert.timestamp)}</span>
                        <span class="alert-source">${alert.source || 'System'}</span>
                    </div>
                </div>
                <div class="alert-actions">
                    <button class="alert-action-btn" title="Acknowledge" data-action="acknowledge">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="alert-action-btn" title="View Details" data-action="view">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `).join('');

        this.addAlertActionHandlers();
    }

    static addAlertActionHandlers() {
        const actionButtons = document.querySelectorAll('.alert-action-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const alertItem = btn.closest('.alert-item');
                const alertId = alertItem.dataset.id;
                const action = btn.dataset.action;

                this.handleAlertAction(alertId, action);
            });
        });

        // Click on alert item to view details
        const alertItems = document.querySelectorAll('.alert-item');
        alertItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.alert-actions')) {
                    const alertId = item.dataset.id;
                    this.showAlertDetails(alertId);
                }
            });
        });
    }

    static handleAlertAction(alertId, action) {
        switch (action) {
            case 'acknowledge':
                this.acknowledgeAlert(alertId);
                break;
            case 'view':
                this.showAlertDetails(alertId);
                break;
        }
    }

    static async acknowledgeAlert(alertId) {
        try {
            await HoneyDashAPI.updateAlertStatus(alertId, 'acknowledged');

            // Remove from UI
            const alertItem = document.querySelector(`.alert-item[data-id="${alertId}"]`);
            if (alertItem) {
                alertItem.remove();
            }

            // Update alert count
            this.updateAlertCount();

            this.showNotification('Alert acknowledged', 'success');
        } catch (error) {
            console.error('Error acknowledging alert:', error);
            this.showNotification('Failed to acknowledge alert', 'error');
        }
    }

    static async showAlertDetails(alertId) {
        // Similar to session details modal
        console.log('Showing alert details for:', alertId);
    }

    static updateAlertCount() {
        const alertCount = document.querySelectorAll('.alert-item').length;
        const countElement = document.querySelector('.alert-count');

        if (countElement) {
            countElement.textContent = alertCount;

            if (alertCount === 0) {
                countElement.style.display = 'none';
            } else {
                countElement.style.display = 'flex';
            }
        }
    }

    static getAlertIcon(severity) {
        const icons = {
            critical: 'exclamation-triangle',
            high: 'exclamation-circle',
            medium: 'exclamation',
            low: 'info-circle',
            info: 'info'
        };
        return icons[severity] || 'info';
    }

    static formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static formatDateTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    static formatRelativeTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes} min ago`;
        if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }

    static showModal(content, modalClass = '') {
        // Remove existing modal
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) existingModal.remove();

        // Create modal
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';

        const modal = document.createElement('div');
        modal.className = `modal ${modalClass}`;
        modal.innerHTML = content;

        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);

        // Add overlay click to close
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                this.closeModal();
            }
        });

        // Add close button handler
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
    }

    static addModalEventListeners(session) {
        const exportBtn = document.getElementById('exportSession');
        const threatIntelBtn = document.getElementById('addToThreatIntel');

        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportSessionData(session);
            });
        }

        if (threatIntelBtn) {
            threatIntelBtn.addEventListener('click', () => {
                this.addToThreatIntel(session);
            });
        }
    }

    static closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) modal.remove();
    }

    static async exportSessionData(session) {
        try {
            const data = JSON.stringify(session, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `session-${session.id}-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showNotification('Session data exported', 'success');
        } catch (error) {
            console.error('Error exporting session:', error);
            this.showNotification('Failed to export session data', 'error');
        }
    }

    static async addToThreatIntel(session) {
        // Add session to threat intelligence database
        console.log('Adding to threat intel:', session);
        this.showNotification('Added to threat intelligence', 'success');
        this.closeModal();
    }

    static renderEmptyState(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-database"></i>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    static showNotification(message, type = 'info') {
        DashboardManager.showNotification(message, type);
    }
}