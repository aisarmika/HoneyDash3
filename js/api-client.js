// API Client for HoneyDash
class HoneyDashAPI {
    constructor() {
        this.baseURL = 'https://api.honeydash.local';
        this.apiVersion = 'v1';
        this.isPublic = sessionStorage.getItem('hd_public') === 'true';
    }

    // Get authentication headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        if (!this.isPublic) {
            const token = sessionStorage.getItem('hd_token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}/${this.apiVersion}/${endpoint}`;

        const defaultOptions = {
            headers: this.getHeaders(),
            credentials: 'include'
        };

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request Failed:', error);
            throw error;
        }
    }

    // Dashboard statistics
    async getDashboardStats(timeRange = '24h') {
        return this.request(`dashboard/stats?range=${timeRange}`);
    }

    // Attack timeline data
    async getAttackTimeline(timeRange = '24h') {
        return this.request(`attacks/timeline?range=${timeRange}`);
    }

    // Attack types distribution
    async getAttackTypes() {
        return this.request('attacks/types');
    }

    // Recent attack sessions
    async getRecentSessions(limit = 10) {
        return this.request(`sessions/recent?limit=${limit}`);
    }

    // Active alerts
    async getActiveAlerts() {
        return this.request('alerts/active');
    }

    // Top threats
    async getTopThreats(limit = 5) {
        return this.request(`threats/top?limit=${limit}`);
    }

    // System metrics
    async getSystemMetrics() {
        return this.request('system/metrics');
    }

    // Honeypot status
    async getHoneypotStatus() {
        return this.request('honeypots/status');
    }

    // Attack map data
    async getAttackMapData() {
        return this.request('attacks/map');
    }

    // Search sessions
    async searchSessions(query, filters = {}) {
        const params = new URLSearchParams({ q: query, ...filters });
        return this.request(`sessions/search?${params}`);
    }

    // Update alert status
    async updateAlertStatus(alertId, status) {
        return this.request(`alerts/${alertId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    }

    // Export data
    async exportData(format = 'json', filters = {}) {
        const params = new URLSearchParams({ format, ...filters });
        return this.request(`export?${params}`);
    }

    // Real-time updates via WebSocket
    connectWebSocket() {
        if (this.isPublic) return null;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host.replace('api.', '')}/ws`;

        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log('WebSocket connected');
            this.heartbeat();
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
            setTimeout(() => this.connectWebSocket(), 5000);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
        };

        return ws;
    }

    heartbeat() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'heartbeat' }));
            setTimeout(() => this.heartbeat(), 30000);
        }
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'attack_detected':
                this.handleNewAttack(data.payload);
                break;
            case 'alert_triggered':
                this.handleNewAlert(data.payload);
                break;
            case 'honeypot_status':
                this.updateHoneypotStatus(data.payload);
                break;
            case 'system_metrics':
                this.updateSystemMetrics(data.payload);
                break;
        }
    }

    // Event handlers - to be implemented by dashboard
    handleNewAttack(attack) {
        console.log('New attack detected:', attack);
        // Dispatch custom event for dashboard to handle
        const event = new CustomEvent('new-attack', { detail: attack });
        window.dispatchEvent(event);
    }

    handleNewAlert(alert) {
        console.log('New alert triggered:', alert);
        const event = new CustomEvent('new-alert', { detail: alert });
        window.dispatchEvent(event);
    }

    updateHoneypotStatus(status) {
        const event = new CustomEvent('honeypot-status', { detail: status });
        window.dispatchEvent(event);
    }

    updateSystemMetrics(metrics) {
        const event = new CustomEvent('system-metrics', { detail: metrics });
        window.dispatchEvent(event);
    }
}

// Create global API instance
const HoneyDashAPI = new HoneyDashAPI();