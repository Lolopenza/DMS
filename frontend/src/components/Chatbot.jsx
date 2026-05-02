import React, { useState, useRef, useEffect, useCallback } from 'react';
import { extractSubjectFromPath, extractModuleFromPath } from '../utils/routeHelpers.js';

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

  // Position is now fixed and not draggable
  // Removed: localStorage restore for position/size

  function getRouteScope() {
    const pathname = window.location.pathname;
    const subject = extractSubjectFromPath(pathname);
    const module = extractModuleFromPath(pathname);

    // Skip non-learning pages where module scoping is not meaningful.
    if (module === 'calculator' || module === 'roadmap') {
      return { subject, module: null };
    }

    return { subject, module };
  }

  // saveState removed - position is now fixed

  // Dragging disabled - widget position is fixed

  // Mouse event listeners removed - dragging is disabled

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
      const messages = updatedHistory.map(({ role, content, image }) => ({ role, content, image }));
      const { subject, module } = getRouteScope();
      const chatPayload = { messages, subject };
      if (module !== null) {
        chatPayload.module = module;
      }
      const res = await fetch('/api/calculator/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(chatPayload),
      });
      const data = await res.json().catch(() => ({}));
      const errorMessage =
        data?.error?.message ||
        data?.detail ||
        data?.error ||
        `HTTP ${res.status}`;
      if (!res.ok) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: 'Error: ' + errorMessage }]);
      } else if (data.reply && String(data.reply).trim()) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        const message = errorMessage || 'AI returned an empty response. Please try again.';
        setChatHistory(prev => [...prev, { role: 'assistant', content: 'Error: ' + message }]);
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
          className="fixed bottom-6 left-6 z-[10000] inline-flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 via-indigo-600 to-indigo-400 text-white shadow-[0_4px_32px_rgba(99,102,241,0.18)] transition-transform hover:-translate-y-0.5 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-indigo-500 dark:focus:ring-offset-slate-950"
          aria-label="Open AI Chatbot"
          title="Ask AI"
          onClick={() => { setOpen(true); setMinimized(false); }}
        >
          <i className="fas fa-brain text-[1.7rem]" />
        </button>
      )}

      {/* Restore button when minimized */}
      {open && minimized && (
        <button
          className="fixed bottom-6 left-6 z-[10000] inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-[0_4px_24px_rgba(99,102,241,0.18)] transition-transform hover:-translate-y-0.5 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-white dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-indigo-500 dark:focus:ring-offset-slate-950"
          aria-label="Restore chatbot"
          title="Restore chatbot"
          onClick={() => setMinimized(false)}
        >
          <i className="fas fa-brain text-[1.4rem]" />
        </button>
      )}

      {/* Widget */}
      {open && !minimized && (
        <div
          ref={widgetRef}
          className="fixed bottom-[90px] left-6 z-[10001] flex h-[520px] w-[370px] min-w-[320px] min-h-[280px] max-w-[98vw] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_32px_rgba(99,102,241,0.18)] dark:border-slate-800 dark:bg-slate-950"
        >
          {/* Header */}
          <div
            className="flex select-none items-center justify-between bg-gradient-to-br from-indigo-600 to-indigo-700 px-4 py-3 text-white"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl"><i className="fas fa-robot" /></span>
              <span>Math Lab AI</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMinimized(true)}
                title="Minimize"
                aria-label="Minimize chatbot"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-white/90 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                <i className="fas fa-minus" />
              </button>
              <button
                onClick={() => setOpen(false)}
                title="Close"
                aria-label="Close chatbot"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-white/90 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4 dark:bg-slate-900/40"
          >
            {chatHistory.map((msg, i) => (
              <ChatMessage key={i} msg={msg} onCopy={copyText} />
            ))}
            {typing && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Image preview */}
          {pendingImage && (
            <div className="relative border-t border-slate-200 bg-slate-100 px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
              <img src={pendingImage} alt="Preview" className="block max-h-[100px] max-w-full rounded-lg" />
              <button
                onClick={() => { setPendingImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                &times;
              </button>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageAttach}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach image"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
            >
              <i className="fas fa-image text-lg" />
            </button>
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask a math question..."
              maxLength={500}
              value={input}
              onChange={e => setInput(e.target.value)}
              className="h-10 flex-1 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20"
            />
            <button
              type="submit"
              title="Send"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-sm shadow-indigo-600/20 transition-transform hover:-translate-y-0.5 hover:shadow-indigo-600/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:from-indigo-500 dark:to-indigo-600 dark:hover:shadow-indigo-500/30"
            >
              <i className="fas fa-paper-plane text-base" />
            </button>
          </form>

          {/* Footer */}
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
            Powered by <span className="font-semibold text-indigo-600 dark:text-indigo-300">OpenRouter AI</span>
          </div>

          {/* Resize handle - disabled */}
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
      className={[
        'flex items-end gap-3',
        msg.role === 'user' ? 'flex-row-reverse' : 'flex-row',
      ].join(' ')}
      tabIndex={0}
      role="article"
    >
      <span
        className={[
          'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg',
          msg.role === 'user'
            ? 'bg-indigo-600 text-white'
            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200',
        ].join(' ')}
      >
        <i className={`fas ${msg.role === 'user' ? 'fa-user' : 'fa-robot'}`} />
      </span>
      <span
        ref={bubbleRef}
        className={[
          'max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm',
          msg.role === 'user'
            ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white'
            : 'bg-white text-slate-900 border border-slate-200 dark:bg-slate-950 dark:text-slate-100 dark:border-slate-800',
        ].join(' ')}
      >
        {msg.image && (
          <img
            src={msg.image}
            alt="Attached"
            className="mb-2 block max-h-[100px] max-w-[150px] rounded-lg"
          />
        )}
        {isAssistant
          ? <span dangerouslySetInnerHTML={renderMarkdown(msg.content)} />
          : msg.content
        }
      </span>
      {isAssistant && (
        <button
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          title="Copy to clipboard"
          onClick={() => onCopy(bubbleRef.current?.textContent || msg.content)}
        >
          <i className="fas fa-copy" />
        </button>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-lg dark:bg-indigo-500/15 dark:text-indigo-200">
        <i className="fas fa-robot" />
      </span>
      <span className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 dark:bg-indigo-300"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </span>
    </div>
  );
}
