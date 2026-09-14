/**
 * Utility functions for currency conversion and integer cent calculations.
 * All internal arithmetic must be done in integer cents to avoid floating-point
 * rounding errors.
 */

/**
 * Converts a dollar amount (string or number) to integer cents.
 * Validates that the amount has at most 2 decimal places.
 * Throws an Error if invalid.
 *
 * @param {string|number} amount
 * @returns {number} Integer cents
 */
export const toCents = (amount) => {
  if (amount === undefined || amount === null || amount === '') {
    throw new Error('Amount is required');
  }

  let str;
  if (typeof amount === 'number') {
    if (!Number.isFinite(amount)) {
      throw new Error('Amount must be a finite number');
    }
    // Convert to string preserving decimal notation
    str = amount.toString();
  } else if (typeof amount === 'string') {
    str = amount.trim();
  } else {
    throw new Error('Amount must be a string or number');
  }

  // Must match optional negative sign followed by digits and optional up to 2 decimal places
  if (!/^-?\d+(\.\d{1,2})?$/.test(str)) {
    throw new Error('Amount must have at most 2 decimal places');
  }

  const isNegative = str.startsWith('-');
  const cleanStr = isNegative ? str.slice(1) : str;
  const [dollars, cents = ''] = cleanStr.split('.');
  const paddedCents = (cents + '00').slice(0, 2);

  const totalCents = parseInt(dollars, 10) * 100 + parseInt(paddedCents, 10);
  return isNegative ? -totalCents : totalCents;
};

/**
 * Converts integer cents to a formatted decimal string (e.g. 4500 -> "45.00").
 * NUMERIC columns in PostgreSQL return strings, so formatting as string matches pg.
 *
 * @param {number} cents
 * @returns {string} Formatted decimal string with 2 decimal places
 */
export const fromCents = (cents) => {
  if (!Number.isInteger(cents)) {
    throw new Error('cents must be an integer');
  }

  const isNegative = cents < 0;
  const absCents = Math.abs(cents);
  const dollars = Math.floor(absCents / 100);
  const remainder = absCents % 100;
  const formatted = `${dollars}.${remainder.toString().padStart(2, '0')}`;
  return isNegative ? `-${formatted}` : formatted;
};
