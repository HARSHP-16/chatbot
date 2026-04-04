const API_BASE = 'http://127.0.0.1:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------
    // Navbar Scroll Effect
    // -------------------------------------------------------
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 20);
        });
    }

    // -------------------------------------------------------
    // Scroll Reveal
    // -------------------------------------------------------
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // -------------------------------------------------------
    // Role Selector (Auth pages)
    // -------------------------------------------------------
    const roleBtns = document.querySelectorAll('.role-btn');
    roleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            roleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // -------------------------------------------------------
    // LOGIN FORM → Flask API
    // -------------------------------------------------------
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email    = loginForm.querySelector('input[type="email"]').value.trim();
            const password = loginForm.querySelector('input[type="password"]').value.trim();
            const role     = document.querySelector('.role-btn.active')?.textContent.trim().toLowerCase() || 'student';
            const errEl    = document.getElementById('loginError');
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            submitBtn.textContent = 'Signing in...';
            submitBtn.disabled = true;

            try {
                const res  = await fetch(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();

                if (res.ok) {
                    // Store session info
                    localStorage.setItem('campusUser', JSON.stringify({
                        name: data.name,
                        role: data.role,
                        email: email
                    }));
                    window.location.href = 'dashboard.html';
                } else {
                    if (errEl) { errEl.textContent = data.error || 'Login failed.'; errEl.style.display = 'block'; }
                }
            } catch (err) {
                if (errEl) { errEl.textContent = 'Cannot connect to server. Make sure Flask is running.'; errEl.style.display = 'block'; }
            } finally {
                submitBtn.textContent = 'Sign In';
                submitBtn.disabled = false;
            }
        });
    }

    // -------------------------------------------------------
    // REGISTER FORM → Flask API
    // -------------------------------------------------------
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name     = registerForm.querySelector('input[type="text"]').value.trim();
            const email    = registerForm.querySelector('input[type="email"]').value.trim();
            const password = document.getElementById('regPassword').value.trim();
            const confirm  = document.getElementById('regConfirm').value.trim();
            const role     = document.querySelector('.role-btn.active')?.textContent.trim().toLowerCase() || 'student';
            const errEl    = document.getElementById('passwordMatchError');
            const submitBtn = registerForm.querySelector('button[type="submit"]');

            if (password !== confirm) {
                if (errEl) { errEl.textContent = 'Passwords do not match!'; errEl.style.display = 'block'; }
                return;
            }
            if (errEl) errEl.style.display = 'none';

            submitBtn.textContent = 'Creating account...';
            submitBtn.disabled = true;

            try {
                const res  = await fetch(`${API_BASE}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, role })
                });
                const data = await res.json();

                if (res.ok) {
                    alert(data.message);
                    window.location.href = 'login.html';
                } else {
                    if (errEl) { errEl.textContent = data.error || 'Registration failed.'; errEl.style.display = 'block'; }
                }
            } catch (err) {
                if (errEl) { errEl.textContent = 'Cannot connect to server. Make sure Flask is running.'; errEl.style.display = 'block'; }
            } finally {
                submitBtn.textContent = 'Register';
                submitBtn.disabled = false;
            }
        });
    }

    // -------------------------------------------------------
    // CHATBOT UI TOGGLE
    // -------------------------------------------------------
    const toggleChatBtn = document.getElementById('toggleChatBtn');
    const chatbotPanel  = document.getElementById('chatbotPanel');
    const closeChatBtn  = document.getElementById('closeChatBtn');
    const chatInput     = document.getElementById('chatInput');
    const sendBtn       = document.getElementById('sendBtn');
    const chatBody      = document.getElementById('chatBody');
    const langSelect    = document.getElementById('langSelect');
    const promptChips   = document.querySelectorAll('.prompt-chip');

    if (toggleChatBtn && chatbotPanel && closeChatBtn) {
        toggleChatBtn.addEventListener('click', () => {
            chatbotPanel.classList.add('active');
            if (chatInput) setTimeout(() => chatInput.focus(), 300);
        });
        closeChatBtn.addEventListener('click', () => {
            chatbotPanel.classList.remove('active');
        });
    }

    if (promptChips) {
        promptChips.forEach(chip => {
            chip.addEventListener('click', () => {
                if (chatInput) {
                    chatInput.value = chip.textContent.trim();
                    handleUserMessage();
                }
            });
        });
    }

    if (sendBtn && chatInput) {
        sendBtn.addEventListener('click', handleUserMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleUserMessage();
        });
    }

    // -------------------------------------------------------
    // CHAT → Flask API (Real AI)
    // -------------------------------------------------------
    async function handleUserMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        addUserMessage(text);
        chatInput.value = '';

        const typingId = showTypingIndicator();
        const language = langSelect ? langSelect.value : 'en';

        // Get role from localStorage (set after login), default to student
        const user = JSON.parse(localStorage.getItem('campusUser') || '{}');
        const role = user.role || 'student';

        try {
            const res  = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, language, role })
            });
            const data = await res.json();

            removeTypingIndicator(typingId);

            if (res.ok) {
                addBotMessage(data.reply);
            } else {
                addBotMessage(`⚠️ Error: ${data.error || 'Something went wrong.'}`);
            }
        } catch (err) {
            removeTypingIndicator(typingId);
            addBotMessage('⚠️ Cannot reach the server. Make sure Flask is running on port 5000.');
        }
    }

    // -------------------------------------------------------
    // Chat DOM helpers
    // -------------------------------------------------------
    function addUserMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message msg-user';
        msgDiv.innerHTML = `<div class="chat-bubble">${escapeHTML(text)}</div>`;
        chatBody.appendChild(msgDiv);
        scrollToBottom();
    }

    function addBotMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message msg-bot';
        msgDiv.style.animation = "slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards";
        msgDiv.innerHTML = `<div class="chat-bubble">${text}</div>`;
        chatBody.appendChild(msgDiv);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message msg-bot';
        msgDiv.id = id;
        msgDiv.style.animation = "slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards";
        msgDiv.innerHTML = `
            <div class="chat-bubble">
                <div class="typing-dots">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                </div>
            </div>`;
        chatBody.appendChild(msgDiv);
        scrollToBottom();
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(10px)';
            setTimeout(() => el.remove(), 300);
        }
    }

    function scrollToBottom() {
        if (chatBody) chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: 'smooth' });
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag])
        );
    }
});
