// Dashboard Charts Management
class DashboardCharts {
    static charts = {};

    static initTimelineChart() {
        const ctx = document.getElementById('timelineChart');
        if (!ctx) {
            console.error('Timeline chart canvas not found');
            return;
        }

        // Destroy existing chart
        if (this.charts.timeline) {
            this.charts.timeline.destroy();
        }

        // Sample data
        const timelineData = {
            labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
            datasets: [{
                label: 'Attack Count',
                data: [12, 19, 3, 5, 2, 3, 15, 22, 18, 24, 30, 28],
                borderColor: '#1f6feb',
                backgroundColor: 'rgba(31, 111, 235, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#56d364',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        };

        try {
            this.charts.timeline = new Chart(ctx, {
                type: 'line',
                data: timelineData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#161b22',
                            titleColor: '#f0f6fc',
                            bodyColor: '#f0f6fc',
                            borderColor: '#30363d',
                            borderWidth: 1
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255,255,255,0.05)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#8b949e',
                                font: { family: 'Roboto Mono' }
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(255,255,255,0.05)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#8b949e',
                                font: { family: 'Roboto Mono' }
                            }
                        }
                    }
                }
            });

            // Add event listeners to time buttons
            this.initTimelineControls();

        } catch (error) {
            console.error('Error creating timeline chart:', error);
        }
    }

    static initTimelineControls() {
        const timeButtons = document.querySelectorAll('.time-btn[data-range]');
        timeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                timeButtons.forEach(b => b.classList.remove('active'));

                // Add active class to clicked button
                btn.classList.add('active');

                // Load new data
                const range = btn.dataset.range;
                this.loadTimelineData(range).then(data => {
                    if (this.charts.timeline) {
                        this.charts.timeline.data.labels = data.labels;
                        this.charts.timeline.data.datasets[0].data = data.values;
                        this.charts.timeline.update();
                    }
                });
            });
        });
    }

    static async loadTimelineData(range) {
        // Sample data for demo
        let labels, values;

        switch (range) {
            case '7d':
                labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                values = [45, 52, 38, 67, 84, 42, 58];
                break;
            case '30d':
                labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
                values = Array.from({ length: 30 }, () => Math.floor(Math.random() * 100) + 20);
                break;
            default: // 24h
                labels = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
                values = [12, 19, 3, 5, 2, 3, 15, 22, 18, 24, 30, 28];
        }

        return { labels, values };
    }

    static initAttackTypeChart() {
        const ctx = document.getElementById('attackTypeChart');
        if (!ctx) {
            console.error('Attack type chart canvas not found');
            return;
        }

        // Destroy existing chart
        if (this.charts.attackType) {
            this.charts.attackType.destroy();
        }

        // Sample data
        const attackTypeData = {
            labels: ['SSH Brute Force', 'Port Scan', 'Malware', 'SQL Injection', 'DDoS', 'Other'],
            datasets: [{
                data: [35, 25, 15, 10, 8, 7],
                backgroundColor: [
                    '#1f6feb',
                    '#56d364',
                    '#f0883e',
                    '#8957e5',
                    '#f85149',
                    '#8b949e'
                ],
                borderWidth: 0,
                hoverOffset: 15
            }]
        };

        try {
            this.charts.attackType = new Chart(ctx, {
                type: 'doughnut',
                data: attackTypeData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                color: '#8b949e',
                                font: { family: 'Inter' },
                                padding: 20,
                                usePointStyle: true,
                                pointStyle: 'circle'
                            }
                        },
                        tooltip: {
                            backgroundColor: '#161b22',
                            titleColor: '#f0f6fc',
                            bodyColor: '#f0f6fc',
                            borderColor: '#30363d',
                            borderWidth: 1,
                            callbacks: {
                                label: function (context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });

        } catch (error) {
            console.error('Error creating attack type chart:', error);
        }
    }

    static destroyAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }
}