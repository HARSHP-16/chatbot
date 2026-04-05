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

async function syncToBackendKB(question, answer, category) {
    const API_BASE = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
        ? 'http://127.0.0.1:5000/api'
        : `${window.location.origin}/api`;

    try {
        const payload = {
            question: question,
            answer: answer,
            category: category,
            updated_at: new Date().toISOString().split('T')[0]
        };
        await fetch(`${API_BASE}/admin/update-data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.error("Failed to sync to backend RAG:", e);
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
            
            if (key === 'events') {
                renderPostedEvents();
            }
        });
    });
}

function initEventForm(role) {
    const form = document.getElementById('eventForm');
    const status = document.getElementById('eventStatus');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const items = getStore(EVENTS_KEY, []);
        const timeVal = document.getElementById('eventTime').value;
        const title = document.getElementById('eventTitle').value.trim();
        const date = document.getElementById('eventDate').value;
        const venue = document.getElementById('eventVenue').value.trim();
        const audience = document.getElementById('eventAudience').value;
        const description = document.getElementById('eventDescription').value.trim();

        items.unshift({
            title: title,
            date: date,
            time: timeVal || '--',
            venue: venue,
            audience: audience,
            description: description,
            postedBy: role,
            createdAt: new Date().toISOString(),
        });

        setStore(EVENTS_KEY, items);
        
        // Sync to AI knowledge base
        const q = `What is the ${title} event about and when is it?`;
        const a = `The event '${title}' is scheduled for ${date} at ${timeVal || '--'} in ${venue}. Target audience: ${audience}. Details: ${description}.`;
        syncToBackendKB(q, a, 'events');
        form.reset();
        status.textContent = '✓ Event posted successfully!';
        status.style.color = '#15803d';
        renderPostedEvents();
        setTimeout(() => { status.textContent = ''; }, 3000);
    });
}

function renderPostedEvents() {
    const list = document.getElementById('postedEventsList');
    if (!list) return;
    
    const items = getStore(EVENTS_KEY, []).slice(0, 8);
    
    if (!items.length) {
        list.innerHTML = '<div class="empty-state">No events posted yet. Create your first event above.</div>';
        return;
    }
    
    list.innerHTML = items.map((event) => `
        <div class="event-card">
            <h4>${event.title}</h4>
            <p>${event.description}</p>
            <div class="event-meta">
                <span class="event-meta-item">📅 ${event.date}</span>
                ${event.time !== '--' ? `<span class="event-meta-item">⏰ ${event.time}</span>` : ''}
                <span class="event-meta-item">📍 ${event.venue}</span>
                <span class="event-meta-item">${event.audience === 'all' ? '👥 All' : event.audience}</span>
            </div>
        </div>
    `).join('');
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
        
        // Sync to AI knowledge base
        const q = `What is the timetable for ${dept} on ${day}?`;
        const a = `Here is the timetable for ${dept} on ${day}: Slot 1: ${slots[0] || 'Free'}, Slot 2: ${slots[1] || 'Free'}, Slot 3: ${slots[2] || 'Free'}, Slot 4: ${slots[3] || 'Free'}, Slot 5: ${slots[4] || 'Free'}.`;
        syncToBackendKB(q, a, 'timetable');
        form.reset();
        status.textContent = '✓ Timetable updated successfully.';
        status.style.color = '#15803d';
        setTimeout(() => { status.textContent = ''; }, 3000);
    });
}

function initNotificationForm(role) {
    const form = document.getElementById('notifForm');
    const status = document.getElementById('notifStatus');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const list = getStore(NOTIFICATIONS_KEY, []);
        const title = document.getElementById('notifTitle').value.trim();
        const audience = document.getElementById('notifAudience').value;
        const message = document.getElementById('notifMessage').value.trim();

        list.unshift({
            title: title,
            audience: audience,
            message: message,
            postedBy: role,
            createdAt: new Date().toISOString(),
        });

        setStore(NOTIFICATIONS_KEY, list);

        // Sync to AI knowledge base
        const q = `Is there any notification regarding ${title}?`;
        const a = `Yes, there is a notification titled '${title}'. Details: ${message}. Target audience: ${audience}.`;
        syncToBackendKB(q, a, 'notifications');
        form.reset();
        status.textContent = '✓ Notification posted successfully.';
        status.style.color = '#15803d';
        setTimeout(() => { status.textContent = ''; }, 3000);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem(TIMETABLE_KEY)) {
        setStore(TIMETABLE_KEY, DEFAULT_TIMETABLE);
    }

    const role = roleAccess();
    initTabs();
    initEventForm(role);
    renderPostedEvents();
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
