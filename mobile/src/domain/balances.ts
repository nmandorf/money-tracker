import { assertCents } from './money';
import type { Balance, Expense, MemberId, SettlementTransfer } from './types';

const sortMemberIds = (memberIds: MemberId[]): MemberId[] => [...memberIds].sort((a, b) => a.localeCompare(b));

export const computeBalances = (memberIds: MemberId[], expenses: Expense[]): Balance[] => {
  const orderedMembers = sortMemberIds(memberIds);
  const balances: Record<MemberId, number> = {};

  for (const memberId of orderedMembers) {
    balances[memberId] = 0;
  }

  for (const expense of expenses) {
    if (balances[expense.payerId] === undefined) {
      throw new Error(`Unknown payerId: ${expense.payerId}`);
    }

    const expenseTotal = expense.allocations.reduce((sum, item) => {
      if (balances[item.memberId] === undefined) {
        throw new Error(`Unknown memberId in allocations: ${item.memberId}`);
      }

      return sum + assertCents(item.cents, 'allocation cents');
    }, 0);

    balances[expense.payerId] += expenseTotal;

    for (const allocation of expense.allocations) {
      balances[allocation.memberId] -= allocation.cents;
    }
  }

  return orderedMembers.map((memberId) => ({
    memberId,
    balanceCents: assertCents(balances[memberId], 'balance')
  }));
};

export const computeSettlements = (balances: Balance[]): SettlementTransfer[] => {
  const normalizedBalances = [...balances]
    .map((item) => ({
      memberId: item.memberId,
      balanceCents: assertCents(item.balanceCents, 'balanceCents')
    }))
    .sort((a, b) => a.memberId.localeCompare(b.memberId));

  const total = normalizedBalances.reduce((sum, item) => sum + item.balanceCents, 0);

  if (total !== 0) {
    throw new Error('balances must sum to zero');
  }

  const creditors = normalizedBalances
    .filter((item) => item.balanceCents > 0)
    .map((item) => ({ ...item }));
  const debtors = normalizedBalances
    .filter((item) => item.balanceCents < 0)
    .map((item) => ({ memberId: item.memberId, debtCents: -item.balanceCents }));

  const transfers: SettlementTransfer[] = [];
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    const transferCents = Math.min(creditor.balanceCents, debtor.debtCents);

    transfers.push({
      fromMemberId: debtor.memberId,
      toMemberId: creditor.memberId,
      cents: transferCents
    });

    creditor.balanceCents -= transferCents;
    debtor.debtCents -= transferCents;

    if (creditor.balanceCents === 0) {
      creditorIndex += 1;
    }

    if (debtor.debtCents === 0) {
      debtorIndex += 1;
    }
  }

  return transfers;
};
