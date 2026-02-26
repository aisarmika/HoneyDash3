// Initialize login page
document.addEventListener('DOMContentLoaded', () => {
    // Password visibility toggle
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const eyeIcon = togglePassword.querySelector('i');

    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        eyeIcon.classList.toggle('fa-eye');
        eyeIcon.classList.toggle('fa-eye-slash');
    });

    // Form submission
    const loginForm = document.getElementById('loginForm');
    const publicAccessBtn = document.getElementById('publicAccessBtn');

    // Valid credentials
    const credentials = {
        'analyst': { password: 'honeydash2024', role: 'analyst' },
        'admin': { password: 'admin@honeydash', role: 'admin' },
        'viewer': { password: 'viewonly', role: 'viewer' }
    };

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;

        // Show loading state
        const submitBtn = loginForm.querySelector('.login-button');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Authenticating...</span>';
        submitBtn.disabled = true;

        // Simulate authentication delay
        setTimeout(() => {
            if (credentials[username] && credentials[username].password === password) {
                // Successful login
                showNotification('Authentication successful. Redirecting...', 'success');

                // Store session data
                sessionStorage.setItem('hd_authenticated', 'true');
                sessionStorage.setItem('hd_user', username);
                sessionStorage.setItem('hd_role', role);

                // Store timestamp for session management
                sessionStorage.setItem('hd_login_time', Date.now());

                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);

            } else {
                // Failed login
                showNotification('Invalid credentials. Check demo credentials below.', 'error');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }, 1500);
    });

    // Public access
    publicAccessBtn.addEventListener('click', () => {
        showNotification('Entering public view mode...', 'info');
        sessionStorage.setItem('hd_public', 'true');
        sessionStorage.setItem('hd_user', 'Public Viewer');
        sessionStorage.setItem('hd_role', 'viewer');

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 800);
    });

    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        const icons = {
            info: 'info-circle',
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle'
        };

        notification.innerHTML = `
            <i class="fas fa-${icons[type]}"></i>
            <span>${message}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;

        // Add to DOM
        document.querySelector('.login-form-container').appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    // Simulate live activity updates
    function simulateActivity() {
        const activities = document.querySelectorAll('.activity-item');
        if (activities.length === 0) return;

        setInterval(() => {
            const now = new Date();
            const time = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

            const events = [
                'SSH login attempt',
                'Port scan detected',
                'Malware payload download',
                'SQL injection attempt',
                'DDoS probe detected',
                'Brute force attempt',
                'Web vulnerability scan',
                'RDP attack attempt'
            ];

            const sources = [
                '192.168.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
                '10.0.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
                '172.16.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
                (Math.floor(Math.random() * 255) + 1) + '.' +
                Math.floor(Math.random() * 255) + '.' +
                Math.floor(Math.random() * 255) + '.' +
                Math.floor(Math.random() * 255)
            ];

            // Update first activity item with new data
            const firstActivity = activities[0];
            firstActivity.querySelector('.time').textContent = time;
            firstActivity.querySelector('.event').textContent = events[Math.floor(Math.random() * events.length)];
            firstActivity.querySelector('.source').textContent = sources[Math.floor(Math.random() * sources.length)];

            // Move to bottom
            firstActivity.parentNode.appendChild(firstActivity);

        }, 8000); // Update every 8 seconds
    }

    simulateActivity();

    // Console welcome message
    console.log('%c🔐 HoneyDash Authentication', 'color: #56d364; font-size: 16px; font-weight: bold;');
    console.log('%c⚠️  Authorized access only. All activities are logged.', 'color: #f0883e;');
});