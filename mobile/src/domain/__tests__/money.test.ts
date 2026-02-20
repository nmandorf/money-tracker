import {
  assertCents,
  centsToDecimalString,
  decimalStringToCents,
  dollarsToCents,
  isValidCents
} from '../money';

describe('money utilities', () => {
  it('validates safe integer cents', () => {
    expect(isValidCents(123)).toBe(true);
    expect(isValidCents(12.3)).toBe(false);
  });

  it('converts decimal strings to cents', () => {
    expect(decimalStringToCents('10')).toBe(1000);
    expect(decimalStringToCents('10.25')).toBe(1025);
    expect(decimalStringToCents('-1.05')).toBe(-105);
  });

  it('formats cents as decimal strings', () => {
    expect(centsToDecimalString(0)).toBe('0.00');
    expect(centsToDecimalString(5)).toBe('0.05');
    expect(centsToDecimalString(-105)).toBe('-1.05');
  });

  it('converts dollars number to cents', () => {
    expect(dollarsToCents(12.34)).toBe(1234);
  });

  it('throws for invalid cents and decimal strings', () => {
    expect(() => assertCents(Number.MAX_SAFE_INTEGER + 1)).toThrow();
    expect(() => decimalStringToCents('12.345')).toThrow();
  });
});
