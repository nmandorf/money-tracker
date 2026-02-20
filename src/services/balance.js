import { splitEqualDeterministic } from "./split.js";
import { centsToAmount } from "../lib/money.js";

export function computeBalances(expenses, membersById) {
  const balances = new Map();

  for (const member of membersById.values()) {
    balances.set(member.id, 0);
  }

  const finalized = expenses.filter((expense) => expense.status === "final");
  for (const expense of finalized) {
    const shares = splitEqualDeterministic(expense.amountCents, expense.participantIds);
    balances.set(
      expense.payerMemberId,
      (balances.get(expense.payerMemberId) ?? 0) + expense.amountCents
    );
    for (const share of shares) {
      balances.set(share.memberId, (balances.get(share.memberId) ?? 0) - share.shareCents);
    }
  }

  const members = Array.from(membersById.values()).map((member) => ({
    memberId: member.id,
    name: member.name,
    active: member.active,
    netCents: balances.get(member.id) ?? 0,
    netAmount: centsToAmount(balances.get(member.id) ?? 0)
  }));

  return {
    members,
    settlement: createSettlementEntries(members)
  };
}

function createSettlementEntries(memberBalances) {
  const creditors = memberBalances
    .filter((entry) => entry.netCents > 0)
    .map((entry) => ({ ...entry, remaining: entry.netCents }))
    .sort((a, b) => a.memberId.localeCompare(b.memberId));
  const debtors = memberBalances
    .filter((entry) => entry.netCents < 0)
    .map((entry) => ({ ...entry, remaining: Math.abs(entry.netCents) }))
    .sort((a, b) => a.memberId.localeCompare(b.memberId));

  const settlement = [];
  let d = 0;
  let c = 0;
  while (d < debtors.length && c < creditors.length) {
    const debtor = debtors[d];
    const creditor = creditors[c];
    const amountCents = Math.min(debtor.remaining, creditor.remaining);
    settlement.push({
      fromMemberId: debtor.memberId,
      fromName: debtor.name,
      toMemberId: creditor.memberId,
      toName: creditor.name,
      amountCents,
      amount: centsToAmount(amountCents)
    });

    debtor.remaining -= amountCents;
    creditor.remaining -= amountCents;
    if (debtor.remaining === 0) d += 1;
    if (creditor.remaining === 0) c += 1;
  }

  return settlement;
}
