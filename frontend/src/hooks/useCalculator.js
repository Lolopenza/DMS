import { useState } from 'react';
import { useToast } from '../components/Toast.jsx';

/**
 * Universal calculator hook that handles common patterns:
 * - Loading state
 * - Result state
 * - Error handling with toast notifications
 * - Success feedback
 * 
 * @param {Function} apiFunction - The API function to call (e.g., calcCombinatorics)
 * @param {Object} options - Configuration options
 * @param {string} options.successMessage - Message to show on success (default: 'Calculation complete')
 * @param {Function} options.onSuccess - Callback after successful calculation
 * @param {Function} options.onError - Callback after error
 * 
 * @returns {Object} { result, loading, error, calculate, reset }
 * 
 * @example
 * const { result, loading, calculate } = useCalculator(calcCombinatorics, {
 *   successMessage: 'Combinatorics calculated successfully'
 * });
 * 
 * // In your component:
 * <button onClick={() => calculate({ operation: 'permutation', n: 5, r: 3 })}>
 *   Calculate
 * </button>
 */
export function useCalculator(apiFunction, options = {}) {
  const {
    successMessage = 'Calculation complete',
    onSuccess,
    onError,
  } = options;

  const { showSuccess, showError } = useToast();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function calculate(payload) {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await apiFunction(payload);
      setResult(data);
      showSuccess(successMessage);
      if (onSuccess) {
        onSuccess(data);
      }
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Calculation failed';
      setResult(null);
      setError(errorMessage);
      showError(errorMessage);
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
    setLoading(false);
  }

  return {
    result,
    loading,
    error,
    calculate,
    reset,
  };
}
