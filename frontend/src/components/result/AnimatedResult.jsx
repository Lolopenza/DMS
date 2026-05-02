import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const variants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  pop: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
};

/**
 * Animated wrapper for result components using Framer Motion.
 * Provides smooth entrance/exit animations for a premium feel.
 *
 * @param {React.ReactNode} children - Content to animate
 * @param {'fadeIn'|'slideUp'|'slideRight'|'scale'|'pop'} variant - Animation type
 * @param {number} delay - Animation delay in seconds
 * @param {number} duration - Animation duration in seconds
 * @param {string} className - Additional CSS classes
 */
export default function AnimatedResult({
  children,
  variant = 'slideUp',
  delay = 0,
  duration = 0.3,
  className = '',
  show = true,
}) {
  const selectedVariant = variants[variant] || variants.slideUp;

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={selectedVariant.initial}
          animate={selectedVariant.animate}
          exit={selectedVariant.exit}
          transition={{
            duration,
            delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Staggered list animation - each child animates with increasing delay.
 */
export function AnimatedList({ children, staggerDelay = 0.05, className = '' }) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.25,
            delay: index * staggerDelay,
            ease: 'easeOut',
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Highlight animation for final answers - draws attention with a subtle pulse.
 */
export function HighlightResult({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`relative ${className}`}
    >
      <motion.div
        className="absolute inset-0 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{ duration: 1.5, delay: 0.3 }}
      />
      {children}
    </motion.div>
  );
}

/**
 * Step-by-step reveal animation for formula derivations.
 */
export function AnimatedSteps({ steps, renderStep, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {steps.map((step, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.3,
            delay: index * 0.15,
            ease: 'easeOut',
          }}
        >
          {renderStep(step, index)}
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Counter animation for numeric results.
 */
export function AnimatedNumber({ value, duration = 0.8, className = '' }) {
  const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {numValue.toLocaleString()}
      </motion.span>
    </motion.span>
  );
}
