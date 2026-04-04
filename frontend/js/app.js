document.addEventListener('DOMContentLoaded', () => {
    // Scroll Reveal Animation
    const reveals = document.querySelectorAll('.reveal');
    const toggleChatBtn = document.getElementById('toggleChatBtn');
    const chatbotPanel = document.getElementById('chatbotPanel');
    const closeChatBtn = document.getElementById('closeChatBtn');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatBody = document.getElementById('chatBody');
    const langSelect = document.getElementById('langSelect');
    const promptChips = document.querySelectorAll('.prompt-chip');

    // Observer for fade in scroll animations
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    reveals.forEach(reveal => revealObserver.observe(reveal));

    // Chatbot UI Toggle
    if (toggleChatBtn && chatbotPanel && closeChatBtn) {
        toggleChatBtn.addEventListener('click', () => {
            chatbotPanel.classList.add('active');
        });

        closeChatBtn.addEventListener('click', () => {
            chatbotPanel.classList.remove('active');
        });
    }

    // Role Selector Logic for Auth pages
    const roleBtns = document.querySelectorAll('.role-btn');
    roleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            roleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Store selected role if needed (e.g., in a hidden input)
        });
    });

    // Chatbot Logic
    let sessionMemory = {
        lastIntent: null,
        language: 'en' // en, hi, mr
    };

    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            sessionMemory.language = e.target.value;
            // Provide feedback on language change
            addBotMessage(getGreeting(sessionMemory.language));
        });
    }

    if (sendBtn && chatInput) {
        sendBtn.addEventListener('click', handleUserMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleUserMessage();
        });
    }

    if (promptChips) {
        promptChips.forEach(chip => {
            chip.addEventListener('click', () => {
                if(chatInput) {
                    chatInput.value = chip.textContent.trim();
                    handleUserMessage();
                }
            });
        });
    }

    function handleUserMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Add user message to UI
        addUserMessage(text);
        chatInput.value = '';

        // Show typing indicator
        const typingId = showTypingIndicator();

        // Simulate network delay
        setTimeout(() => {
            removeTypingIndicator(typingId);
            processBotResponse(text);
        }, 1000 + Math.random() * 1000);
    }

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
        msgDiv.innerHTML = `<div class="chat-bubble">${text}</div>`;
        chatBody.appendChild(msgDiv);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message msg-bot';
        msgDiv.id = id;
        msgDiv.innerHTML = `
            <div class="chat-bubble flex">
                <div class="typing-dots">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                </div>
            </div>
        `;
        chatBody.appendChild(msgDiv);
        scrollToBottom();
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function scrollToBottom() {
        if(chatBody) chatBody.scrollTop = chatBody.scrollHeight;
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag])
        );
    }

    // Bot Response Engine
    function processBotResponse(query) {
        query = query.toLowerCase();
        let intent = detectIntent(query);
        let language = sessionMemory.language;

        // Follow-up context check
        if (intent === 'followup' && sessionMemory.lastIntent) {
            intent = sessionMemory.lastIntent + '_followup';
        } else if (intent !== 'unknown' && intent !== 'followup' && intent !== 'greeting') {
            sessionMemory.lastIntent = intent;
        }

        const response = getResponseDict(intent, language);
        addBotMessage(response);
    }

    function detectIntent(q) {
        if (/(hi|hello|hey|namaste|hello|hola|greeting)/i.test(q)) return 'greeting';
        if (/(exam|tests|mid-sem|mid sem|finals)/i.test(q)) return 'exam';
        if (/(timetable|schedule|classes|lectures|dbms|subject)/i.test(q)) return 'timetable';
        if (/(announcement|news|update|event)/i.test(q)) return 'announcements';
        if (/(complaint|issue|wifi|hostel|cleaning|broken)/i.test(q)) return 'complaint';
        if (/(placement|jobs|internship|companies|recruitment)/i.test(q)) return 'placements';
        if (/(faculty|prof|teacher|hod|contact)/i.test(q)) return 'faculty';
        if (/(navigate|where|map|location|building|hall)/i.test(q)) return 'navigation';
        if (/(tomorrow|what about|and next|then)/i.test(q)) return 'followup';
        return 'unknown';
    }

    function getGreeting(lang) {
        if (lang === 'hi') return "नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?";
        if (lang === 'mr') return "नमस्कार! मी तुम्हाला कशी मदत करू शकतो?";
        return "Hello! How can I assist you today?";
    }

    function getResponseDict(intent, lang) {
        const responses = {
            'greeting': {
                'en': 'Hello! I am UniMind AI. How can I help you regarding campus, exams, or anything else?',
                'hi': 'नमस्ते! मैं UniMind AI हूँ। मैं कैंपस या परीक्षा के बारे में आपकी कैसे मदद कर सकता हूँ?',
                'mr': 'नमस्कार! मी UniMind AI आहे. मी कॅम्पस किंवा परीक्षेबद्दल तुम्हाला कशी मदत करू शकतो?'
            },
            'exam': {
                'en': '<strong>Mid-sem exams start from Monday.</strong> Make sure to carry your ID card.',
                'hi': '<strong>मिड-सेम परीक्षा सोमवार से शुरू हो रही है।</strong> अपना आईडी कार्ड साथ लाना न भूलें।',
                'mr': '<strong>मिड-सेम परीक्षा सोमवारपासून सुरू होत आहे.</strong> आपले ओळखपत्र सोबत आणायला विसरू नका.'
            },
            'exam_followup': {
                'en': 'The detailed schedule has been mailed to you, but your first paper is Computer Networks.',
                'hi': 'विस्तृत कार्यक्रम आपको मेल कर दिया गया है, लेकिन आपका पहला पेपर कंप्यूटर नेटवर्क का है।',
                'mr': 'सविस्तर वेळापत्रक तुम्हाला मेल केले आहे, पण तुमचा पहिला पेपर कॉम्प्युटर नेटवर्क्सचा आहे.'
            },
            'timetable': {
                'en': 'Today: <strong>DBMS</strong> at 10 AM, <strong>AI Lab</strong> at 1 PM.',
                'hi': 'आज: सुबह 10 बजे <strong>DBMS</strong>, दोपहर 1 बजे <strong>AI Lab</strong>।',
                'mr': 'आज: सकाळी 10 वाजता <strong>DBMS</strong>, दुपारी 1 वाजता <strong>AI Lab</strong>.'
            },
            'timetable_followup': {
                'en': 'Tomorrow you have Operating Systems at 9 AM in Room 402.',
                'hi': 'कल सुबह 9 बजे कमरा नंबर 402 में आपका ऑपरेटिंग सिस्टम का क्लास है।',
                'mr': 'उद्या सकाळी 9 वाजता रूम नंबर 402 मध्ये तुमचा ऑपरेटिंग सिस्टीमचा क्लास आहे.'
            },
            'complaint': {
                'en': 'Your complaint has been formally registered. A ticket number #4089 has been sent to your mail.',
                'hi': 'आपकी शिकायत औपचारिक रूप से दर्ज कर ली गई है। आपको मेल पर एक टिकट नंबर #4089 भेजा गया है।',
                'mr': 'तुमची तक्रार अधिकृतपणे नोंदवली गेली आहे. तुमच्या मेलवर तिकीट क्रमांक #4089 पाठवण्यात आला आहे.'
            },
            'placements': {
                'en': 'Google and Microsoft are visiting campus next week. Deadline to apply is Friday.',
                'hi': 'Google और Microsoft अगले सप्ताह कैंपस आ रहे हैं। आवेदन करने की अंतिम तिथि शुक्रवार है।',
                'mr': 'Google आणि Microsoft पुढच्या आठवड्यात कॅम्पसमध्ये येत आहेत. अर्ज करण्याची शेवटची तारीख शुक्रवार आहे.'
            },
            'faculty': {
                'en': 'Prof. Sharma is on leave today. Prof. Verma is available in Cabin 204 from 2-4 PM.',
                'hi': 'प्रो. शर्मा आज छुट्टी पर हैं। प्रो. वर्मा केबिन 204 में दोपहर 2-4 बजे तक उपलब्ध हैं।',
                'mr': 'प्रो. शर्मा आज रजेवर आहेत. प्रो. वर्मा केबिन 204 मध्ये दुपारी 2-4 पर्यंत उपलब्ध आहेत.'
            },
            'navigation': {
                'en': 'The Library is located behind the CS building. Walk straight past the fountain.',
                'hi': 'पुस्तकालय सीएस भवन के पीछे स्थित है। फव्वारे के पार सीधे चलें।',
                'mr': 'ग्रंथालय सीएस इमारतीच्या मागे आहे. कारंज्याच्या पलीकडे सरळ चालत जा.'
            },
            'unknown': {
                'en': "I'm sorry, I didn't quite catch that. Could you ask about exams, timetable, complaints, or faculty?",
                'hi': "मुझे खेद है, मुझे यह समझ नहीं आया। क्या आप परीक्षा, टाइमटेबल, या शिकायत के बारे में पूछना चाहते हैं?",
                'mr': "मला माफ करा, मला ते समजले नाही. तुम्ही परीक्षा, वेळापत्रक, तक्रार याबद्दल विचारू शकाल का?"
            }
        };

        const fallback = {
            'en': "I am still learning! Please contact the admin for this detail.",
            'hi': "मैं अभी सीख रहा हूँ! कृपया इस विवरण के लिए व्यवस्थापक से संपर्क करें।",
            'mr': "मी अजूनही शिकत आहे! कृपया या तपशीलासाठी अ‍ॅडमिनशी संपर्क साधा."
        };

        if (responses[intent] && responses[intent][lang]) {
            return responses[intent][lang];
        } else if (responses[intent] && responses[intent]['en']) {
            // fallback to english
            return responses[intent]['en'];
        }
        
        return fallback[lang] || fallback['en'];
    }
});
