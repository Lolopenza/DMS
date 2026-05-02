import React, { useEffect, useState } from 'react';

function getPreferredTheme() {
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  const body = document.body;
  const html = document.documentElement;
  if (theme === 'dark') {
    body.classList.add('dark-theme');
    html.classList.add('dark');
    html.setAttribute('data-theme', 'dark');
  } else {
    body.classList.remove('dark-theme');
    html.classList.remove('dark');
    html.setAttribute('data-theme', 'light');
  }
  localStorage.setItem('theme', theme);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getPreferredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <button
      className="fixed bottom-6 right-6 z-[2000] inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 transition-transform hover:-translate-y-0.5 hover:scale-105 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-white dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-indigo-500 dark:focus:ring-offset-slate-950"
      aria-label="Toggle dark mode"
      onClick={toggle}
    >
      <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
    </button>
  );
}
