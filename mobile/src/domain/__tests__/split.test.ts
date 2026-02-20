import { splitByPercent, splitEqual } from '../split';

describe('splitEqual', () => {
  it('splits evenly when divisible', () => {
    expect(splitEqual(900, ['b', 'a', 'c'])).toEqual([
      { memberId: 'a', cents: 300 },
      { memberId: 'b', cents: 300 },
      { memberId: 'c', cents: 300 }
    ]);
  });

  it('distributes remainder deterministically by member order', () => {
    expect(splitEqual(1000, ['c', 'a', 'b'])).toEqual([
      { memberId: 'a', cents: 334 },
      { memberId: 'b', cents: 333 },
      { memberId: 'c', cents: 333 }
    ]);
  });
});

describe('splitByPercent', () => {
  it('splits by percentages with exact total', () => {
    expect(
      splitByPercent(1000, [
        { memberId: 'b', percent: 30 },
        { memberId: 'a', percent: 70 }
      ])
    ).toEqual([
      { memberId: 'a', cents: 700 },
      { memberId: 'b', cents: 300 }
    ]);
  });

  it('allocates leftover cents deterministically when percent causes fractions', () => {
    expect(
      splitByPercent(100, [
        { memberId: 'a', percent: 33.33 },
        { memberId: 'b', percent: 33.33 },
        { memberId: 'c', percent: 33.34 }
      ])
    ).toEqual([
      { memberId: 'a', cents: 33 },
      { memberId: 'b', cents: 33 },
      { memberId: 'c', cents: 34 }
    ]);
  });

  it('throws when percentages do not sum exactly to 100.00', () => {
    expect(() =>
      splitByPercent(1000, [
        { memberId: 'a', percent: 50 },
        { memberId: 'b', percent: 49.99 }
      ])
    ).toThrow();
  });
});
