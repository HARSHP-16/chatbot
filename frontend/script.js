const API_URL = 'http://127.0.0.1:5000/api/chat';

const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');
const langSelect = document.getElementById('language-select');

// Helper to escape HTML and format text (basic markdown to HTML logic can go here)
function formatText(text) {
    return text.replace(/\n/g, '<br/>')
               .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

// Render a message
function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);

    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    avatar.textContent = sender === 'user' ? 'S' : '🤖';

    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    bubble.innerHTML = formatText(text);

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);

    chatMessages.appendChild(msgDiv);
    // Smooth scroll to bottom
    chatMessages.parentElement.scrollTo({
        top: chatMessages.parentElement.scrollHeight,
        behavior: 'smooth'
    });
}

// Render typing indicator
function showTypingIndicator() {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', 'bot');
    msgDiv.id = 'typing-indicator';

    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    avatar.textContent = '🤖';

    const bubble = document.createElement('div');
    bubble.classList.add('typing');
    bubble.style.display = 'flex';
    
    // Add dots
    for(let i=0; i<3; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        bubble.appendChild(dot);
    }

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
    chatMessages.appendChild(msgDiv);
    chatMessages.parentElement.scrollTo({
        top: chatMessages.parentElement.scrollHeight,
        behavior: 'smooth'
    });
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if(indicator) indicator.remove();
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const message = chatInput.value.trim();
    if (!message) return;

    // 1. Show User message
    appendMessage('user', message);
    chatInput.value = '';
    
    // 2. Show Typing Indicator
    showTypingIndicator();

    const selectedLang = langSelect.value; // 'en', 'hi', 'mr'

    try {
        // 3. Fetch from API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                language: selectedLang
            })
        });

        const data = await response.json();
        removeTypingIndicator();

        if (response.ok) {
            appendMessage('bot', data.reply);
        } else {
            appendMessage('bot', `Error: ${data.error || 'Something went wrong.'}`);
        }
    } catch (error) {
        removeTypingIndicator();
        console.error("API Call failed:", error);
        appendMessage('bot', 'Network error. Make sure the Flask backend is running on port 5000.');
    }
});
