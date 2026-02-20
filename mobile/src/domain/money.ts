import type { Cents } from './types';

export const CENTS_PER_DOLLAR = 100;

export const isValidCents = (value: number): boolean =>
  Number.isInteger(value) && Number.isSafeInteger(value);

export const assertCents = (value: number, fieldName = 'value'): Cents => {
  if (!isValidCents(value)) {
    throw new Error(`${fieldName} must be a safe integer cents amount`);
  }

  return value;
};

export const dollarsToCents = (amount: number): Cents => {
  if (!Number.isFinite(amount)) {
    throw new Error('amount must be finite');
  }

  const cents = Math.round(amount * CENTS_PER_DOLLAR);
  return assertCents(cents, 'amount');
};

export const decimalStringToCents = (amount: string): Cents => {
  const normalized = amount.trim();

  if (!/^-?\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new Error('amount must be a decimal string with up to 2 decimal places');
  }

  const [wholePart, decimalPart = ''] = normalized.split('.');
  const decimalPadded = decimalPart.padEnd(2, '0');
  const sign = wholePart.startsWith('-') ? -1 : 1;
  const absWhole = wholePart.replace('-', '');

  const cents = sign * (Number(absWhole) * CENTS_PER_DOLLAR + Number(decimalPadded));
  return assertCents(cents, 'amount');
};

export const centsToDecimalString = (cents: Cents): string => {
  const value = assertCents(cents, 'cents');
  const abs = Math.abs(value);
  const whole = Math.floor(abs / CENTS_PER_DOLLAR);
  const fractional = String(abs % CENTS_PER_DOLLAR).padStart(2, '0');
  const sign = value < 0 ? '-' : '';

  return `${sign}${whole}.${fractional}`;
};
