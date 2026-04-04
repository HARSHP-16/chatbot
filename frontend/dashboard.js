document.addEventListener('DOMContentLoaded', () => {
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

    const appendMessage = (text, sender) => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.classList.add('bubble');
        bubbleDiv.innerText = text;
        
        messageDiv.appendChild(bubbleDiv);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const handleSend = () => {
        const text = chatInput.value.trim();
        if (text) {
            // User message
            appendMessage(text, 'user');
            chatInput.value = '';

            // Simulate Bot Response
            setTimeout(() => {
                const responses = [
                    "I can certainly help you find that on campus. Let me pull up the map.",
                    "The upcoming placement drive is scheduled for next week. You can find more details in the Placement Cell tab.",
                    "Here is today's academic timetable based on your department.",
                    "Hostel maintenance has registered your request. Expect a resolution within 24 hours.",
                    "Multilingual AI system is processing your inquiry..."
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                appendMessage(randomResponse, 'bot');
            }, 1000);
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
            </div>`;
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

        // Simulate translation message
        let botMsg = "Language switched to English.";
        if (selectedLang === 'hi') botMsg = "भाषा हिंदी में बदल गई है। (Language switched to Hindi)";
        if (selectedLang === 'mr') botMsg = "भाषा मराठीत बदलली आहे. (Language switched to Marathi)";

        appendMessage(botMsg, "bot");
    });
});
