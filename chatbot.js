const CB_API_URL = 'http://localhost:3000/api'; // Update this for production

const chatbotHTML = `
  <button id="cb-trigger" aria-label="Toggle Chatbot">
    <svg class="icon-chat" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/></svg>
    <svg class="icon-close" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
  </button>

  <div id="cb-window">
    <div class="cb-header">
      <div class="cb-avatar">AI</div>
      <div class="cb-header-info">
        <h3>Transformation Assistant</h3>
        <p><span class="cb-status-dot"></span> Online</p>
      </div>
    </div>
    <div class="cb-body" id="cb-body">
      <!-- Initial Message -->
      <div class="cb-msg cb-msg-bot">
        Welcome to MyTekX. I’m your AI Transformation Assistant. How can I help accelerate your enterprise operations today?
        <div class="cb-quick-actions" id="cb-qa-container">
          <button class="cb-qa-btn">SAP Migration</button>
          <button class="cb-qa-btn">ERP Modernization</button>
          <button class="cb-qa-btn">Cloud Transformation</button>
          <button class="cb-qa-btn">SAP Consulting</button>
        </div>
      </div>
      
      <div class="cb-typing" id="cb-typing">
        <div class="cb-dot"></div>
        <div class="cb-dot"></div>
        <div class="cb-dot"></div>
      </div>
    </div>

    <div class="cb-footer">
      <div class="cb-input-wrap">
        <input type="text" id="cb-input" placeholder="Type your message..." autocomplete="off">
        <button id="cb-send" aria-label="Send">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  </div>
`;

// Inject HTML into body
document.body.insertAdjacentHTML('beforeend', chatbotHTML);

const cbTrigger = document.getElementById('cb-trigger');
const cbWindow = document.getElementById('cb-window');
const cbInput = document.getElementById('cb-input');
const cbSend = document.getElementById('cb-send');
const cbBody = document.getElementById('cb-body');
const cbTyping = document.getElementById('cb-typing');
const qaContainer = document.getElementById('cb-qa-container');

let chatHistory = [];

// Toggle Widget
cbTrigger.addEventListener('click', () => {
  const isOpen = cbWindow.classList.contains('open');
  if (isOpen) {
    cbWindow.classList.remove('open');
    cbTrigger.classList.remove('open');
  } else {
    cbWindow.classList.add('open');
    cbTrigger.classList.add('open');
    cbInput.focus();
  }
});

// Append Message to UI
function appendMessage(sender, text) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `cb-msg cb-msg-${sender}`;
  
  // Basic markdown-like parsing (bold and links)
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  msgDiv.innerHTML = formattedText;
  
  // Insert before typing indicator
  cbBody.insertBefore(msgDiv, cbTyping);
  cbBody.scrollTop = cbBody.scrollHeight;
}

// Show/Hide Typing Indicator
function setTyping(isTyping) {
  if (isTyping) {
    cbTyping.classList.add('show');
    cbSend.disabled = true;
  } else {
    cbTyping.classList.remove('show');
    cbSend.disabled = false;
  }
  cbBody.scrollTop = cbBody.scrollHeight;
}

// Send Message Logic
async function sendMessage(text) {
  if (!text.trim()) return;

  // Append user message
  appendMessage('user', text);
  cbInput.value = '';
  
  // Remove Quick Actions after first message
  if (qaContainer) qaContainer.style.display = 'none';

  setTyping(true);

  try {
    const response = await fetch(`${CB_API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        history: chatHistory
      })
    });

    if (!response.ok) throw new Error('Network error');

    const data = await response.json();
    
    // Append bot response
    appendMessage('bot', data.reply);

    // Update History
    chatHistory.push({ role: 'user', content: text });
    chatHistory.push({ role: 'model', content: data.reply });

  } catch (error) {
    console.error('Chat error:', error);
    appendMessage('bot', 'Sorry, I am having trouble connecting right now. Please try again later.');
  } finally {
    setTyping(false);
  }
}

// Event Listeners for Input
cbSend.addEventListener('click', () => sendMessage(cbInput.value));

cbInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage(cbInput.value);
  }
});

// Event Listeners for Quick Actions
document.querySelectorAll('.cb-qa-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    sendMessage(btn.innerText);
  });
});
