import React from 'react';
import Card from './ui/Card.jsx';

/**
 * CalculatorLayout — профессиональный двухколоночный макет для калькуляторов.
 * 
 * Левая колонка: теория (заголовок, описание, видео).
 * Правая колонка: интерактивный калькулятор.
 * 
 * На мобилках: одна колонка (теория → калькулятор).
 * 
 * @param {string} title - заголовок модуля
 * @param {string} subtitle - краткое описание
 * @param {string} description - полное описание теории
 * @param {string} videoUrl - URL видео (опционально)
 * @param {React.ReactNode} theoryContent - дополнительный контент теории (формулы, примеры)
 * @param {React.ReactNode} children - калькулятор (правая колонка)
 */
export default function CalculatorLayout({
  title,
  subtitle,
  description,
  videoUrl = null,
  theoryContent = null,
  children,
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-3xl">
              {subtitle}
            </p>
          )}
        </header>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column: Theory */}
          <aside className="lg:col-span-5 space-y-6">
            {/* Theory Card */}
            <Card variant="elevated" padding="lg">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    Theory
                  </h2>
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>

                {/* Video placeholder */}
                {videoUrl ? (
                  <div className="aspect-video rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <iframe
                      src={videoUrl}
                      title={`${title} video tutorial`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 flex items-center justify-center border-2 border-dashed border-indigo-300 dark:border-indigo-700">
                    <div className="text-center px-4">
                      <svg className="mx-auto h-12 w-12 text-indigo-400 dark:text-indigo-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        Video tutorial coming soon
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        Learn the concepts step-by-step
                      </p>
                    </div>
                  </div>
                )}

                {/* Additional theory content */}
                {theoryContent && (
                  <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                    {theoryContent}
                  </div>
                )}
              </div>
            </Card>

            {/* Key Concepts Card */}
            <Card variant="bordered" padding="md">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                💡 Key Concepts
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">•</span>
                  <span>Interactive calculations with step-by-step solutions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">•</span>
                  <span>LaTeX-rendered mathematical notation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">•</span>
                  <span>Real-time validation and error feedback</span>
                </li>
              </ul>
            </Card>
          </aside>

          {/* Right column: Calculator */}
          <main className="lg:col-span-7">
            <Card variant="elevated" padding="none">
              {children}
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}

/**
 * CalculatorSection — секция внутри калькулятора (inputs, results).
 */
export function CalculatorSection({ title, children, className = '' }) {
  return (
    <div className={`p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

/**
 * CalculatorDivider — разделитель между секциями.
 */
export function CalculatorDivider() {
  return <div className="border-t border-slate-200 dark:border-slate-700" />;
}
