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
    html.classList.add('dark-theme');
  } else {
    body.classList.remove('dark-theme');
    html.classList.remove('dark-theme');
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
      className="theme-toggle"
      aria-label="Toggle dark mode"
      onClick={toggle}
    >
      <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
    </button>
  );
}
