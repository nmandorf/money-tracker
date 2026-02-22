import { parseReceiptText } from '../parser';

describe('receipt parser heuristics', () => {
  it('extracts vendor/date and chooses the maximum total-like amount', () => {
    const parsed = parseReceiptText(
      'Trader Store\nDate: 2026-02-20\nSubtotal 18.10\nTax 1.20\nTotal 19.30\nTip 2.50'
    );

    expect(parsed.vendorName).toBe('Trader Store');
    expect(parsed.date).toBe('2026-02-20');
    expect(parsed.amountCents).toBe(1930);
  });

  it('returns nulls when text has no parsable values', () => {
    const parsed = parseReceiptText('No totals here');
    expect(parsed.amountCents).toBeNull();
  });
});
