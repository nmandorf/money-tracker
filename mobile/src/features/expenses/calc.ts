import { computeBalances, computeSettlements, splitByPercent, splitEqual, type Expense as DomainExpense } from '../../domain';
import type { ExpenseRecord } from '../../persistence';

export const toDomainExpenses = (expenses: ExpenseRecord[]): DomainExpense[] =>
  expenses.map((expense) => {
    const participantIds = expense.participants.map((participant) => participant.memberId);
    const allocations =
      expense.splitMethod === 'equal'
        ? splitEqual(expense.amountCents, participantIds)
        : splitByPercent(
            expense.amountCents,
            expense.participants.map((participant) => ({
              memberId: participant.memberId,
              percent: participant.percent ?? 0
            }))
          );

    return {
      payerId: expense.payerId,
      allocations
    };
  });

export const computeExpenseBalances = (memberIds: string[], expenses: ExpenseRecord[]) =>
  computeBalances(memberIds, toDomainExpenses(expenses));

export const computeExpenseSettlements = (memberIds: string[], expenses: ExpenseRecord[]) =>
  computeSettlements(computeExpenseBalances(memberIds, expenses));
