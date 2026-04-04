document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = window.location.origin.startsWith('http')
        ? `${window.location.origin}/api`
        : 'http://127.0.0.1:5000/api';

    // 1. Animated Counters for Quick Stats
    const counters = document.querySelectorAll('.counter');
    const speed = 200; // The lower the slower

    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const inc = target / speed;

            if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 15);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });

    // 2. Chatbot Interaction Logic
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const suggestionChips = document.querySelectorAll('.suggestion-chip');
    const clearChatBtn = document.getElementById('clear-chat');
    const chatStatus = document.getElementById('chat-status');
    const liveDateEl = document.getElementById('live-date');
    const liveTimeEl = document.getElementById('live-time');

    const summaryName = document.getElementById('summaryName');
    const summaryEmail = document.getElementById('summaryEmail');
    const summaryDepartment = document.getElementById('summaryDepartment');
    const summaryAge = document.getElementById('summaryAge');
    const summarySemester = document.getElementById('summarySemester');
    const summaryCompletion = document.getElementById('summaryCompletion');
    const profileCompletionText = document.getElementById('profileCompletionText');

    const openProfileModalBtn = document.getElementById('openProfileModal');
    const closeProfileModalBtn = document.getElementById('closeProfileModal');
    const profileModalBackdrop = document.getElementById('profileModalBackdrop');
    const dashboardProfileForm = document.getElementById('dashboardProfileForm');
    const profileModalStatus = document.getElementById('profileModalStatus');
    const goToFullProfileBtn = document.getElementById('goToFullProfile');

    const dashName = document.getElementById('dashName');
    const dashEmail = document.getElementById('dashEmail');
    const dashDepartment = document.getElementById('dashDepartment');
    const dashAge = document.getElementById('dashAge');
    const dashSemester = document.getElementById('dashSemester');

    const getOrCreateSessionId = () => {
        const existing = localStorage.getItem('chatSessionId');
        if (existing) return existing;

        const generated = (window.crypto && window.crypto.randomUUID)
            ? window.crypto.randomUUID()
            : `chat-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        localStorage.setItem('chatSessionId', generated);
        return generated;
    };

    const chatSessionId = getOrCreateSessionId();

    const updateStatus = (label, isBusy = false) => {
        if (!chatStatus) return;
        const statusDot = chatStatus.querySelector('.chat-status-dot');
        const statusText = chatStatus.querySelector('span:last-child');
        if (statusText) statusText.innerText = label;
        if (statusDot) {
            statusDot.classList.toggle('busy', isBusy);
        }
    };

    const getTimeLabel = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updateDateTimeWidget = () => {
        const now = new Date();
        if (liveDateEl) {
            liveDateEl.textContent = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
        }
        if (liveTimeEl) {
            liveTimeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    };

    const getStoredProfile = () => JSON.parse(localStorage.getItem('studentProfile') || '{}');

    const computeProfileCompletion = (profile) => {
        const fields = ['name', 'email', 'department', 'age', 'semester'];
        const filled = fields.filter((f) => String(profile[f] || '').trim()).length;
        return Math.round((filled / fields.length) * 100);
    };

    const fillModalFromProfile = (profile) => {
        if (dashName) dashName.value = profile.name || '';
        if (dashEmail) dashEmail.value = profile.email || '';
        if (dashDepartment) dashDepartment.value = profile.department || '';
        if (dashAge) dashAge.value = profile.age || '';
        if (dashSemester) dashSemester.value = profile.semester || '';
    };

    const renderProfileOverview = () => {
        const profile = getStoredProfile();
        const completion = computeProfileCompletion(profile);

        if (summaryName) summaryName.textContent = profile.name || 'Not set';
        if (summaryEmail) summaryEmail.textContent = profile.email || 'Not set';
        if (summaryDepartment) summaryDepartment.textContent = profile.department || 'Not set';
        if (summaryAge) summaryAge.textContent = profile.age || 'Not set';
        if (summarySemester) summarySemester.textContent = profile.semester ? `Semester ${profile.semester}` : 'Not set';
        if (summaryCompletion) summaryCompletion.textContent = `${completion}%`;

        if (profileCompletionText) {
            profileCompletionText.textContent = completion < 100
                ? 'Complete your profile to improve AI answers.'
                : 'Profile complete. AI can personalize answers using your details.';
        }

        if (suggestionChips && suggestionChips.length > 0 && profile.department && profile.semester) {
            suggestionChips[0].textContent = `${profile.department} Sem ${profile.semester} timetable`;
        }
    };

    const configureRoleViews = () => {
        const user = JSON.parse(localStorage.getItem('campusUser') || '{}');
        const role = String(user.role || 'student').toLowerCase();
        const staffPortalNav = document.getElementById('staffPortalNav');

        if (staffPortalNav) {
            staffPortalNav.style.display = (role === 'admin' || role === 'faculty') ? '' : 'none';
        }
    };

    const openProfileModal = () => {
        const profile = getStoredProfile();
        fillModalFromProfile(profile);
        if (profileModalStatus) profileModalStatus.textContent = '';
        if (profileModalBackdrop) profileModalBackdrop.classList.add('open');
    };

    const closeProfileModal = () => {
        if (profileModalBackdrop) profileModalBackdrop.classList.remove('open');
    };

    const hydrateUserProfile = () => {
        const user = JSON.parse(localStorage.getItem('campusUser') || '{}');
        const profile = getStoredProfile();
        const nameEl = document.querySelector('.user-name');
        const roleEl = document.querySelector('.user-role');
        if (nameEl) nameEl.textContent = profile.name || user.name || 'Guest User';
        if (roleEl) roleEl.textContent = user.role ? user.role[0].toUpperCase() + user.role.slice(1) : 'Visitor';
    };

    const appendMessage = (text, sender) => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.classList.add('bubble');
        bubbleDiv.innerText = text;

        const metaDiv = document.createElement('div');
        metaDiv.classList.add('message-meta');
        metaDiv.innerText = getTimeLabel();
        
        messageDiv.appendChild(bubbleDiv);
        messageDiv.appendChild(metaDiv);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const showTyping = () => {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('message', 'bot');
        typingDiv.id = `typing-${Date.now()}`;

        const bubbleDiv = document.createElement('div');
        bubbleDiv.classList.add('bubble');
        bubbleDiv.innerText = '...';

        typingDiv.appendChild(bubbleDiv);
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return typingDiv.id;
    };

    const removeTyping = (id) => {
        const el = document.getElementById(id);
        if (el) el.remove();
    };

    const languageSwitchMessages = {
        en: 'Language switched to English.',
        hi: 'भाषा हिंदी में बदल गई है। (Language switched to Hindi)',
        mr: 'भाषा मराठीत बदलली आहे. (Language switched to Marathi)',
        bn: 'ভাষা বাংলায় পরিবর্তন করা হয়েছে। (Language switched to Bengali)',
        ta: 'மொழி தமிழுக்கு மாற்றப்பட்டது. (Language switched to Tamil)',
        te: 'భాష తెలుగు కు మార్చబడింది. (Language switched to Telugu)',
        gu: 'ભાષા ગુજરાતી પર બદલી છે. (Language switched to Gujarati)',
        kn: 'ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ. (Language switched to Kannada)',
        ml: 'ഭാഷ മലയാളത്തിലേക്ക് മാറ്റി. (Language switched to Malayalam)',
        pa: 'ਭਾਸ਼ਾ ਪੰਜਾਬੀ ਵਿੱਚ ਬਦਲ ਦਿੱਤੀ ਗਈ ਹੈ। (Language switched to Punjabi)',
        or: 'ଭାଷା ଓଡ଼ିଆକୁ ପରିବର୍ତ୍ତନ କରାଗଲା। (Language switched to Odia)',
        as: 'ভাষা অসমীয়ালৈ সলনি কৰা হৈছে। (Language switched to Assamese)',
        ur: 'زبان اردو میں تبدیل کر دی گئی ہے۔ (Language switched to Urdu)',
    };

    const handleSend = async () => {
        const text = chatInput.value.trim();
        if (text) {
            // User message
            appendMessage(text, 'user');
            chatInput.value = '';
            chatInput.disabled = true;
            sendBtn.disabled = true;
            updateStatus('Thinking...', true);

            const typingId = showTyping();

            const user = JSON.parse(localStorage.getItem('campusUser') || '{}');
            const studentProfile = JSON.parse(localStorage.getItem('studentProfile') || '{}');
            const role = user.role || 'student';
            const language = (langSelect && langSelect.value) ? langSelect.value : 'en';

            try {
                const res = await fetch(`${API_BASE}/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: text,
                        language,
                        role,
                        session_id: chatSessionId,
                        user_profile: studentProfile,
                    }),
                });

                const data = await res.json();
                removeTyping(typingId);

                if (res.ok) {
                    appendMessage(data.reply || 'I did not receive a valid response.', 'bot');
                    updateStatus('Online');
                } else {
                    appendMessage(`Error: ${data.error || 'Request failed.'}`, 'bot');
                    updateStatus('Error');
                }
            } catch (error) {
                removeTyping(typingId);
                appendMessage('Cannot reach backend API. Start Flask server and retry.', 'bot');
                updateStatus('Offline');
            } finally {
                chatInput.disabled = false;
                sendBtn.disabled = false;
                chatInput.focus();
            }
        }
    };

    sendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    });

    suggestionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            chatInput.value = chip.innerText;
            handleSend();
        });
    });

    clearChatBtn.addEventListener('click', () => {
        chatMessages.innerHTML = `
            <div class="message bot">
                <div class="bubble">
                    Chat history cleared. How can I assist you ?
                </div>
                <div class="message-meta">${getTimeLabel()}</div>
            </div>`;

        fetch(`${API_BASE}/chat/memory/clear`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: chatSessionId }),
        }).catch(() => {});
    });

    if (openProfileModalBtn) {
        openProfileModalBtn.addEventListener('click', openProfileModal);
    }

    if (closeProfileModalBtn) {
        closeProfileModalBtn.addEventListener('click', closeProfileModal);
    }

    if (profileModalBackdrop) {
        profileModalBackdrop.addEventListener('click', (e) => {
            if (e.target === profileModalBackdrop) closeProfileModal();
        });
    }

    if (dashboardProfileForm) {
        dashboardProfileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nextProfile = {
                name: dashName ? dashName.value.trim() : '',
                email: dashEmail ? dashEmail.value.trim() : '',
                department: dashDepartment ? dashDepartment.value : '',
                age: dashAge ? dashAge.value.trim() : '',
                semester: dashSemester ? dashSemester.value : '',
            };

            localStorage.setItem('studentProfile', JSON.stringify(nextProfile));

            const user = JSON.parse(localStorage.getItem('campusUser') || '{}');
            if (nextProfile.name) user.name = nextProfile.name;
            if (nextProfile.email) user.email = nextProfile.email;
            localStorage.setItem('campusUser', JSON.stringify(user));

            if (profileModalStatus) {
                profileModalStatus.textContent = 'Profile saved successfully.';
            }

            hydrateUserProfile();
            renderProfileOverview();
            setTimeout(closeProfileModal, 700);
        });
    }

    if (goToFullProfileBtn) {
        goToFullProfileBtn.addEventListener('click', () => {
            window.location.href = 'profile.html';
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeProfileModal();
    });

    // 3. Language Selector Simulation
    const langSelect = document.getElementById('lang-select');
    const langCards = document.querySelectorAll('.lang-card');

    langSelect.addEventListener('change', (e) => {
        const selectedLang = e.target.value; // 'en', 'hi', 'mr'
        
        langCards.forEach(card => {
            card.classList.remove('active');
            const code = card.querySelector('.lang-code').innerText.toLowerCase();
            if (code === selectedLang) {
                card.classList.add('active');
            }
        });

        const botMsg = languageSwitchMessages[selectedLang] || languageSwitchMessages.en;

        appendMessage(botMsg, "bot");
    });

    const setupLogout = () => {
        const logoutBtn = document.getElementById('logoutBtn');
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
    };

    updateStatus('Online');
    updateDateTimeWidget();
    setInterval(updateDateTimeWidget, 1000);
    hydrateUserProfile();
    renderProfileOverview();
    configureRoleViews();
    setupLogout();
});
