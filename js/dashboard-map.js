// Dashboard Map Management
class DashboardMap {
    static map = null;
    static markers = [];

    static init() {
        const mapElement = document.getElementById('attackMap');
        if (!mapElement) return;

        // Initialize map with proper attribution
        this.map = L.map('attackMap', {
            center: [20, 0],
            zoom: 2,
            attributionControl: true,
            zoomControl: true,
            preferCanvas: true
        });

        // Add a more compatible tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19,
            minZoom: 1
        }).addTo(this.map);

        // Add custom controls for dark theme
        this.map.attributionControl.setPrefix('<a href="https://leafletjs.com/" title="A JS library for interactive maps">Leaflet</a>');

        // Load attack data
        this.loadAttackData();
    }

    static initFullScreen() {
        const mapElement = document.getElementById('fullScreenMap');
        if (!mapElement) return;

        // Initialize full-screen map
        this.map = L.map('fullScreenMap', {
            center: [20, 0],
            zoom: 2,
            attributionControl: true,
            zoomControl: true,
            preferCanvas: true
        });

        // Add detailed tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19,
            minZoom: 1
        }).addTo(this.map);

        // Load detailed attack data
        this.loadDetailedAttackData();
    }

    // Update the addSampleMarkers method to use better marker styling:
    static addSampleMarkers() {
        const sampleAttacks = [
            { lat: 40.7128, lng: -74.0060, severity: 'high', count: 45, type: 'SSH Brute Force', source: '192.168.1.105' },
            { lat: 51.5074, lng: -0.1278, severity: 'medium', count: 28, type: 'Port Scan', source: '10.0.0.45' },
            { lat: 35.6762, lng: 139.6503, severity: 'high', count: 32, type: 'Malware Download', source: '203.0.113.25' },
            { lat: 39.9042, lng: 116.4074, severity: 'low', count: 15, type: 'SQL Injection', source: '172.16.0.22' },
            { lat: 55.7558, lng: 37.6173, severity: 'high', count: 38, type: 'DDoS Probe', source: '198.51.100.10' },
            { lat: 28.6139, lng: 77.2090, severity: 'medium', count: 22, type: 'RDP Attack', source: '10.1.1.100' },
            { lat: -23.5505, lng: -46.6333, severity: 'low', count: 12, type: 'Web Scan', source: '192.0.2.15' },
            { lat: 3.1390, lng: 101.6869, severity: 'medium', count: 18, type: 'FTP Brute Force', source: '172.20.0.5' }
        ];

        // Use circleMarkers instead of circles for better performance
        sampleAttacks.forEach(attack => {
            const radius = Math.sqrt(attack.count) * 2 + 5;
            const color = this.getSeverityColor(attack.severity);

            const marker = L.circleMarker([attack.lat, attack.lng], {
                radius: radius,
                fillColor: color,
                color: '#ffffff',
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.6,
                className: 'attack-marker'
            })
                .addTo(this.map)
                .bindPopup(this.createPopupContent(attack));

            // Add hover effect
            marker.on('mouseover', function () {
                this.setStyle({
                    fillOpacity: 0.9,
                    weight: 3
                });
            });

            marker.on('mouseout', function () {
                this.setStyle({
                    fillOpacity: 0.6,
                    weight: 2
                });
            });

            this.markers.push(marker);
        });

        // Fit bounds to show all markers
        if (this.markers.length > 0) {
            const bounds = L.latLngBounds(this.markers.map(m => m.getLatLng()));
            this.map.fitBounds(bounds, { padding: [50, 50] });
        }
    }

    static addSampleMarkers() {
        // Clear existing markers
        this.clearMarkers();

        const attacks = [
            { lat: 40.7128, lng: -74.0060, severity: 'high', count: 45, type: 'SSH Brute Force', source: '192.168.1.105' },
            { lat: 51.5074, lng: -0.1278, severity: 'medium', count: 28, type: 'Port Scan', source: '10.0.0.45' },
            { lat: 35.6762, lng: 139.6503, severity: 'high', count: 32, type: 'Malware Download', source: '203.0.113.25' },
            { lat: 39.9042, lng: 116.4074, severity: 'low', count: 15, type: 'SQL Injection', source: '172.16.0.22' },
            { lat: 55.7558, lng: 37.6173, severity: 'high', count: 38, type: 'DDoS Probe', source: '198.51.100.10' },
            { lat: 28.6139, lng: 77.2090, severity: 'medium', count: 22, type: 'RDP Attack', source: '10.1.1.100' },
            { lat: -23.5505, lng: -46.6333, severity: 'low', count: 12, type: 'Web Scan', source: '192.0.2.15' },
            { lat: 3.1390, lng: 101.6869, severity: 'medium', count: 18, type: 'FTP Brute Force', source: '172.20.0.5' }
        ];

        const severityColors = {
            high: '#f85149',
            medium: '#f0883e',
            low: '#56d364'
        };

        attacks.forEach(attack => {
            const radius = Math.sqrt(attack.count) * 2;
            const color = severityColors[attack.severity] || '#8b949e';

            const marker = L.circleMarker([attack.lat, attack.lng], {
                radius: radius,
                fillColor: color,
                color: '#ffffff',
                weight: 1,
                opacity: 0.8,
                fillOpacity: 0.6
            })
                .addTo(this.map)
                .bindPopup(this.createPopupContent(attack));

            this.markers.push(marker);
        });
    }

    static addDetailedMarkers() {
        // Clear existing markers
        this.clearMarkers();

        const attacks = [
            { lat: 40.7128, lng: -74.0060, severity: 'high', count: 45, type: 'SSH Brute Force', source: '192.168.1.105', timestamp: new Date().toISOString(), country: 'USA' },
            { lat: 51.5074, lng: -0.1278, severity: 'medium', count: 28, type: 'Port Scan', source: '10.0.0.45', timestamp: new Date().toISOString(), country: 'UK' },
            { lat: 35.6762, lng: 139.6503, severity: 'high', count: 32, type: 'Malware Download', source: '203.0.113.25', timestamp: new Date().toISOString(), country: 'Japan' },
            { lat: 39.9042, lng: 116.4074, severity: 'low', count: 15, type: 'SQL Injection', source: '172.16.0.22', timestamp: new Date().toISOString(), country: 'China' },
            { lat: 55.7558, lng: 37.6173, severity: 'high', count: 38, type: 'DDoS Probe', source: '198.51.100.10', timestamp: new Date().toISOString(), country: 'Russia' },
            { lat: 28.6139, lng: 77.2090, severity: 'medium', count: 22, type: 'RDP Attack', source: '10.1.1.100', timestamp: new Date().toISOString(), country: 'India' },
            { lat: -23.5505, lng: -46.6333, severity: 'low', count: 12, type: 'Web Scan', source: '192.0.2.15', timestamp: new Date().toISOString(), country: 'Brazil' },
            { lat: 3.1390, lng: 101.6869, severity: 'medium', count: 18, type: 'FTP Brute Force', source: '172.20.0.5', timestamp: new Date().toISOString(), country: 'Malaysia' }
        ];

        attacks.forEach(attack => {
            const marker = L.circleMarker([attack.lat, attack.lng], {
                radius: 8,
                fillColor: this.getSeverityColor(attack.severity),
                color: '#ffffff',
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.8
            })
                .addTo(this.map)
                .bindPopup(this.createDetailedPopupContent(attack));

            this.markers.push(marker);
        });

        // Fit bounds to show all markers
        if (attacks.length > 0) {
            const group = new L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    static createPopupContent(attack) {
        return `
            <div style="font-family: 'Inter', sans-serif; color: #f0f6fc; min-width: 200px;">
                <h4 style="margin: 0 0 10px 0; color: ${this.getSeverityColor(attack.severity)};">${attack.count} Attack${attack.count !== 1 ? 's' : ''}</h4>
                <div style="font-size: 14px; line-height: 1.5;">
                    <div><strong>Severity:</strong> <span style="color: ${this.getSeverityColor(attack.severity)};">${attack.severity.toUpperCase()}</span></div>
                    <div><strong>Type:</strong> ${attack.type || 'Unknown'}</div>
                    <div><strong>Location:</strong> ${attack.lat.toFixed(4)}, ${attack.lng.toFixed(4)}</div>
                    ${attack.source ? `<div><strong>Source:</strong> <code style="background: rgba(31, 111, 235, 0.1); padding: 2px 4px; border-radius: 3px;">${attack.source}</code></div>` : ''}
                </div>
            </div>
        `;
    }

    static createDetailedPopupContent(attack) {
        const timestamp = new Date(attack.timestamp).toLocaleString();

        return `
            <div style="font-family: 'Inter', sans-serif; color: #f0f6fc; min-width: 250px;">
                <h4 style="margin: 0 0 10px 0; color: ${this.getSeverityColor(attack.severity)};">Attack Details</h4>
                <div style="font-size: 14px; line-height: 1.5;">
                    <div><strong>Time:</strong> ${timestamp}</div>
                    <div><strong>Type:</strong> ${attack.type}</div>
                    <div><strong>Severity:</strong> <span style="color: ${this.getSeverityColor(attack.severity)};">${attack.severity.toUpperCase()}</span></div>
                    <div><strong>Source IP:</strong> <code style="background: rgba(31, 111, 235, 0.1); padding: 2px 4px; border-radius: 3px;">${attack.source}</code></div>
                    <div><strong>Location:</strong> ${attack.country} (${attack.lat.toFixed(4)}, ${attack.lng.toFixed(4)})</div>
                </div>
            </div>
        `;
    }

    static getSeverityColor(severity) {
        const colors = {
            critical: '#f85149',
            high: '#f0883e',
            medium: '#8957e5',
            low: '#56d364',
            info: '#1f6feb'
        };
        return colors[severity] || '#8b949e';
    }

    static clearMarkers() {
        this.markers.forEach(marker => {
            if (this.map) {
                this.map.removeLayer(marker);
            }
        });
        this.markers = [];
    }

    static addMapStyles() {
        // Add custom styles for Leaflet
        const style = document.createElement('style');
        style.textContent = `
            .leaflet-container {
                background: #0d1117 !important;
                font-family: 'Inter', sans-serif !important;
            }
            
            .leaflet-control-zoom a {
                background: #161b22 !important;
                color: #8b949e !important;
                border-color: #30363d !important;
            }
            
            .leaflet-control-zoom a:hover {
                background: #21262d !important;
                color: #f0f6fc !important;
            }
            
            .leaflet-popup-content-wrapper {
                background: #161b22 !important;
                color: #f0f6fc !important;
                border: 1px solid #30363d !important;
                border-radius: 6px !important;
            }
            
            .leaflet-popup-tip {
                background: #161b22 !important;
            }
            
            .leaflet-control-attribution {
                background: rgba(0, 0, 0, 0.7) !important;
                color: #8b949e !important;
                font-size: 11px !important;
            }
        `;
        document.head.appendChild(style);
    }

    static destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        this.clearMarkers();
    }
}