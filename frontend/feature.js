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
    ]
};

const MODULES = {
    schedule: {
        title: 'Academic Schedule',
        description: 'Department-wise weekly timetable in a proper tabular view.',
        items: [],
    },
    events: {
        title: 'Campus Events',
        description: 'Track upcoming technical and cultural events.',
        items: [
            { title: 'Hackathon Sprint', text: 'Main Auditorium, 11 Apr, 10:00 AM' },
            { title: 'Robotics Workshop', text: 'Lab Block 2, 14 Apr, 2:00 PM' },
            { title: 'Alumni Talk', text: 'Seminar Hall, 18 Apr, 4:00 PM' },
        ],
    },
    hostel: {
        title: 'Hostel Services',
        description: 'Maintenance requests, mess menu and room support updates.',
        items: [
            { title: 'Raise Maintenance Ticket', text: 'Electrical, plumbing, WiFi, furniture issues' },
            { title: 'Mess Menu', text: 'Check breakfast/lunch/dinner for the week' },
            { title: 'Warden Contact', text: 'Emergency and escalation contact list' },
        ],
    },
    placement: {
        title: 'Placement Cell',
        description: 'Company drives, eligibility and application status in one place.',
        items: [
            { title: 'Infosys Drive', text: 'Eligible: Sem 6+, CGPA 7.0+, Reg closes 10 Apr' },
            { title: 'TCS NQT', text: 'Round 1 test date: 15 Apr' },
            { title: 'Resume Clinic', text: 'Training room 3, every Friday 3:00 PM' },
        ],
    },
    navigation: {
        title: 'Navigation Help',
        description: 'Find blocks, labs and offices quickly.',
        items: [
            { title: 'Admin Office', text: 'Main Building, Ground Floor' },
            { title: 'IT Labs', text: 'Block C, 3rd Floor, Rooms IT-L1 and IT-L2' },
            { title: 'Library', text: 'Academic Block, 1st Floor' },
        ],
    },
    faculty: {
        title: 'Faculty Directory',
        description: 'Department-wise faculty information and office locations.',
        items: [
            { title: 'IT Coordinator', text: 'Prof. S. Kulkarni - Room IT-210' },
            { title: 'CS Coordinator', text: 'Prof. R. Patil - Room CS-205' },
            { title: 'ENTC Coordinator', text: 'Prof. A. Deshmukh - Room ENTC-108' },
        ],
    },
    notifications: {
        title: 'Notifications',
        description: 'Important campus announcements and reminders.',
        items: [
            { title: 'Exam Form Deadline', text: 'Submit by 12 Apr before 5:00 PM' },
            { title: 'Holiday Notice', text: 'Campus closed on 14 Apr' },
            { title: 'Lab Maintenance', text: 'CS-L1 unavailable on 8 Apr (9:00 AM - 1:00 PM)' },
        ],
    },
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

function getUserContext() {
    const user = JSON.parse(localStorage.getItem('campusUser') || '{}');
    const profile = JSON.parse(localStorage.getItem('studentProfile') || '{}');
    return {
        role: String(user.role || 'student').toLowerCase(),
        department: String(profile.department || '').toUpperCase(),
    };
}

function formatDisplayDate(dateValue, createdAt) {
    const candidate = dateValue || createdAt;
    if (!candidate) return '';
    const parsed = new Date(candidate);
    if (Number.isNaN(parsed.getTime())) return String(candidate);
    return parsed.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function escapeHtml(text) {
    return String(text || '').replace(/[&<>"']/g, (m) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[m]));
}

function renderScheduleTable() {
    let tableData = getStore(TIMETABLE_KEY, null);
    if (!tableData || Object.keys(tableData).length === 0) {
        tableData = DEFAULT_TIMETABLE;
    }
    const list = document.getElementById('featureItems');
    const { role, department } = getUserContext();

    const departmentsToShow = role === 'student' && department
        ? [department]
        : Object.keys(tableData);

    if (!departmentsToShow.length) {
        list.innerHTML = '<div class="item"><h4>No timetable data</h4><p>Please ask admin/faculty to update timetable.</p></div>';
        return;
    }

    list.innerHTML = departmentsToShow.map((dept) => {
        const rows = tableData[dept] || [];
        if (!rows.length) {
            return `<div class="item"><h4>${dept}</h4><p>No rows available.</p></div>`;
        }

        const body = rows
            .sort((a, b) => (a.day || '').localeCompare(b.day || ''))
            .map(r => `
                <tr>
                    <td>${r.day || '-'}</td>
                    <td>${(r.slots && r.slots[0]) || '-'}</td>
                    <td>${(r.slots && r.slots[1]) || '-'}</td>
                    <td>${(r.slots && r.slots[2]) || '-'}</td>
                    <td>${(r.slots && r.slots[3]) || '-'}</td>
                    <td>${(r.slots && r.slots[4]) || '-'}</td>
                </tr>
            `).join('');

        return `
            <div class="item">
                <h4>${dept} Timetable</h4>
                <div class="table-wrap">
                    <table class="timetable-table">
                        <thead>
                            <tr>
                                <th>Day</th>
                                <th>Slot 1</th>
                                <th>Slot 2</th>
                                <th>Slot 3</th>
                                <th>Slot 4</th>
                                <th>Slot 5</th>
                            </tr>
                        </thead>
                        <tbody>${body}</tbody>
                    </table>
                </div>
            </div>
        `;
    }).join('');
}

function renderEvents() {
    const list = document.getElementById('featureItems');
    const saved = getStore(EVENTS_KEY, []);
    const { role, department } = getUserContext();

    const filtered = role === 'student' && department
        ? saved.filter(e => !e.audience || e.audience === 'all' || e.audience === department)
        : saved;

    const dynamicItems = filtered
        .slice()
        .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));
    const items = dynamicItems.length ? dynamicItems : MODULES.events.items;

    if (!items.length) {
        list.innerHTML = '<div class="item empty-item"><h4>No events available</h4><p>Faculty/admin has not posted any events yet.</p></div>';
        return;
    }

    list.innerHTML = items.map((item) => {
        const title = escapeHtml(item.title || 'Event');
        const desc = escapeHtml(item.description || item.text || '');
        const displayDate = formatDisplayDate(item.date, item.createdAt);
        const dateSpan = displayDate ? `<span class="event-meta-item">📅 ${displayDate}</span>` : '';
        const timeSpan = (item.time && item.time !== '--') ? `<span class="event-meta-item">⏰ ${escapeHtml(item.time)}</span>` : '';
        const venueSpan = item.venue ? `<span class="event-meta-item">📍 ${escapeHtml(item.venue)}</span>` : '';
        const audienceSpan = item.audience ? `<span class="event-meta-item">👥 ${escapeHtml(item.audience === 'all' ? 'All' : item.audience)}</span>` : '';
        
        return `
        <div class="event-card item">
            <h4>${title}</h4>
            <p>${desc}</p>
            ${(dateSpan || timeSpan || venueSpan || audienceSpan) ? `
            <div class="event-meta">
                ${dateSpan}${timeSpan}${venueSpan}${audienceSpan}
            </div>` : ''}
        </div>`;
    }).join('');
}

function renderNotifications() {
    const list = document.getElementById('featureItems');
    const saved = getStore(NOTIFICATIONS_KEY, []);
    const { role, department } = getUserContext();

    const filtered = role === 'student' && department
        ? saved.filter(n => !n.audience || n.audience === 'all' || n.audience === department)
        : saved;

    const dynamicItems = filtered
        .slice()
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    const items = dynamicItems.length ? dynamicItems : MODULES.notifications.items;

    if (!items.length) {
        list.innerHTML = '<div class="item empty-item"><h4>No notifications available</h4><p>There are no recent announcements.</p></div>';
        return;
    }

    list.innerHTML = items.map((item) => {
        const title = escapeHtml(item.title || 'Notification');
        const text = escapeHtml(item.message || item.text || '');
        const audienceSpan = item.audience ? `<span class="event-meta-item">👥 ${escapeHtml(item.audience === 'all' ? 'All' : item.audience)}</span>` : '';
        const displayDate = formatDisplayDate('', item.createdAt);
        const dateSpan = displayDate ? `<span class="event-meta-item">📅 ${displayDate}</span>` : '';
        
        return `
        <div class="event-card item notify">
            <h4>${title}</h4>
            <p>${text}</p>
            ${(audienceSpan || dateSpan) ? `
            <div class="event-meta" style="margin-top: 10px;">
                ${dateSpan}${audienceSpan}
            </div>` : ''}
        </div>`;
    }).join('');
}

function getModuleKey() {
    const key = (window.location.hash || '#schedule').replace('#', '').trim().toLowerCase();
    return MODULES[key] ? key : 'schedule';
}

function renderModule(moduleKey) {
    const moduleData = MODULES[moduleKey];
    document.title = `${moduleData.title} | UniMind`;

    document.getElementById('featureTitle').textContent = moduleData.title;
    document.getElementById('featureHeading').textContent = moduleData.title;
    document.getElementById('featureDescription').textContent = moduleData.description;

    const list = document.getElementById('featureItems');
    list.innerHTML = '';

    if (moduleKey === 'schedule') {
        renderScheduleTable();
        return;
    }
    if (moduleKey === 'events') {
        renderEvents();
        return;
    }
    if (moduleKey === 'notifications') {
        renderNotifications();
        return;
    }

    moduleData.items.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'item';
        card.innerHTML = `<h4>${item.title}</h4><p>${item.text}</p>`;
        list.appendChild(card);
    });
}

function setupSearch(moduleKey) {
    const input = document.getElementById('featureSearch');
    input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();

        if (moduleKey === 'schedule') {
            if (!q) {
                renderModule(moduleKey);
                return;
            }
            const rows = document.querySelectorAll('.timetable-table tbody tr');
            rows.forEach((row) => {
                const show = row.textContent.toLowerCase().includes(q);
                row.style.display = show ? '' : 'none';
            });
            return;
        }

        const items = document.querySelectorAll('.item-list .item');
        items.forEach((item) => {
            if (!q) {
                item.style.display = '';
                return;
            }
            const match = item.textContent.toLowerCase().includes(q);
            item.style.display = match ? '' : 'none';
        });
    });
}

function tickClock() {
    const now = new Date();
    const dateEl = document.getElementById('featureDate');
    const clockEl = document.getElementById('liveClock');
    if (dateEl) dateEl.textContent = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    if (clockEl) clockEl.textContent = now.toLocaleTimeString();
}

document.addEventListener('DOMContentLoaded', () => {
    const key = getModuleKey();
    renderModule(key);
    setupSearch(key);
    tickClock();
    setInterval(tickClock, 1000);

    window.addEventListener('hashchange', () => {
        const nextKey = getModuleKey();
        renderModule(nextKey);
        const search = document.getElementById('featureSearch');
        if (search) search.value = '';
    });

    const logoutBtn = document.getElementById('logoutBtnFeature');
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

    // React to changes from Teacher/Admin tabs automatically!
    window.addEventListener('storage', (e) => {
        if (['campusEventsStore', 'campusNotificationsStore', 'campusTimetableStore'].includes(e.key)) {
            const currentModule = getModuleKey();
            renderModule(currentModule);
        }
    });
});
