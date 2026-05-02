import Editor from '@monaco-editor/react';
import useIsDarkMode from '../hooks/useIsDarkMode.js';

/**
 * Python-first code surface for algorithm practice (LeetCode-style); language from parent.
 */
export default function PracticeCodeEditor({ value, onChange, language, height = '280px' }) {
  const isDark = useIsDarkMode();
  const lang = language && String(language).trim() ? String(language).trim() : 'python';
  return (
    <div className="practice-code-editor rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
      <Editor
        height={height}
        language={lang}
        value={value}
        onChange={onChange}
        theme={isDark ? 'vs-dark' : 'light'}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
        }}
      />
    </div>
  );
}
