console.log('ai_chatbot.js loaded');

document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('aiChatbotBtn');
    const modal = new bootstrap.Modal(document.getElementById('aiChatModal'));
    const sendBtn = document.getElementById('aiChatSendBtn');
    const input = document.getElementById('aiChatInput');
    const historyDiv = document.getElementById('aiChatHistory');
    let chatHistory = [];

    function renderHistory() {
        historyDiv.innerHTML = chatHistory.map(m => `<div class="mb-2"><b>${m.role==='user'?'You':'AI'}:</b> ${m.content}</div>`).join('');
        historyDiv.scrollTop = historyDiv.scrollHeight;
    }
    function getContext() {
        const matrix = document.getElementById('adjMatrix')?.value;
        const algo = document.getElementById('algorithmSelect')?.value;
        return `Current adjacency matrix:\n${matrix}\nSelected algorithm: ${algo}`;
    }
    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;
        chatHistory.push({role:'user',content:text});
        renderHistory();
        input.value = '';
        sendBtn.disabled = true;
        try {
            const context = getContext();
            const messages = [
                {role:'system',content:'You are a helpful assistant for discrete math, graph theory, and algorithms.'},
                {role:'user',content: context},
                ...chatHistory
            ];
            const res = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({messages})
            });
            const data = await res.json();
            if (data.reply) {
                chatHistory.push({role:'assistant',content:data.reply});
            } else {
                chatHistory.push({role:'assistant',content:'[No reply or error from AI]'});
            }
        } catch (e) {
            chatHistory.push({role:'assistant',content:'[Error: '+e.message+']'});
        }
        renderHistory();
        sendBtn.disabled = false;
    }
    btn.addEventListener('click', function() {
        modal.show();
    });
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', function(e) {
        if (e.key==='Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    document.getElementById('aiChatModal').addEventListener('hidden.bs.modal', function() {
        input.value = '';
    });
});