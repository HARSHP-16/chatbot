const EVENTS_KEY = 'campusEventsStore';
const TIMETABLE_KEY = 'campusTimetableStore';
const NOTIFICATIONS_KEY = 'campusNotificationsStore';

const DEFAULT_TIMETABLE = {
    IT: [
        { day: 'Monday', slots: ['Data Structures', 'DBMS', 'Computer Networks', 'Software Engineering', 'DBMS Lab'] },
        { day: 'Tuesday', slots: ['Operating Systems', 'TOC', 'Aptitude', 'AI Basics', 'Web Tech Lab'] },
    ],
    CS: [
        { day: 'Monday', slots: ['Algorithms', 'Discrete Math', 'Compiler Design', 'Machine Learning', 'Algorithms Lab'] },
        { day: 'Tuesday', slots: ['Comp Architecture', 'DB Systems', 'Stats', 'Cloud Computing', 'ML Lab'] },
    ],
    ENTC: [
        { day: 'Monday', slots: ['Signals', 'Analog Comm', 'Network Theory', 'Digital Electronics', 'Comm Lab'] },
        { day: 'Tuesday', slots: ['Microcontrollers', 'Control Systems', 'Electromagnetics', 'Embedded Systems', 'Embedded Lab'] },
    ],
};

function getStore(key, fallback) {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try {
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

function setStore(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function roleAccess() {
    const user = JSON.parse(localStorage.getItem('campusUser') || '{}');
    const role = String(user.role || 'student').toLowerCase();
    const label = document.getElementById('staffRoleLabel');
    if (label) label.textContent = `Role: ${role}`;

    if (role !== 'admin' && role !== 'faculty') {
        const warning = document.getElementById('accessWarning');
        if (warning) warning.style.display = 'block';
    }

    return role;
}

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const panels = {
        events: document.getElementById('eventsTab'),
        timetable: document.getElementById('timetableTab'),
        notifications: document.getElementById('notificationsTab'),
    };

    tabButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            Object.values(panels).forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const key = btn.getAttribute('data-tab');
            panels[key].classList.add('active');
        });
    });
}

function initEventForm(role) {
    const form = document.getElementById('eventForm');
    const status = document.getElementById('eventStatus');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const items = getStore(EVENTS_KEY, []);
        items.unshift({
            title: document.getElementById('eventTitle').value.trim(),
            date: document.getElementById('eventDate').value,
            venue: document.getElementById('eventVenue').value.trim(),
            audience: document.getElementById('eventAudience').value,
            description: document.getElementById('eventDescription').value.trim(),
            postedBy: role,
            createdAt: new Date().toISOString(),
        });

        setStore(EVENTS_KEY, items);
        form.reset();
        status.textContent = 'Event posted successfully.';
    });
}

function initTimetableForm(role) {
    const form = document.getElementById('timetableForm');
    const status = document.getElementById('ttStatus');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const dept = document.getElementById('ttDept').value;
        const day = document.getElementById('ttDay').value;
        const slots = [
            document.getElementById('slot1').value.trim(),
            document.getElementById('slot2').value.trim(),
            document.getElementById('slot3').value.trim(),
            document.getElementById('slot4').value.trim(),
            document.getElementById('slot5').value.trim(),
        ];

        const store = getStore(TIMETABLE_KEY, DEFAULT_TIMETABLE);
        if (!store[dept]) store[dept] = [];

        const idx = store[dept].findIndex(row => row.day === day);
        const rowData = { day, slots, updatedBy: role, updatedAt: new Date().toISOString() };

        if (idx >= 0) store[dept][idx] = rowData;
        else store[dept].push(rowData);

        setStore(TIMETABLE_KEY, store);
        form.reset();
        status.textContent = 'Timetable updated successfully.';
    });
}

function initNotificationForm(role) {
    const form = document.getElementById('notifForm');
    const status = document.getElementById('notifStatus');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const list = getStore(NOTIFICATIONS_KEY, []);
        list.unshift({
            title: document.getElementById('notifTitle').value.trim(),
            audience: document.getElementById('notifAudience').value,
            message: document.getElementById('notifMessage').value.trim(),
            postedBy: role,
            createdAt: new Date().toISOString(),
        });

        setStore(NOTIFICATIONS_KEY, list);
        form.reset();
        status.textContent = 'Notification posted successfully.';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem(TIMETABLE_KEY)) {
        setStore(TIMETABLE_KEY, DEFAULT_TIMETABLE);
    }

    const role = roleAccess();
    initTabs();
    initEventForm(role);
    initTimetableForm(role);
    initNotificationForm(role);

    const logoutBtn = document.getElementById('logoutBtnPortal');
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
