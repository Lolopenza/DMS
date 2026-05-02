import { useSyncExternalStore } from 'react';

function subscribe(onStoreChange) {
  const el = document.documentElement;
  const observer = new MutationObserver(() => onStoreChange());
  observer.observe(el, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains('dark');
}

function getServerSnapshot() {
  return false;
}

/**
 * Tracks Tailwind dark mode: class `dark` on &lt;html&gt; (see ThemeToggle).
 * Subscribes via MutationObserver so library components (Monaco, Recharts) re-render when theme toggles.
 */
export default function useIsDarkMode() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
