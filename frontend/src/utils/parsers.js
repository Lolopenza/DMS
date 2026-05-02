/**
 * Shared parsing utilities for calculator modules.
 * Eliminates duplication of parsing logic across 15+ modules.
 */

/**
 * Parse comma-separated variable names (e.g., "p, q, r" → ["p", "q", "r"])
 * Used in: TruthTables, PropositionalLogic, EquivalenceLaws, BooleanAlgebra
 */
export function parseVars(value) {
  const out = String(value).split(',').map((v) => v.trim()).filter(Boolean);
  if (!out.length) throw new Error('Enter at least one variable');
  return out;
}

/**
 * Parse a single number with validation
 */
export function parseNumber(value, fieldName = 'Value') {
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  return num;
}

/**
 * Parse comma-separated numbers (e.g., "1, 2, 3" → [1, 2, 3])
 */
export function parseNumberArray(value, fieldName = 'Values') {
  const arr = String(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => {
      const num = Number(v);
      if (isNaN(num)) {
        throw new Error(`${fieldName} must contain only valid numbers`);
      }
      return num;
    });
  if (!arr.length) {
    throw new Error(`${fieldName} cannot be empty`);
  }
  return arr;
}

/**
 * Parse vector notation (e.g., "[1, 2, 3]" or "1, 2, 3" → [1, 2, 3])
 */
export function parseVector(value, fieldName = 'Vector') {
  let cleaned = String(value).trim();
  // Remove brackets if present
  if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
    cleaned = cleaned.slice(1, -1);
  }
  return parseNumberArray(cleaned, fieldName);
}

/**
 * Parse matrix notation (e.g., "[[1,2],[3,4]]" or "1,2;3,4" → [[1,2],[3,4]])
 */
export function parseMatrix(value, fieldName = 'Matrix') {
  let cleaned = String(value).trim();
  
  // Handle JSON-style notation: [[1,2],[3,4]]
  if (cleaned.startsWith('[[') && cleaned.endsWith(']]')) {
    try {
      const parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed) || !Array.isArray(parsed[0])) {
        throw new Error('Invalid matrix format');
      }
      return parsed;
    } catch {
      throw new Error(`${fieldName} has invalid JSON format`);
    }
  }
  
  // Handle semicolon-separated rows: "1,2;3,4"
  const rows = cleaned.split(';').map((row) => {
    const nums = row.split(',').map((v) => {
      const num = Number(v.trim());
      if (isNaN(num)) {
        throw new Error(`${fieldName} contains invalid number: ${v}`);
      }
      return num;
    });
    return nums;
  });
  
  if (rows.length === 0 || rows[0].length === 0) {
    throw new Error(`${fieldName} cannot be empty`);
  }
  
  // Validate all rows have same length
  const cols = rows[0].length;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].length !== cols) {
      throw new Error(`${fieldName} rows must have equal length`);
    }
  }
  
  return rows;
}

/**
 * Parse integer with validation
 */
export function parseInteger(value, fieldName = 'Value', min = null, max = null) {
  const num = parseInt(value, 10);
  if (isNaN(num) || num !== Number(value)) {
    throw new Error(`${fieldName} must be a valid integer`);
  }
  if (min !== null && num < min) {
    throw new Error(`${fieldName} must be at least ${min}`);
  }
  if (max !== null && num > max) {
    throw new Error(`${fieldName} must be at most ${max}`);
  }
  return num;
}

/**
 * Parse positive integer
 */
export function parsePositiveInteger(value, fieldName = 'Value') {
  return parseInteger(value, fieldName, 1);
}

/**
 * Parse non-negative integer
 */
export function parseNonNegativeInteger(value, fieldName = 'Value') {
  return parseInteger(value, fieldName, 0);
}

/**
 * Validate and parse a set notation string (e.g., "{1, 2, 3}")
 */
export function parseSet(value, fieldName = 'Set') {
  let cleaned = String(value).trim();
  
  // Remove curly braces if present
  if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
    cleaned = cleaned.slice(1, -1);
  }
  
  if (!cleaned) {
    return []; // Empty set
  }
  
  // Split by comma and trim
  const elements = cleaned.split(',').map((v) => v.trim()).filter(Boolean);
  
  return elements;
}
