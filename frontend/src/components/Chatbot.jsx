import React, { useState, useRef, useEffect, useCallback } from 'react';

function renderMarkdown(text) {
  if (window.marked) {
    return { __html: window.marked.parse(text) };
  }
  return { __html: text };
}

function typeset(el) {
  if (window.MathJax && el) {
    window.MathJax.typesetPromise([el]).catch(() => {});
  }
}

export default function Chatbot({ chatHistory, setChatHistory }) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const widgetRef = useRef(null);

  // Drag state
  const dragState = useRef({ dragging: false, resizing: false });
  const pos = useRef({ x: 0, y: 0, w: 0, h: 0, mouseX: 0, mouseY: 0 });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, typing, scrollToBottom]);

  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open, minimized]);

  // Restore saved position/size
  useEffect(() => {
    const saved = localStorage.getItem('chatbotWidgetState');
    if (!saved || !widgetRef.current) return;
    try {
      const s = JSON.parse(saved);
      if (s.width) widgetRef.current.style.width = s.width + 'px';
      if (s.height) widgetRef.current.style.height = s.height + 'px';
      if (s.left && s.top) {
        widgetRef.current.style.left = s.left;
        widgetRef.current.style.top = s.top;
        widgetRef.current.style.right = 'auto';
        widgetRef.current.style.bottom = 'auto';
      }
    } catch {}
  }, []);

  function saveState() {
    if (!widgetRef.current) return;
    localStorage.setItem('chatbotWidgetState', JSON.stringify({
      width: widgetRef.current.offsetWidth,
      height: widgetRef.current.offsetHeight,
      left: widgetRef.current.style.left,
      top: widgetRef.current.style.top,
    }));
  }

  // Drag header
  function onHeaderMouseDown(e) {
    if (e.target.closest('button')) return;
    e.preventDefault();
    dragState.current.dragging = true;
    pos.current.mouseX = e.clientX - widgetRef.current.offsetLeft;
    pos.current.mouseY = e.clientY - widgetRef.current.offsetTop;
    document.body.style.userSelect = 'none';
  }

  // Resize corner
  function onResizerMouseDown(e) {
    e.preventDefault();
    dragState.current.resizing = true;
    pos.current.mouseX = e.clientX;
    pos.current.mouseY = e.clientY;
    pos.current.w = widgetRef.current.offsetWidth;
    pos.current.h = widgetRef.current.offsetHeight;
    document.body.style.userSelect = 'none';
  }

  useEffect(() => {
    function onMouseMove(e) {
      if (dragState.current.dragging && widgetRef.current) {
        widgetRef.current.style.left = (e.clientX - pos.current.mouseX) + 'px';
        widgetRef.current.style.top = (e.clientY - pos.current.mouseY) + 'px';
        widgetRef.current.style.right = 'auto';
        widgetRef.current.style.bottom = 'auto';
      }
      if (dragState.current.resizing && widgetRef.current) {
        const dx = e.clientX - pos.current.mouseX;
        const dy = e.clientY - pos.current.mouseY;
        widgetRef.current.style.width = Math.max(320, pos.current.w + dx) + 'px';
        widgetRef.current.style.height = Math.max(280, pos.current.h + dy) + 'px';
      }
    }
    function onMouseUp() {
      if (dragState.current.dragging || dragState.current.resizing) {
        saveState();
      }
      dragState.current.dragging = false;
      dragState.current.resizing = false;
      document.body.style.userSelect = '';
    }
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text && !pendingImage) return;

    const newMessage = {
      role: 'user',
      content: text || 'Analyze this image',
      image: pendingImage || undefined,
    };

    const updatedHistory = [...chatHistory, newMessage];
    setChatHistory(updatedHistory);
    setInput('');
    setPendingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setTyping(true);
    try {
      const messages = updatedHistory.map(({ role, content }) => ({ role, content }));
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });
      const data = await res.json();
      if (data.reply) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'assistant', content: 'Error: ' + (data.error || 'No reply') }]);
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Error: ' + err.message }]);
    } finally {
      setTyping(false);
    }
  }

  function handleImageAttach(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPendingImage(ev.target.result);
    reader.readAsDataURL(file);
  }

  function copyText(text) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  return (
    <>
      {/* Toggle button */}
      {!open && (
        <button
          className="chatbot-open-btn"
          aria-label="Open AI Chatbot"
          title="Ask AI"
          onClick={() => { setOpen(true); setMinimized(false); }}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            zIndex: 9999,
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#6366f1 60%,#818cf8 100%)',
            color: '#fff',
            border: 'none',
            fontSize: '1.7rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 32px rgba(99,102,241,0.18)',
          }}
        >
          <i className="fas fa-brain"></i>
        </button>
      )}

      {/* Restore button when minimized */}
      {open && minimized && (
        <button
          className="chatbot-restore-btn"
          aria-label="Restore chatbot"
          title="Restore chatbot"
          onClick={() => setMinimized(false)}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            zIndex: 9999,
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '50%',
            background: 'var(--primary,#6366f1)',
            color: '#fff',
            border: 'none',
            fontSize: '1.7rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(99,102,241,0.18)',
          }}
        >
          <i className="fas fa-brain"></i>
        </button>
      )}

      {/* Widget */}
      {open && !minimized && (
        <div
          ref={widgetRef}
          id="chatbot-widget"
          style={{
            position: 'fixed',
            bottom: '90px',
            left: '24px',
            width: '370px',
            maxWidth: '98vw',
            height: '520px',
            background: 'var(--chatbot-bg, #fff)',
            border: '1.5px solid #e0e7ef',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(99,102,241,0.18)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minWidth: '320px',
            minHeight: '280px',
          }}
        >
          {/* Header */}
          <div
            id="chatbot-header"
            onMouseDown={onHeaderMouseDown}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
              color: '#fff',
              padding: '0.7rem 1.1rem',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'move',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              userSelect: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7em' }}>
              <span style={{ fontSize: '1.5em' }}><i className="fas fa-robot"></i></span>
              <span>Discrete Math AI</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4em' }}>
              <button
                onClick={() => setMinimized(true)}
                title="Minimize"
                aria-label="Minimize chatbot"
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.1em', cursor: 'pointer' }}
              >
                <i className="fas fa-minus"></i>
              </button>
              <button
                onClick={() => setOpen(false)}
                title="Close"
                aria-label="Close chatbot"
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5em', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            id="chatbot-messages"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.1rem 1rem 0.7rem',
              background: 'var(--chatbot-msg-bg, #f8f8ff)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.7em',
            }}
          >
            {chatHistory.map((msg, i) => (
              <ChatMessage key={i} msg={msg} onCopy={copyText} />
            ))}
            {typing && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Image preview */}
          {pendingImage && (
            <div style={{ padding: '8px', background: '#f3f4f6', position: 'relative' }}>
              <img src={pendingImage} alt="Preview" style={{ maxHeight: '100px', maxWidth: '100%', borderRadius: '6px', display: 'block' }} />
              <button
                onClick={() => { setPendingImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                style={{
                  position: 'absolute', top: '2px', right: '2px',
                  background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%',
                  width: '28px', height: '28px', cursor: 'pointer', fontSize: '18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                &times;
              </button>
            </div>
          )}

          {/* Form */}
          <form
            id="chatbot-form"
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.7rem 1rem',
              background: '#f3f4f6',
              borderTop: '1px solid #eee',
              gap: '0.7em',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageAttach}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach image"
              style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '1.3rem', cursor: 'pointer', padding: '0 4px' }}
            >
              <i className="fas fa-image"></i>
            </button>
            <input
              ref={inputRef}
              id="chatbot-input"
              type="text"
              placeholder="Ask a discrete math question..."
              maxLength={500}
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{
                flex: 1, padding: '0.7em 1em',
                border: '1.5px solid #e0e7ef', borderRadius: '1.2em',
                fontSize: '1.05em', outline: 'none', background: '#fff', color: '#222',
              }}
            />
            <button
              type="submit"
              title="Send"
              style={{
                background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                color: '#fff', border: 'none', borderRadius: '50%',
                width: '44px', height: '44px', fontSize: '1.25em',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>

          {/* Footer */}
          <div style={{
            textAlign: 'center', fontSize: '0.95em', color: '#a1a1aa',
            padding: '0.5em 0 0.7em', background: '#f8f8ff',
          }}>
            Powered by <span style={{ color: '#6366f1', fontWeight: 600 }}>OpenRouter AI</span>
          </div>

          {/* Resize handle */}
          <div
            onMouseDown={onResizerMouseDown}
            style={{
              position: 'absolute', width: '18px', height: '18px',
              right: 0, bottom: 0, cursor: 'se-resize',
              background: 'linear-gradient(135deg,#6366f1 60%,transparent 100%)',
              borderRadius: '0 0 1.2rem 0', zIndex: 2,
            }}
          />
        </div>
      )}
    </>
  );
}

function ChatMessage({ msg, onCopy }) {
  const bubbleRef = useRef(null);
  const isAssistant = msg.role === 'assistant';

  useEffect(() => {
    if (isAssistant && bubbleRef.current) {
      typeset(bubbleRef.current);
    }
  }, [isAssistant, msg.content]);

  return (
    <div
      className={`chatbot-msg-bubble chatbot-msg-${msg.role}`}
      tabIndex={0}
      role="article"
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '0.7em',
        flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
        animation: 'chatbot-msg-in 0.22s',
      }}
    >
      <span
        className="chatbot-avatar"
        style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: msg.role === 'user' ? '#6366f1' : '#e0e7ff',
          color: msg.role === 'user' ? '#fff' : '#6366f1',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3em',
          flexShrink: 0,
        }}
      >
        <i className={`fas ${msg.role === 'user' ? 'fa-user' : 'fa-robot'}`}></i>
      </span>
      <span
        ref={bubbleRef}
        className="chatbot-bubble-inner"
        style={{
          maxWidth: '70%', padding: '0.7em 1.1em', borderRadius: '1.2em',
          fontSize: '1.05em', lineHeight: 1.5,
          background: msg.role === 'user' ? 'linear-gradient(135deg,#6366f1,#4f46e5)' : '#f1f5f9',
          color: msg.role === 'user' ? '#fff' : '#222',
          wordBreak: 'break-word',
        }}
      >
        {msg.image && (
          <img
            src={msg.image}
            alt="Attached"
            style={{ maxWidth: '150px', maxHeight: '100px', borderRadius: '6px', marginBottom: '6px', display: 'block' }}
          />
        )}
        {isAssistant
          ? <span dangerouslySetInnerHTML={renderMarkdown(msg.content)} />
          : msg.content
        }
      </span>
      {isAssistant && (
        <button
          className="chatbot-copy-btn"
          title="Copy to clipboard"
          onClick={() => onCopy(bubbleRef.current?.textContent || msg.content)}
          style={{
            background: 'none', border: 'none', color: '#a1a1aa',
            cursor: 'pointer', fontSize: '0.9rem', padding: '2px',
            alignSelf: 'flex-end', flexShrink: 0,
          }}
        >
          <i className="fas fa-copy"></i>
        </button>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div
      className="chatbot-msg-bubble chatbot-msg-assistant chatbot-typing"
      style={{ display: 'flex', alignItems: 'flex-end', gap: '0.7em' }}
    >
      <span style={{
        width: '36px', height: '36px', borderRadius: '50%',
        background: '#e0e7ff', color: '#6366f1',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3em',
      }}>
        <i className="fas fa-robot"></i>
      </span>
      <span style={{
        padding: '0.7em 1.1em', borderRadius: '1.2em',
        background: '#f1f5f9', display: 'flex', gap: '4px', alignItems: 'center',
      }}>
        <span className="typing-dots">
          <span></span><span></span><span></span>
        </span>
      </span>
    </div>
  );
}
