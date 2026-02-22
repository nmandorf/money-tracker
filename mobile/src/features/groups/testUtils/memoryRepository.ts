import { RepositoryValidationError, type Repository } from '../../../persistence';

type Group = { id: string; name: string; createdAt: string };
type Member = { id: string; groupId: string; name: string; createdAt: string };
type Expense = {
  id: string;
  groupId: string;
  payerId: string;
  description: string;
  amountCents: number;
  splitMethod: 'equal' | 'percent';
  createdAt: string;
  participants: { memberId: string; percent: number | null }[];
};
type Receipt = {
  id: string;
  expenseId: string | null;
  imageUri: string;
  rawText: string | null;
  createdAt: string;
};

let groupCounter = 1;
let memberCounter = 1;
let expenseCounter = 1;
let receiptCounter = 1;

export const createMemoryRepository = (): Repository => {
  const groups: Group[] = [];
  const members: Member[] = [];
  const expenses: Expense[] = [];
  const receipts: Receipt[] = [];

  return {
    async createGroup(name: string) {
      const trimmed = name.trim();
      if (!trimmed) {
        throw new RepositoryValidationError('INVALID_INPUT', 'Group name is required.');
      }
      const group = { id: `grp_${groupCounter++}`, name: trimmed, createdAt: new Date().toISOString() };
      groups.unshift(group);
      return group;
    },
    async listGroups() {
      return [...groups];
    },
    async addMember(groupId: string, name: string) {
      const trimmed = name.trim();
      if (!trimmed) {
        throw new RepositoryValidationError('INVALID_INPUT', 'Member name is required.');
      }
      const duplicate = members.find((member) => member.groupId === groupId && member.name === trimmed);
      if (duplicate) {
        throw new RepositoryValidationError('DUPLICATE_MEMBER_NAME', 'Duplicate member');
      }
      const member = {
        id: `mem_${memberCounter++}`,
        groupId,
        name: trimmed,
        createdAt: new Date().toISOString()
      };
      members.push(member);
      return member;
    },
    async listMembers(groupId: string) {
      return members.filter((member) => member.groupId === groupId);
    },
    async addExpense(input) {
      if (!input.description.trim() || input.amountCents <= 0 || input.participants.length === 0) {
        throw new RepositoryValidationError('INVALID_INPUT', 'Invalid expense.');
      }
      const memberIds = members.filter((member) => member.groupId === input.groupId).map((member) => member.id);
      if (!memberIds.includes(input.payerId)) {
        throw new RepositoryValidationError('MEMBER_NOT_FOUND', 'Payer not in group.');
      }
      const participantIds = input.participants.map((participant) => participant.memberId);
      if (new Set(participantIds).size !== participantIds.length) {
        throw new RepositoryValidationError('INVALID_PARTICIPANTS', 'Duplicate participants');
      }
      if (participantIds.some((memberId) => !memberIds.includes(memberId))) {
        throw new RepositoryValidationError('INVALID_PARTICIPANTS', 'Participant not in group.');
      }
      if (input.splitMethod === 'percent') {
        const sum = input.participants.reduce((total, participant) => total + Math.round((participant.percent ?? 0) * 100), 0);
        if (sum !== 10_000) {
          throw new RepositoryValidationError('INVALID_SPLIT_PERCENT', 'Percent must total 100.00');
        }
      }

      const expense: Expense = {
        id: `exp_${expenseCounter++}`,
        groupId: input.groupId,
        payerId: input.payerId,
        description: input.description.trim(),
        amountCents: input.amountCents,
        splitMethod: input.splitMethod,
        createdAt: new Date().toISOString(),
        participants: input.participants.map((participant) => ({
          memberId: participant.memberId,
          percent: input.splitMethod === 'percent' ? participant.percent ?? null : null
        }))
      };
      expenses.unshift(expense);
      return expense;
    },
    async listExpenses(groupId) {
      return expenses.filter((expense) => expense.groupId === groupId);
    },
    async saveReceipt(input) {
      const receipt: Receipt = {
        id: `rcp_${receiptCounter++}`,
        expenseId: input.expenseId ?? null,
        imageUri: input.imageUri,
        rawText: input.rawText ?? null,
        createdAt: new Date().toISOString()
      };
      receipts.push(receipt);
      return receipt;
    }
  };
};
