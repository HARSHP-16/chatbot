const PROFILE_KEY = 'studentProfile';

function nowClock() {
    const timeEl = document.getElementById('clock');
    const dateEl = document.getElementById('todayDate');
    if (!timeEl || !dateEl) return;

    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString();
    dateEl.textContent = now.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function loadProfile() {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (!saved) return;

    try {
        const profile = JSON.parse(saved);
        ['name', 'email', 'department', 'age', 'semester'].forEach((field) => {
            const el = document.getElementById(field);
            if (el && profile[field] !== undefined) {
                el.value = profile[field];
            }
        });
    } catch (_) {
        // Ignore malformed local data.
    }
}

document.addEventListener('DOMContentLoaded', () => {
    nowClock();
    setInterval(nowClock, 1000);
    loadProfile();

    const form = document.getElementById('profileForm');
    const status = document.getElementById('profileStatus');
    const resetBtn = document.getElementById('resetProfile');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const profile = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            department: document.getElementById('department').value,
            age: document.getElementById('age').value.trim(),
            semester: document.getElementById('semester').value,
        };

        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
        status.textContent = 'Profile saved successfully.';
        status.style.color = '#15803d';

        const user = JSON.parse(localStorage.getItem('campusUser') || '{}');
        if (profile.name) user.name = profile.name;
        if (profile.email) user.email = profile.email;
        localStorage.setItem('campusUser', JSON.stringify(user));
    });

    resetBtn.addEventListener('click', () => {
        localStorage.removeItem(PROFILE_KEY);
        form.reset();
        status.textContent = 'Profile reset.';
        status.style.color = '#b45309';
    });

    const logoutBtn = document.getElementById('logoutBtnProfile');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('campusUser');
                localStorage.removeItem('studentProfile');
                localStorage.removeItem('chatSessionId');
                window.location.href = 'index.html';
            }
        });
    }
});
