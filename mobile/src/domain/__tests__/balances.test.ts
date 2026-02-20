import { computeBalances, computeSettlements } from '../balances';

describe('computeBalances', () => {
  it('computes net balances from expenses', () => {
    const balances = computeBalances(['alice', 'bob', 'cara'], [
      {
        payerId: 'alice',
        allocations: [
          { memberId: 'alice', cents: 300 },
          { memberId: 'bob', cents: 300 },
          { memberId: 'cara', cents: 300 }
        ]
      },
      {
        payerId: 'bob',
        allocations: [
          { memberId: 'alice', cents: 150 },
          { memberId: 'bob', cents: 150 }
        ]
      }
    ]);

    expect(balances).toEqual([
      { memberId: 'alice', balanceCents: 450 },
      { memberId: 'bob', balanceCents: -150 },
      { memberId: 'cara', balanceCents: -300 }
    ]);
  });
});

describe('computeSettlements', () => {
  it('produces deterministic transfers that net balances to zero', () => {
    const transfers = computeSettlements([
      { memberId: 'alice', balanceCents: 450 },
      { memberId: 'bob', balanceCents: 450 },
      { memberId: 'cara', balanceCents: -900 }
    ]);

    expect(transfers).toEqual([
      { fromMemberId: 'cara', toMemberId: 'alice', cents: 450 },
      { fromMemberId: 'cara', toMemberId: 'bob', cents: 450 }
    ]);
  });

  it('throws if balances are not net-zero', () => {
    expect(() =>
      computeSettlements([
        { memberId: 'alice', balanceCents: 100 },
        { memberId: 'bob', balanceCents: 0 }
      ])
    ).toThrow();
  });
});
