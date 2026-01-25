// DMC object is now defined in dmc.js

// Commenting out the duplicate DMC definition
/*
const DMC = {
    // ... entire object definition ...
};
*/

// Add event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active'); // Use 'active' or 'show' consistently
        });
    }

    // Initialize dark mode using DMC from dmc.js
    if (typeof DMC !== 'undefined' && DMC.initDarkMode) {
        DMC.initDarkMode();
    } else {
        console.warn('DMC object not found, dark mode initialization skipped.');
    }

    // MathJax typesetting if available
    if (typeof window.MathJax !== 'undefined' && MathJax.Hub) {
         MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    }

    console.log("Main JS loaded and initialized.");

    // Replace the chatbotBtn creation code with a modern, branded button
    const chatbotBtn = document.createElement('button');
    chatbotBtn.id = 'chatbot-toggle';
    chatbotBtn.title = 'Ask AI';
    chatbotBtn.setAttribute('aria-label', 'Open AI Chatbot');
    chatbotBtn.style.position = 'fixed';
    chatbotBtn.style.bottom = '2rem';
    chatbotBtn.style.right = '2rem';
    chatbotBtn.style.zIndex = '1999';
    chatbotBtn.style.borderRadius = '50%';
    chatbotBtn.style.width = '3.5rem';
    chatbotBtn.style.height = '3.5rem';
    chatbotBtn.style.display = 'flex';
    chatbotBtn.style.alignItems = 'center';
    chatbotBtn.style.justifyContent = 'center';
    chatbotBtn.style.boxShadow = 'none';
    chatbotBtn.style.background = 'linear-gradient(135deg,#6366f1 60%,#818cf8 100%)';
    chatbotBtn.style.color = '#fff';
    chatbotBtn.style.border = 'none';
    chatbotBtn.style.fontSize = '1.7rem';
    chatbotBtn.style.cursor = 'pointer';
    chatbotBtn.innerHTML = '<i class="fas fa-brain"></i>';
    document.body.appendChild(chatbotBtn);

    // Add hover/focus CSS for the button
    const chatbotBtnStyle = document.createElement('style');
    chatbotBtnStyle.innerHTML = `
    #chatbot-toggle:hover, #chatbot-toggle:focus {
        background: linear-gradient(135deg,#4f46e5,#6366f1);
        box-shadow: none;
        outline: none;
        border: none;
    }
    `;
    document.head.appendChild(chatbotBtnStyle);

    const chatbotWidget = document.createElement('div');
    chatbotWidget.id = 'chatbot-widget';
    chatbotWidget.innerHTML = `
        <div id="chatbot-header">
            <div class="chatbot-header-left">
                <span class="chatbot-logo"><i class="fas fa-robot"></i></span>
                <span class="chatbot-title">Discrete Math AI</span>
            </div>
            <span id="chatbot-close">&times;</span>
        </div>
        <div id="chatbot-messages"></div>
        <form id="chatbot-form" autocomplete="off">
            <input id="chatbot-input" type="text" placeholder="Ask a discrete math question..." maxlength="500" autocomplete="off">
            <button type="submit" title="Send"><i class="fas fa-paper-plane"></i></button>
        </form>
        <div id="chatbot-footer">
            <span class="powered-by">Powered by <span class="openrouter-badge">OpenRouter AI</span></span>
        </div>
    `;
    document.body.appendChild(chatbotWidget);

    const messagesDiv = document.getElementById('chatbot-messages');
    const form = document.getElementById('chatbot-form');
    const input = document.getElementById('chatbot-input');

    chatbotBtn.onclick = () => {
        chatbotWidget.style.display = 'flex';
        chatbotBtn.style.display = 'none';
        setTimeout(() => { input.focus(); }, 200);
    };
    document.getElementById('chatbot-close').onclick = () => {
        chatbotWidget.style.display = 'none';
        chatbotBtn.style.display = 'block';
    };

    let conversation = [];
    let typingIndicator = null;

    function renderMathJax(el) {
        if (window.MathJax && el) {
            window.MathJax.typesetPromise([el]);
        }
    }

    function appendMessage(text, sender, opts = {}) {
        const msg = document.createElement('div');
        msg.className = 'chatbot-msg-bubble chatbot-msg-' + sender;
        msg.setAttribute('tabindex', '0');
        msg.setAttribute('role', 'article');
        msg.style.animation = 'chatbot-msg-in 0.22s';
        let avatar = document.createElement('span');
        avatar.className = 'chatbot-avatar';
        avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        let bubble = document.createElement('span');
        bubble.className = 'chatbot-bubble-inner';
        if (sender === 'assistant') {
            if (window.marked) {
                bubble.innerHTML = window.marked.parse(text);
            } else {
                bubble.innerHTML = text;
            }
        } else {
            bubble.textContent = text;
        }
        msg.appendChild(avatar);
        msg.appendChild(bubble);
        if (sender === 'assistant' && opts.copyable !== false) {
            let copyBtn = document.createElement('button');
            copyBtn.className = 'chatbot-copy-btn';
            copyBtn.title = 'Copy to clipboard';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(bubble.textContent || bubble.innerText || '');
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => copyBtn.innerHTML = '<i class="fas fa-copy"></i>', 1200);
            };
            msg.appendChild(copyBtn);
        }
        messagesDiv.appendChild(msg);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        if (sender === 'assistant') {
            renderMathJax(bubble);
        }
    }

    function showTypingIndicator() {
        if (typingIndicator) return;
        typingIndicator = document.createElement('div');
        typingIndicator.className = 'chatbot-msg-bubble chatbot-msg-assistant chatbot-typing';
        typingIndicator.innerHTML = '<span class="chatbot-avatar"><i class="fas fa-robot"></i></span><span class="chatbot-bubble-inner"><span class="typing-dots"><span></span><span></span><span></span></span></span>';
        messagesDiv.appendChild(typingIndicator);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function hideTypingIndicator() {
        if (typingIndicator) {
            messagesDiv.removeChild(typingIndicator);
            typingIndicator = null;
        }
    }

    function renderConversation() {
        messagesDiv.innerHTML = '';
        for (const m of conversation) {
            if (m.role === 'user') appendMessage(m.content, 'user');
            else appendMessage(m.content, 'assistant', {html: true});
        }
    }

    form.onsubmit = async function(e) {
        e.preventDefault();
        const userMsg = input.value.trim();
        if (!userMsg) return;
        appendMessage(userMsg, 'user');
        conversation.push({role: 'user', content: userMsg});
        input.value = '';
        showTypingIndicator();
        // Frontend validation: ensure conversation is a non-empty array of {role, content}
        if (!Array.isArray(conversation) || conversation.length === 0 || !conversation.every(m => m && typeof m === 'object' && 'role' in m && 'content' in m)) {
            hideTypingIndicator();
            appendMessage('Error: Conversation is empty or malformed.', 'assistant');
            return;
        }
        try {
            const res = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({messages: conversation})
            });
            const data = await res.json();
            hideTypingIndicator();
            if (data.reply) {
                appendMessage(data.reply, 'assistant', {html: true});
                conversation.push({role: 'assistant', content: data.reply});
            } else {
                appendMessage('Error: ' + (data.error || 'No reply'), 'assistant');
            }
        } catch (err) {
            hideTypingIndicator();
            appendMessage('Error: ' + err.message, 'assistant');
        }
    };

    chatbotWidget.style.display = 'none';
    chatbotWidget.style.flexDirection = 'column';
    chatbotWidget.style.justifyContent = 'flex-end';
    chatbotWidget.style.overflow = 'hidden';

    chatbotBtn.style.width = '68px';
    chatbotBtn.style.height = '68px';
    chatbotBtn.style.borderRadius = '50%';
    chatbotBtn.style.background = 'transparent';
    chatbotBtn.style.display = 'flex';
    chatbotBtn.style.alignItems = 'center';
    chatbotBtn.style.justifyContent = 'center';
    chatbotBtn.style.boxShadow = '0 4px 32px rgba(99,102,241,0.18)';
    chatbotBtn.style.transition = 'box-shadow 0.2s, transform 0.2s';
    chatbotBtn.style.padding = '0';
    chatbotBtn.style.border = 'none';
    chatbotBtn.style.cursor = 'pointer';
    chatbotBtn.style.position = 'fixed';
    chatbotBtn.style.bottom = '24px';
    chatbotBtn.style.left = '24px';
    chatbotBtn.style.zIndex = '9999';
    chatbotBtn.onmouseenter = () => {
        chatbotBtn.style.boxShadow = '0 8px 40px 0 rgba(99,102,241,0.28)';
        chatbotBtn.style.transform = 'scale(1.07)';
    };
    chatbotBtn.onmouseleave = () => {
        chatbotBtn.style.boxShadow = '0 4px 32px rgba(99,102,241,0.18)';
        chatbotBtn.style.transform = 'scale(1)';
    };
    chatbotBtn.animate([
      { boxShadow: '0 0 0 0 rgba(99,102,241,0.18)' },
      { boxShadow: '0 0 0 12px rgba(99,102,241,0.10)' },
      { boxShadow: '0 0 0 0 rgba(99,102,241,0.18)' }
    ], {
      duration: 2200,
      iterations: Infinity
    });

    chatbotWidget.style.position = 'fixed';
    chatbotWidget.style.bottom = '90px';
    chatbotWidget.style.left = '24px';
    chatbotWidget.style.width = '370px';
    chatbotWidget.style.maxWidth = '98vw';
    chatbotWidget.style.height = '520px';
    chatbotWidget.style.background = 'var(--chatbot-bg, #fff)';
    chatbotWidget.style.border = '1.5px solid #e0e7ef';
    chatbotWidget.style.borderRadius = '16px';
    chatbotWidget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.18)';
    chatbotWidget.style.zIndex = '10000';
    chatbotWidget.style.display = 'none';
    chatbotWidget.style.overflow = 'hidden';

    const style = document.createElement('style');
    style.textContent = `
        #chatbot-widget { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; animation: chatbot-fadein 0.3s; }
        #chatbot-header { display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg,#6366f1,#4f46e5); color: #fff; padding: 0.7rem 1.1rem; font-size: 1.1rem; font-weight: 600; border-top-left-radius: 16px; border-top-right-radius: 16px; box-shadow: 0 2px 8px rgba(99,102,241,0.08); }
        .chatbot-header-left { display: flex; align-items: center; gap: 0.7em; }
        .chatbot-logo { font-size: 1.5em; }
        #chatbot-close { cursor: pointer; font-size: 1.5em; transition: color 0.2s; }
        #chatbot-close:hover { color: #fbbf24; }
        #chatbot-messages { flex: 1; overflow-y: auto; padding: 1.1rem 1rem 0.7rem 1rem; background: var(--chatbot-msg-bg, #f8f8ff); display: flex; flex-direction: column; gap: 0.7em; }
        .chatbot-msg { display: flex; align-items: flex-end; gap: 0.7em; margin-bottom: 0; animation: chatbot-msg-in 0.18s; }
        .chatbot-msg.user { flex-direction: row-reverse; }
        .chatbot-avatar { width: 36px; height: 36px; border-radius: 50%; background: #e0e7ff; display: flex; align-items: center; justify-content: center; font-size: 1.3em; color: #6366f1; box-shadow: 0 1px 4px rgba(99,102,241,0.08); }
        .chatbot-msg.user .chatbot-avatar { background: #6366f1; color: #fff; }
        .chatbot-bubble { max-width: 70%; padding: 0.7em 1.1em; border-radius: 1.2em; font-size: 1.05em; line-height: 1.5; box-shadow: 0 1px 4px rgba(99,102,241,0.06); background: #fff; color: #222; position: relative; word-break: break-word; }
        .chatbot-msg.user .chatbot-bubble { background: linear-gradient(135deg,#6366f1,#4f46e5); color: #fff; }
        .chatbot-msg.assistant .chatbot-bubble { background: #f1f5f9; color: #222; }
        .chatbot-msg.assistant.chatbot-typing .chatbot-bubble { background: #f1f5f9; color: #6366f1; }
        .typing-dots { display: inline-block; }
        .typing-dots span { display: inline-block; width: 7px; height: 7px; margin: 0 1.5px; background: #6366f1; border-radius: 50%; opacity: 0.6; animation: chatbot-typing 1.2s infinite; }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes chatbot-typing { 0%, 80%, 100% { opacity: 0.6; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-5px); } }
        @keyframes chatbot-fadein { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes chatbot-msg-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        #chatbot-form { display: flex; align-items: center; padding: 0.7rem 1rem; background: #f3f4f6; border-top: 1px solid #eee; gap: 0.7em; }
        #chatbot-input { flex: 1; padding: 0.7em 1em; border: 1.5px solid #e0e7ef; border-radius: 1.2em; font-size: 1.05em; outline: none; transition: border 0.2s; background: #fff; color: #222; }
        #chatbot-input:focus { border: 1.5px solid #6366f1; }
        #chatbot-form button { background: linear-gradient(135deg,#6366f1,#4f46e5); color: #fff; border: none; border-radius: 50%; width: 44px; height: 44px; font-size: 1.25em; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
        #chatbot-form button:hover { background: linear-gradient(135deg,#4f46e5,#6366f1); }
        #chatbot-footer { text-align: center; font-size: 0.95em; color: #a1a1aa; padding: 0.5em 0 0.7em 0; background: #f8f8ff; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px; }
        .powered-by { opacity: 0.85; }
        .openrouter-badge { color: #6366f1; font-weight: 600; letter-spacing: 0.01em; }
        @media (max-width: 600px) { #chatbot-widget { width: 99vw !important; right: 0 !important; border-radius: 0 !important; bottom: 0 !important; height: 100dvh !important; max-width: 100vw !important; } #chatbot-header, #chatbot-form, #chatbot-footer { border-radius: 0 !important; } }
        body.dark-theme #chatbot-widget { --chatbot-bg: #181a20; --chatbot-msg-bg: #23263a; background: var(--chatbot-bg, #181a20); }
        body.dark-theme #chatbot-messages { background: var(--chatbot-msg-bg, #23263a); }
        body.dark-theme #chatbot-header { background: linear-gradient(135deg,#232263,#181a20); color: #fff; }
        body.dark-theme .chatbot-bubble { background: #23263a; color: #fff; }
        body.dark-theme .chatbot-msg.user .chatbot-bubble { background: linear-gradient(135deg,#6366f1,#4f46e5); color: #fff; }
        body.dark-theme #chatbot-form { background: #181a20; }
        body.dark-theme #chatbot-input { background: #23263a; color: #fff; border: 1.5px solid #232263; }
        body.dark-theme #chatbot-footer { background: #23263a; color: #a1a1aa; }
    `;
    document.head.appendChild(style);

    // --- Adjustable Chatbot Widget ---
    (function() {
        // Use the chatbotWidget variable directly
        // Add resizer handle
        let resizer = document.createElement('div');
        resizer.className = 'chatbot-resizer';
        resizer.setAttribute('aria-label', 'Resize chatbot');
        chatbotWidget.appendChild(resizer);
        // Add minimize button
        let minimizeBtn = document.createElement('button');
        minimizeBtn.className = 'chatbot-minimize-btn';
        minimizeBtn.title = 'Minimize chatbot';
        minimizeBtn.setAttribute('aria-label', 'Minimize chatbot');
        minimizeBtn.innerHTML = '<i class="fas fa-minus"></i>';
        chatbotWidget.querySelector('#chatbot-header').appendChild(minimizeBtn);
        // Add restore button (hidden by default)
        let restoreBtn = document.createElement('button');
        restoreBtn.id = 'chatbot-restore-btn';
        restoreBtn.className = 'chatbot-restore-btn';
        restoreBtn.title = 'Restore chatbot';
        restoreBtn.setAttribute('aria-label', 'Restore chatbot');
        restoreBtn.innerHTML = '<i class="fas fa-brain"></i>';
        restoreBtn.style.display = 'none';
        document.body.appendChild(restoreBtn);
        // --- Resizing logic ---
        let isResizing = false, lastX = 0, lastY = 0, startW = 0, startH = 0;
        resizer.addEventListener('mousedown', function(e) {
            isResizing = true;
            lastX = e.clientX;
            lastY = e.clientY;
            startW = chatbotWidget.offsetWidth;
            startH = chatbotWidget.offsetHeight;
            document.body.style.userSelect = 'none';
        });
        document.addEventListener('mousemove', function(e) {
            if (!isResizing) return;
            let dx = e.clientX - lastX;
            let dy = e.clientY - lastY;
            let newW = Math.max(320, startW + dx);
            let newH = Math.max(280, startH + dy);
            chatbotWidget.style.width = newW + 'px';
            chatbotWidget.style.height = newH + 'px';
        });
        document.addEventListener('mouseup', function() {
            if (isResizing) {
                isResizing = false;
                document.body.style.userSelect = '';
                saveChatbotState();
            }
        });
        // --- Dragging logic ---
        let isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
        const header = chatbotWidget.querySelector('#chatbot-header');
        header.style.cursor = 'move';
        header.addEventListener('mousedown', function(e) {
            if (e.target === minimizeBtn) return;
            isDragging = true;
            dragOffsetX = e.clientX - chatbotWidget.offsetLeft;
            dragOffsetY = e.clientY - chatbotWidget.offsetTop;
            document.body.style.userSelect = 'none';
        });
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            let x = e.clientX - dragOffsetX;
            let y = e.clientY - dragOffsetY;
            chatbotWidget.style.left = x + 'px';
            chatbotWidget.style.top = y + 'px';
            chatbotWidget.style.right = 'auto';
            chatbotWidget.style.bottom = 'auto';
        });
        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                document.body.style.userSelect = '';
                saveChatbotState();
            }
        });
        // --- Minimize/Restore logic ---
        minimizeBtn.addEventListener('click', function() {
            chatbotWidget.style.display = 'none';
            restoreBtn.style.display = 'block';
            saveChatbotState();
        });
        restoreBtn.addEventListener('click', function() {
            chatbotWidget.style.display = 'flex';
            restoreBtn.style.display = 'none';
            saveChatbotState();
        });
        // --- Save/restore size and position ---
        function saveChatbotState() {
            let state = {
                width: chatbotWidget.offsetWidth,
                height: chatbotWidget.offsetHeight,
                left: chatbotWidget.style.left,
                top: chatbotWidget.style.top,
                minimized: chatbotWidget.style.display === 'none'
            };
            localStorage.setItem('chatbotWidgetState', JSON.stringify(state));
        }
        function restoreChatbotState() {
            let state = localStorage.getItem('chatbotWidgetState');
            if (!state) return;
            try {
                state = JSON.parse(state);
                if (state.width) chatbotWidget.style.width = state.width + 'px';
                if (state.height) chatbotWidget.style.height = state.height + 'px';
                if (state.left && state.top) {
                    chatbotWidget.style.left = state.left;
                    chatbotWidget.style.top = state.top;
                    chatbotWidget.style.right = 'auto';
                    chatbotWidget.style.bottom = 'auto';
                }
                if (state.minimized) {
                    chatbotWidget.style.display = 'none';
                    restoreBtn.style.display = 'block';
                } else {
                    chatbotWidget.style.display = 'flex';
                    restoreBtn.style.display = 'none';
                }
            } catch {}
        }
        restoreChatbotState();
        // --- Touch support for mobile ---
        resizer.addEventListener('touchstart', function(e) {
            isResizing = true;
            lastX = e.touches[0].clientX;
            lastY = e.touches[0].clientY;
            startW = chatbotWidget.offsetWidth;
            startH = chatbotWidget.offsetHeight;
            e.preventDefault();
        });
        document.addEventListener('touchmove', function(e) {
            if (!isResizing) return;
            let dx = e.touches[0].clientX - lastX;
            let dy = e.touches[0].clientY - lastY;
            let newW = Math.max(320, startW + dx);
            let newH = Math.max(280, startH + dy);
            chatbotWidget.style.width = newW + 'px';
            chatbotWidget.style.height = newH + 'px';
        });
        document.addEventListener('touchend', function() {
            if (isResizing) {
                isResizing = false;
                saveChatbotState();
            }
        });
        header.addEventListener('touchstart', function(e) {
            if (e.target === minimizeBtn) return;
            isDragging = true;
            dragOffsetX = e.touches[0].clientX - chatbotWidget.offsetLeft;
            dragOffsetY = e.touches[0].clientY - chatbotWidget.offsetTop;
            e.preventDefault();
        });
        document.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            let x = e.touches[0].clientX - dragOffsetX;
            let y = e.touches[0].clientY - dragOffsetY;
            chatbotWidget.style.left = x + 'px';
            chatbotWidget.style.top = y + 'px';
            chatbotWidget.style.right = 'auto';
            chatbotWidget.style.bottom = 'auto';
        });
        document.addEventListener('touchend', function() {
            if (isDragging) {
                isDragging = false;
                saveChatbotState();
            }
        });
        // --- Keyboard accessibility ---
        minimizeBtn.tabIndex = 0;
        minimizeBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') minimizeBtn.click();
        });
        restoreBtn.tabIndex = 0;
        restoreBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') restoreBtn.click();
        });
        // --- Add CSS for adjustable chatbot ---
        var style = document.createElement('style');
        style.innerHTML = `
        .chatbot-widget { resize: none; position: fixed; min-width: 320px; min-height: 280px; max-width: 98vw; max-height: 90vh; }
        .chatbot-resizer { position: absolute; width: 18px; height: 18px; right: 0; bottom: 0; cursor: se-resize; background: linear-gradient(135deg, #6366f1 60%, #fff0 100%); border-radius: 0 0 1.2rem 0; z-index: 2; }
        .chatbot-minimize-btn { background: none; border: none; color: #fff; font-size: 1.1em; margin-left: 0.7em; cursor: pointer; transition: color 0.2s; }
        .chatbot-minimize-btn:focus { outline: 2px solid #6366f1; }
        .chatbot-restore-btn { position: fixed; bottom: 24px; left: 24px; z-index: 9999; background: var(--primary,#6366f1); color: #fff; border: none; border-radius: 50%; width: 3.5rem; height: 3.5rem; box-shadow: 0 4px 24px rgba(99,102,241,0.18); font-size: 1.7rem; display: flex; align-items: center; justify-content: center; transition: background 0.2s,box-shadow 0.2s; }
        .chatbot-restore-btn:focus { outline: 2px solid #6366f1; }
        .chatbot-restore-btn:hover { background: var(--primary-dark,#4f46e5); }
        @media (max-width: 600px) {
            .chatbot-widget { min-width: 98vw !important; min-height: 40vh !important; width: 98vw !important; height: 50vh !important; left: 1vw !important; top: auto !important; right: auto !important; bottom: 90px !important; }
            .chatbot-restore-btn { left: 1vw; bottom: 1.2rem; width: 2.7rem; height: 2.7rem; font-size: 1.2rem; }
        }
        `;
        document.head.appendChild(style);
    })();

    addImageToTextButtonToInputs();
});

// Removed the stray functions and IIFE from the previous incorrect edit.
// Ensure dmc.js is loaded *before* this file in layout.html.

// Enhanced Mobile Navigation
document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu with improved animation
    const mobileMenuButton = document.createElement('button');
    mobileMenuButton.className = 'mobile-menu-button';
    mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
    mobileMenuButton.setAttribute('aria-label', 'Toggle navigation menu');
    
    const navbar = document.querySelector('.navbar .container');
    const navLinks = document.querySelector('.navbar-nav');
    
    if (navbar && navLinks) {
        navbar.insertBefore(mobileMenuButton, navLinks);
        
        // Enhanced mobile menu toggle with animation
        mobileMenuButton.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuButton.innerHTML = navLinks.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
            
            // Add animation to menu items
            const menuItems = navLinks.querySelectorAll('li');
            menuItems.forEach((item, index) => {
                item.style.animation = navLinks.classList.contains('active')
                    ? `slideIn 0.3s ease-out ${index * 0.1}s forwards`
                    : 'none';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target) && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }

    // Enhanced scroll animations
    const scrollElements = document.querySelectorAll('.scroll-animate');
    const elementInView = (el, percentageScroll = 100) => {
        const elementTop = el.getBoundingClientRect().top;
        return (
            elementTop <= 
            ((window.innerHeight || document.documentElement.clientHeight) * (percentageScroll/100))
        );
    };

    const displayScrollElement = (element) => {
        element.classList.add('scrolled');
    };

    const hideScrollElement = (element) => {
        element.classList.remove('scrolled');
    };

    const handleScrollAnimation = () => {
        scrollElements.forEach((el) => {
            if (elementInView(el, 100)) {
                displayScrollElement(el);
            } else {
                hideScrollElement(el);
            }
        });
    };

    // Throttle scroll event
    let throttleTimer;
    const throttle = (callback, time) => {
        if (throttleTimer) return;
        throttleTimer = setTimeout(() => {
            callback();
            throttleTimer = null;
        }, time);
    };

    window.addEventListener('scroll', () => {
        throttle(handleScrollAnimation, 250);
    });

    // Initialize scroll animations
    handleScrollAnimation();
});

// Enhanced Form Interactions
document.querySelectorAll('form').forEach(form => {
    // Add floating labels
    form.querySelectorAll('input, select, textarea').forEach(input => {
        const wrapper = document.createElement('div');
        wrapper.className = 'input-wrapper';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        if (input.value) {
            wrapper.classList.add('has-value');
        }

        input.addEventListener('focus', () => {
            wrapper.classList.add('focused');
        });

        input.addEventListener('blur', () => {
            wrapper.classList.remove('focused');
            if (input.value) {
                wrapper.classList.add('has-value');
            } else {
                wrapper.classList.remove('has-value');
            }
        });

        // Add character counter for text inputs
        if (input.type === 'text' || input.type === 'textarea') {
            const counter = document.createElement('div');
            counter.className = 'char-counter';
            wrapper.appendChild(counter);

            input.addEventListener('input', () => {
                const maxLength = input.maxLength || 100;
                const currentLength = input.value.length;
                counter.textContent = `${currentLength}/${maxLength}`;
                
                if (currentLength > maxLength * 0.9) {
                    counter.classList.add('warning');
                } else {
                    counter.classList.remove('warning');
                }
            });
        }
    });

    // Enhanced form validation
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        
        try {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            
            // Collect form data
            const formData = new FormData(form);
            const data = {};
            for (const [key, value] of formData.entries()) {
                data[key] = value;
            }

            // Validate form data
            const requiredFields = form.querySelectorAll('[required]');
            for (const field of requiredFields) {
                if (!field.value.trim()) {
                    throw new Error(`Please fill in the required field: ${field.name}`);
                }
            }

            // Process form data based on form type
            const formType = form.dataset.formType;
            let result;

            switch (formType) {
                case 'probability':
                    result = await processProbabilityForm(data);
                    break;
                case 'combinatorics':
                    result = await processCombinatoricsForm(data);
                    break;
                case 'set-theory':
                    result = await processSetTheoryForm(data);
                    break;
                case 'number-theory':
                    result = await processNumberTheoryForm(data);
                    break;
                default:
                    throw new Error('Unknown form type');
            }
            
            // Show success message with result
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.innerHTML = `<i class="fas fa-check-circle"></i> Success! Result: ${result}`;
            form.appendChild(successMessage);
            
            // Remove success message after 3 seconds
            setTimeout(() => {
                successMessage.remove();
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }, 3000);
            
        } catch (error) {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
            
            // Show error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${error.message}`;
            form.appendChild(errorMessage);
            
            setTimeout(() => errorMessage.remove(), 3000);
        }
    });

    // Form processing functions
    async function processProbabilityForm(data) {
        // Validate probability-specific inputs
        if (data.probability) {
            const prob = parseFloat(data.probability);
            if (isNaN(prob) || prob < 0 || prob > 1) {
                throw new Error('Probability must be between 0 and 1');
            }
        }
        return await DMC.calculateProbability(data);
    }

    async function processCombinatoricsForm(data) {
        // Validate combinatorics-specific inputs
        if (data.n) {
            const n = parseInt(data.n);
            if (isNaN(n) || n < 0) {
                throw new Error('n must be a non-negative integer');
            }
        }
        return await DMC.calculateCombinatorics(data);
    }

    async function processSetTheoryForm(data) {
        // Validate set theory-specific inputs
        if (data.setA || data.setB) {
            try {
                JSON.parse(data.setA);
                JSON.parse(data.setB);
            } catch (e) {
                throw new Error('Invalid set format');
            }
        }
        return await DMC.calculateSetTheory(data);
    }

    async function processNumberTheoryForm(data) {
        // Validate number theory-specific inputs
        if (data.number) {
            const num = parseInt(data.number);
            if (isNaN(num) || num < 0) {
                throw new Error('Number must be a non-negative integer');
            }
        }
        return await DMC.calculateNumberTheory(data);
    }
});

// Enhanced Copy to Clipboard
document.querySelectorAll('.copy-button').forEach(button => {
    button.addEventListener('click', async () => {
        const textToCopy = button.dataset.copy;
        const originalText = button.innerHTML;
        
        try {
            await navigator.clipboard.writeText(textToCopy);
            
            // Show success animation
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.classList.add('success');
            
            // Create ripple effect
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            button.appendChild(ripple);
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.classList.remove('success');
                ripple.remove();
            }, 2000);
        } catch (err) {
            button.innerHTML = '<i class="fas fa-times"></i> Failed';
            button.classList.add('error');
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.classList.remove('error');
            }, 2000);
        }
    });
});

// Theme Toggle
const themeToggle = document.querySelector('.theme-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
        if (themeToggle) {
            themeToggle.querySelector('.fa-moon').style.display = 'none';
            themeToggle.querySelector('.fa-sun').style.display = 'block';
        }
    } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
        if (themeToggle) {
            themeToggle.querySelector('.fa-moon').style.display = 'block';
            themeToggle.querySelector('.fa-sun').style.display = 'none';
        }
    }
}

function getPreferredTheme() {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return prefersDarkScheme.matches ? 'dark' : 'light';
}

// On load, set theme and icon
setTheme(getPreferredTheme());

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-theme');
        setTheme(isDark ? 'light' : 'dark');
    });
}

// Mobile Menu Toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navbarNav = document.querySelector('.navbar-nav');

if (mobileMenuToggle && navbarNav) {
    mobileMenuToggle.addEventListener('click', () => {
        navbarNav.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!navbarNav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            navbarNav.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        }
    });
}

// Toast Notification System
const toastContainer = document.getElementById('toastContainer');

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = document.createElement('i');
    icon.className = `toast-icon fas ${
        type === 'success' ? 'fa-check-circle' :
        type === 'error' ? 'fa-exclamation-circle' :
        'fa-info-circle'
    }`;
    
    const text = document.createElement('span');
    text.textContent = message;
    
    toast.appendChild(icon);
    toast.appendChild(text);
    toastContainer.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Loading State Management
const loaderContainer = document.getElementById('loaderContainer');

function showLoader() {
    if (loaderContainer) loaderContainer.style.display = 'flex';
}

function hideLoader() {
    if (loaderContainer) loaderContainer.style.display = 'none';
}

// Form Validation and Submission
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoader();
        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: form.method,
                body: formData
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            showToast(data.message || 'Operation completed successfully', 'success');
            if (form.dataset.successAction) {
                const successAction = form.dataset.successAction;
                switch (successAction) {
                    case 'reload':
                        window.location.reload();
                        break;
                    case 'redirect':
                        window.location.href = form.dataset.redirectUrl;
                        break;
                    case 'clear':
                        form.reset();
                        break;
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showToast(error.message || 'An error occurred', 'error');
        } finally {
            hideLoader();
        }
    });
});

// Example Button Handlers
document.querySelectorAll('.example-btn').forEach(button => {
    button.addEventListener('click', () => {
        const exampleData = JSON.parse(button.dataset.example);
        Object.entries(exampleData).forEach(([key, value]) => {
            const input = document.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = value;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
        showToast('Example data loaded', 'info');
    });
});

// Responsive Navigation
function handleResize() {
    if (window.innerWidth > 768 && navbarNav && mobileMenuToggle) {
        navbarNav.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
    }
}

window.addEventListener('resize', handleResize);

// Initialize tooltips
document.querySelectorAll('[data-tooltip]').forEach(element => {
    element.addEventListener('mouseenter', (e) => {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = e.target.dataset.tooltip;
        document.body.appendChild(tooltip);
        const rect = e.target.getBoundingClientRect();
        tooltip.style.top = `${rect.bottom + 5}px`;
        tooltip.style.left = `${rect.left + (rect.width - tooltip.offsetWidth) / 2}px`;
    });
    element.addEventListener('mouseleave', () => {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    });
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add CSS for enhanced elements
const style = document.createElement('style');
style.textContent = `
    /* Enhanced Mobile Menu */
    .mobile-menu-button {
        display: none;
        background: none;
        border: none;
        font-size: 1.5rem;
        color: var(--gray-700);
        cursor: pointer;
        padding: var(--space-2);
        transition: var(--transition-fast);
    }
    
    .mobile-menu-button:hover {
        color: var(--primary);
        transform: scale(1.1);
    }
    
    /* Enhanced Form Elements */
    .input-wrapper {
        position: relative;
        margin-bottom: var(--space-4);
    }
    
    .input-wrapper label {
        position: absolute;
        left: var(--space-4);
        top: 50%;
        transform: translateY(-50%);
        background: var(--surface-0);
        padding: 0 var(--space-2);
        color: var(--gray-500);
        transition: var(--transition-fast);
        pointer-events: none;
    }
    
    .input-wrapper.focused label,
    .input-wrapper.has-value label {
        top: 0;
        font-size: 0.875rem;
        color: var(--primary);
    }
    
    .char-counter {
        position: absolute;
        right: var(--space-2);
        bottom: -1.5rem;
        font-size: 0.75rem;
        color: var(--gray-500);
    }
    
    .char-counter.warning {
        color: var(--warning);
    }
    
    /* Enhanced Buttons */
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .btn .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    /* Enhanced Theme Toggle */
    .theme-toggle {
        position: fixed;
        bottom: var(--space-6);
        right: var(--space-6);
        background: var(--primary);
        color: var(--white);
        border: none;
        border-radius: 50%;
        width: 3rem;
        height: 3rem;
        font-size: 1.25rem;
        cursor: pointer;
        box-shadow: var(--shadow-lg);
        transition: var(--transition-fast);
        z-index: 1000;
    }
    
    .theme-toggle:hover {
        transform: translateY(-2px) scale(1.1);
    }
    
    /* Enhanced Messages */
    .success-message,
    .error-message {
        position: fixed;
        top: var(--space-4);
        right: var(--space-4);
        padding: var(--space-4);
        border-radius: var(--radius-md);
        color: var(--white);
        animation: slideIn 0.3s ease-out;
        z-index: 1000;
    }
    
    .success-message {
        background: var(--success);
    }
    
    .error-message {
        background: var(--danger);
    }
    
    /* Enhanced Animations */
    .scroll-animate {
        opacity: 0;
        transform: translateY(20px);
        transition: var(--transition-normal);
    }
    
    .scroll-animate.scrolled {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* Theme Transition */
    .theme-transition {
        transition: background-color 0.3s ease, color 0.3s ease;
    }
    
    /* Mobile Enhancements */
    @media (max-width: 768px) {
        .mobile-menu-button {
            display: block;
        }
        
        .navbar-nav {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--surface-0);
            padding: var(--space-4);
            box-shadow: var(--shadow-md);
            border-top: 1px solid var(--gray-200);
        }
        
        .navbar-nav.active {
            display: flex;
            flex-direction: column;
            animation: slideDown 0.3s ease-out;
        }
        
        .navbar-nav li {
            opacity: 0;
            transform: translateX(-20px);
        }
        
        .navbar-nav.active li {
            animation: slideIn 0.3s ease-out forwards;
        }
        
        .theme-toggle {
            bottom: var(--space-4);
            right: var(--space-4);
        }
    }
    
    /* Animation Keyframes */
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;

document.head.appendChild(style);

// Global context for explanation
window.DMC_ExplainContext = { operation: '', inputs: '' };
window.DMC_ExplainHistory = [];

// Highlight-to-Ask-AI Feature
(function() {
    let askAIButton = null;
    let lastSelection = '';
    function createAskAIButton() {
        if (askAIButton) return;
        askAIButton = document.createElement('button');
        askAIButton.id = 'askAIButton';
        askAIButton.innerHTML = '<i class="fas fa-robot"></i> Ask AI';
        askAIButton.style.position = 'absolute';
        askAIButton.style.zIndex = 10001;
        askAIButton.style.display = 'none';
        askAIButton.style.padding = '0.45em 1.1em';
        askAIButton.style.background = 'linear-gradient(135deg,#6366f1,#4f46e5)';
        askAIButton.style.color = '#fff';
        askAIButton.style.border = 'none';
        askAIButton.style.borderRadius = '1.2em';
        askAIButton.style.boxShadow = '0 2px 12px rgba(99,102,241,0.18)';
        askAIButton.style.fontWeight = '600';
        askAIButton.style.fontSize = '1rem';
        askAIButton.style.cursor = 'pointer';
        askAIButton.style.transition = 'background 0.2s,transform 0.2s';
        askAIButton.onmouseenter = () => askAIButton.style.transform = 'scale(1.07)';
        askAIButton.onmouseleave = () => askAIButton.style.transform = 'scale(1)';
        document.body.appendChild(askAIButton);
    }
    function showAskAIButton(x, y, text) {
        createAskAIButton();
        askAIButton.style.left = x + 'px';
        askAIButton.style.top = y + 'px';
        askAIButton.style.display = 'block';
        lastSelection = text;
    }
    function hideAskAIButton() {
        if (askAIButton) askAIButton.style.display = 'none';
        lastSelection = '';
    }
    document.addEventListener('selectionchange', function() {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.toString().trim() || sel.rangeCount === 0) {
            hideAskAIButton();
            return;
        }
        const text = sel.toString().trim();
        if (text.length < 2) { // Ignore single chars
            hideAskAIButton();
            return;
        }
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
            hideAskAIButton();
            return;
        }
        // Position button above selection (or below if near top)
        let x = rect.left + window.scrollX + rect.width/2 - 50;
        let y = rect.top + window.scrollY - 38;
        if (y < 0) y = rect.bottom + window.scrollY + 8;
        showAskAIButton(x, y, text);
    });
    document.addEventListener('mousedown', function(e) {
        if (askAIButton && e.target === askAIButton) return;
        hideAskAIButton();
    });
    document.addEventListener('scroll', hideAskAIButton, true);
    createAskAIButton();
    askAIButton.addEventListener('click', function(e) {
        e.preventDefault();
        hideAskAIButton();
        let chatbotWidget = document.getElementById('chatbot-widget') || document.getElementById('chatbotWidget');
        let chatbotBtn = document.getElementById('chatbot-toggle') || document.getElementById('chatbotOpenBtn');
        let input = document.getElementById('chatbot-input') || document.getElementById('chatbotInput');
        let path = window.location.pathname;
        let topic = 'main';
        if (path.includes('set')) topic = 'set theory';
        else if (path.includes('prob')) topic = 'probability';
        else if (path.includes('number')) topic = 'number theory';
        else if (path.includes('combinator')) topic = 'combinatorics';
        else if (path.includes('logic')) topic = 'logic';
        else if (path.includes('graph')) topic = 'graph theory';
        else if (path.includes('automata')) topic = 'automata';
        let op = window.DMC_ExplainContext.operation || '';
        let inp = window.DMC_ExplainContext.inputs || '';
        let formula = window.DMC_ExplainContext.formula || '';
        let contextStr = '';
        if (op && inp) contextStr = 'The user performed the ' + op + ' operation with the following input values: ' + inp + '. ';
        else if (op) contextStr = 'The user performed the ' + op + ' operation. ';
        else if (inp) contextStr = 'The user used the following input values: ' + inp + '. ';
        if (formula) contextStr += 'The formula used was: ' + formula + '. ';
        // Session memory: include last 3 actions
        let history = window.DMC_ExplainHistory || [];
        let historyStr = '';
        if (history.length > 0) {
            historyStr = 'Here is the recent calculation history for context:\n';
            history.slice(-3).forEach((h, i) => {
                let f = h.formula ? (' Formula: ' + h.formula + '.') : '';
                historyStr += `${i+1}. Topic: ${h.topic}, Operation: ${h.operation}, Inputs: ${h.inputs}, Answer: ${h.answer}.${f}\n`;
            });
        }
        if (chatbotWidget && chatbotBtn && input) {
            chatbotWidget.style.display = 'flex';
            if (chatbotBtn.style) chatbotBtn.style.display = 'none';
            setTimeout(() => {
                input.value = (historyStr ? historyStr + '\n' : '') + 'The user is on the ' + topic + ' page. ' + contextStr + 'The answer is: ' + lastSelection + '. Explain in detail how this answer was obtained, step by step.';
                input.focus();
            }, 200);
        }
    });
})();

function safeString(val) {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') return JSON.stringify(val, null, 2);
    return String(val);
}

function showImageToTextModal(targetInput) {
    let modal = document.getElementById('imageToTextModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imageToTextModal';
        modal.innerHTML = `
        <div class="modal-bg" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.3);z-index:2000;display:flex;align-items:center;justify-content:center;">
            <div class="modal-content" style="background:#fff;padding:2rem;border-radius:12px;max-width:400px;width:100%;position:relative;">
                <button id="closeImageToTextModal" style="position:absolute;top:0.5rem;right:0.5rem;font-size:1.5rem;background:none;border:none;">&times;</button>
                <h3 style="margin-bottom:1rem;">Image to Text (OCR)</h3>
                <input type="file" id="ocrImageInput" accept="image/*" style="margin-bottom:1rem;" />
                <div id="ocrPreview" style="margin-bottom:1rem;"></div>
                <button id="runOcrBtn" class="btn btn-primary" style="margin-bottom:1rem;">Convert</button>
                <textarea id="ocrResultText" class="form-control" rows="4" style="width:100%;margin-bottom:1rem;" readonly></textarea>
                <button id="insertOcrResultBtn" class="btn btn-success" style="display:none;">Insert to Field</button>
            </div>
        </div>`;
        document.body.appendChild(modal);
    }
    modal.style.display = 'block';
    const closeBtn = document.getElementById('closeImageToTextModal');
    closeBtn.onclick = () => { modal.style.display = 'none'; };
    const ocrInput = document.getElementById('ocrImageInput');
    const ocrPreview = document.getElementById('ocrPreview');
    const runOcrBtn = document.getElementById('runOcrBtn');
    const ocrResultText = document.getElementById('ocrResultText');
    const insertBtn = document.getElementById('insertOcrResultBtn');
    let selectedFile = null;
    ocrInput.value = '';
    ocrPreview.innerHTML = '';
    ocrResultText.value = '';
    insertBtn.style.display = 'none';
    ocrInput.onchange = function() {
        if (this.files && this.files[0]) {
            selectedFile = this.files[0];
            const reader = new FileReader();
            reader.onload = function(e) {
                ocrPreview.innerHTML = `<img src='${e.target.result}' alt='Preview' style='max-width:100%;max-height:180px;border:1px solid #ccc;border-radius:6px;' />`;
            };
            reader.readAsDataURL(selectedFile);
        } else {
            ocrPreview.innerHTML = '';
            selectedFile = null;
        }
    };
    runOcrBtn.onclick = async function() {
        if (!selectedFile) {
            showToast('Please select an image file.','error');
            return;
        }
        ocrResultText.value = 'Processing...';
        const formData = new FormData();
        formData.append('image', selectedFile);
        try {
            const resp = await fetch('/api/image_to_text', {
                method: 'POST',
                body: formData
            });
            const data = await resp.json();
            if (data.text) {
                ocrResultText.value = data.text;
                insertBtn.style.display = 'inline-block';
            } else {
                ocrResultText.value = data.error || 'OCR failed.';
                insertBtn.style.display = 'none';
            }
        } catch (e) {
            ocrResultText.value = 'OCR failed.';
            insertBtn.style.display = 'none';
        }
    };
    insertBtn.onclick = function() {
        if (targetInput) {
            targetInput.value = ocrResultText.value;
            modal.style.display = 'none';
        }
    };
}

function addImageToTextButtonToInputs() {
    const inputSelectors = [
        'input[type="text"]',
        'textarea',
        '.form-control[type="text"]',
        '.form-control:not([type])',
    ];
    inputSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(input => {
            if (input.dataset.ocrBtn) return;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.innerHTML = '<i class="fas fa-image"></i>';
            btn.title = 'Image to Text (OCR)';
            btn.className = 'btn btn-outline-secondary btn-sm';
            btn.style.marginLeft = '0.5rem';
            btn.onclick = e => {
                e.preventDefault();
                showImageToTextModal(input);
            };
            input.parentNode.insertBefore(btn, input.nextSibling);
            input.dataset.ocrBtn = '1';
        });
    });
}
