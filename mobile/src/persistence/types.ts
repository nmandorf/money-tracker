export type SplitMethod = 'equal' | 'percent';

export type GroupRecord = {
  id: string;
  name: string;
  createdAt: string;
};

export type MemberRecord = {
  id: string;
  groupId: string;
  name: string;
  createdAt: string;
};

export type ExpenseParticipantInput = {
  memberId: string;
  percent?: number;
};

export type AddExpenseInput = {
  groupId: string;
  payerId: string;
  description: string;
  amountCents: number;
  splitMethod: SplitMethod;
  participants: ExpenseParticipantInput[];
};

export type ExpenseRecord = {
  id: string;
  groupId: string;
  payerId: string;
  description: string;
  amountCents: number;
  splitMethod: SplitMethod;
  createdAt: string;
  participants: {
    memberId: string;
    percent: number | null;
  }[];
};

export type SaveReceiptInput = {
  expenseId?: string | null;
  imageUri: string;
  rawText?: string | null;
};

export type ReceiptRecord = {
  id: string;
  expenseId: string | null;
  imageUri: string;
  rawText: string | null;
  createdAt: string;
};
