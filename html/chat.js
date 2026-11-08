const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const apiKeyInput = document.getElementById('api-key');
const modelSelect = document.getElementById('model-select');
const sendBtn = document.getElementById('send-btn');

userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight - 4) + 'px';
});

async function sendMessage() {
    const text = userInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    const model = modelSelect.value;

    if (!text) return;
    if (!apiKey) {
        appendMessage('Система: Пожалуйста, введите ваш Gemini API ключ в поле сверху.', 'system-error');
        return;
    }

    userInput.value = '';
    userInput.style.height = '24px';
    userInput.disabled = true;
    sendBtn.disabled = true;

    appendMessage(text, 'user');

    const botMessageDiv = appendMessage('Думаю...', 'model');

    try {
        const response = await fetch(`/v1beta/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: text }] }]
            })
        });

        const data = await response.json();

        if (response.ok) {
            botMessageDiv.innerText = '';
            const parts = data.candidates?.[0]?.content?.parts || [];
            let hasContent = false;

            parts.forEach(part => {
                if (part.text) {
                    hasContent = true;
                    const textElement = document.createElement('div');
                    textElement.innerText = part.text;
                    if (model.includes('transcribe')) {
                        textElement.className = 'subtitles';
                    }
                    botMessageDiv.appendChild(textElement);
                }
                if (part.inlineData) {
                    hasContent = true;
                    const mimeType = part.inlineData.mimeType || '';
                    const base64Data = part.inlineData.data;
                    if (mimeType.startsWith('image/')) {
                        const img = document.createElement('img');
                        img.className = 'media-content';
                        img.src = `data:${mimeType};base64,${base64Data}`;
                        botMessageDiv.appendChild(img);
                    } else if (mimeType.startsWith('audio/')) {
                        const audio = document.createElement('audio');
                        audio.className = 'media-content';
                        audio.controls = true;
                        audio.src = `data:${mimeType};base64,${base64Data}`;
                        botMessageDiv.appendChild(audio);
                    }
                }
            });

            if (!hasContent) {
                botMessageDiv.innerText = 'Получен пустой ответ.';
            }
        } else {
            botMessageDiv.className = 'message system-error';
            botMessageDiv.innerText = `Ошибка API: ${data.error?.message || response.statusText}`;
        }

    } catch (error) {
        botMessageDiv.className = 'message system-error';
        botMessageDiv.innerText = `Ошибка сети/прокси: ${error.message}`;
    } finally {
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

function appendMessage(text, className) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${className}`;
    messageDiv.innerText = text;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return messageDiv;
}

userInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
