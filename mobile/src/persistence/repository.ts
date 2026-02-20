import { assertCents } from '../domain/money';
import { RepositoryValidationError } from './errors';
import type {
  AddExpenseInput,
  ExpenseParticipantInput,
  ExpenseRecord,
  GroupRecord,
  MemberRecord,
  ReceiptRecord,
  SaveReceiptInput,
  SplitMethod
} from './types';

export type RepositoryDatabase = {
  runAsync(source: string, ...params: unknown[]): Promise<unknown>;
  getFirstAsync<T>(source: string, ...params: unknown[]): Promise<T | null>;
  getAllAsync<T>(source: string, ...params: unknown[]): Promise<T[]>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
};

const nowIso = (): string => new Date().toISOString();
const newId = (prefix: string): string => `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;

const isEmptyString = (value: string): boolean => value.trim().length === 0;

const sumPercentBasisPoints = (participants: ExpenseParticipantInput[]): number =>
  participants.reduce((sum, participant) => {
    if (participant.percent === undefined) {
      return sum;
    }
    return sum + Math.round(participant.percent * 100);
  }, 0);

const isMemberInGroup = async (db: RepositoryDatabase, memberId: string, groupId: string): Promise<boolean> => {
  const member = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM members WHERE id = ? AND group_id = ?;',
    memberId,
    groupId
  );
  return member !== null;
};

export type Repository = {
  createGroup(name: string): Promise<GroupRecord>;
  listGroups(): Promise<GroupRecord[]>;
  addMember(groupId: string, name: string): Promise<MemberRecord>;
  listMembers(groupId: string): Promise<MemberRecord[]>;
  addExpense(input: AddExpenseInput): Promise<ExpenseRecord>;
  listExpenses(groupId: string): Promise<ExpenseRecord[]>;
  saveReceipt(input: SaveReceiptInput): Promise<ReceiptRecord>;
};

export const createRepository = (db: RepositoryDatabase): Repository => ({
  async createGroup(name: string): Promise<GroupRecord> {
    if (isEmptyString(name)) {
      throw new RepositoryValidationError('INVALID_INPUT', 'Group name is required.');
    }

    const createdAt = nowIso();
    const id = newId('grp');
    await db.runAsync('INSERT INTO groups (id, name, created_at) VALUES (?, ?, ?);', id, name.trim(), createdAt);

    return { id, name: name.trim(), createdAt };
  },

  async listGroups(): Promise<GroupRecord[]> {
    const rows = await db.getAllAsync<{ id: string; name: string; created_at: string }>(
      'SELECT id, name, created_at FROM groups ORDER BY created_at DESC;'
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      createdAt: row.created_at
    }));
  },

  async addMember(groupId: string, name: string): Promise<MemberRecord> {
    if (isEmptyString(groupId) || isEmptyString(name)) {
      throw new RepositoryValidationError('INVALID_INPUT', 'Group id and member name are required.');
    }

    const group = await db.getFirstAsync<{ id: string }>('SELECT id FROM groups WHERE id = ?;', groupId);
    if (!group) {
      throw new RepositoryValidationError('GROUP_NOT_FOUND', 'Group does not exist.');
    }

    const duplicate = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM members WHERE group_id = ? AND name = ?;',
      groupId,
      name.trim()
    );
    if (duplicate) {
      throw new RepositoryValidationError('DUPLICATE_MEMBER_NAME', 'Member name already exists in this group.');
    }

    const id = newId('mem');
    const createdAt = nowIso();
    await db.runAsync(
      'INSERT INTO members (id, group_id, name, created_at) VALUES (?, ?, ?, ?);',
      id,
      groupId,
      name.trim(),
      createdAt
    );

    return { id, groupId, name: name.trim(), createdAt };
  },

  async listMembers(groupId: string): Promise<MemberRecord[]> {
    const rows = await db.getAllAsync<{ id: string; group_id: string; name: string; created_at: string }>(
      'SELECT id, group_id, name, created_at FROM members WHERE group_id = ? ORDER BY created_at ASC;',
      groupId
    );
    return rows.map((row) => ({
      id: row.id,
      groupId: row.group_id,
      name: row.name,
      createdAt: row.created_at
    }));
  },

  async addExpense(input: AddExpenseInput): Promise<ExpenseRecord> {
    const { groupId, payerId, description, amountCents, splitMethod, participants } = input;

    if (isEmptyString(groupId) || isEmptyString(payerId) || isEmptyString(description)) {
      throw new RepositoryValidationError('INVALID_INPUT', 'Group, payer, and description are required.');
    }

    if (participants.length === 0) {
      throw new RepositoryValidationError('INVALID_PARTICIPANTS', 'At least one participant is required.');
    }

    if (!Number.isInteger(amountCents) || assertCents(amountCents, 'amountCents') <= 0) {
      throw new RepositoryValidationError('INVALID_INPUT', 'amountCents must be a positive integer.');
    }

    const group = await db.getFirstAsync<{ id: string }>('SELECT id FROM groups WHERE id = ?;', groupId);
    if (!group) {
      throw new RepositoryValidationError('GROUP_NOT_FOUND', 'Group does not exist.');
    }

    if (!(await isMemberInGroup(db, payerId, groupId))) {
      throw new RepositoryValidationError('MEMBER_NOT_FOUND', 'Payer is not in the target group.');
    }

    const participantIds = participants.map((participant) => participant.memberId);
    const distinctParticipantIds = new Set(participantIds);
    if (distinctParticipantIds.size !== participantIds.length) {
      throw new RepositoryValidationError('INVALID_PARTICIPANTS', 'Participant ids must be unique.');
    }

    for (const participant of participants) {
      if (!(await isMemberInGroup(db, participant.memberId, groupId))) {
        throw new RepositoryValidationError('INVALID_PARTICIPANTS', 'All participants must belong to the group.');
      }
    }

    if (splitMethod === 'percent') {
      const hasMissingPercent = participants.some((participant) => participant.percent === undefined);
      if (hasMissingPercent) {
        throw new RepositoryValidationError('INVALID_SPLIT_PERCENT', 'Percent split requires percent values.');
      }

      const totalBasisPoints = sumPercentBasisPoints(participants);
      if (totalBasisPoints !== 10_000) {
        throw new RepositoryValidationError('INVALID_SPLIT_PERCENT', 'Percent split must equal exactly 100.00.');
      }
    }

    if (splitMethod === 'equal') {
      const hasPercentValue = participants.some((participant) => participant.percent !== undefined);
      if (hasPercentValue) {
        throw new RepositoryValidationError('INVALID_SPLIT_PERCENT', 'Equal split participants must not include percent.');
      }
    }

    const id = newId('exp');
    const createdAt = nowIso();
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        'INSERT INTO expenses (id, group_id, payer_id, description, amount_cents, split_method, created_at) VALUES (?, ?, ?, ?, ?, ?, ?);',
        id,
        groupId,
        payerId,
        description.trim(),
        amountCents,
        splitMethod,
        createdAt
      );

      for (const participant of participants) {
        await db.runAsync(
          'INSERT INTO expense_participants (expense_id, member_id, percent) VALUES (?, ?, ?);',
          id,
          participant.memberId,
          splitMethod === 'percent' ? participant.percent ?? null : null
        );
      }
    });

    return {
      id,
      groupId,
      payerId,
      description: description.trim(),
      amountCents,
      splitMethod,
      createdAt,
      participants: participants.map((participant) => ({
        memberId: participant.memberId,
        percent: splitMethod === 'percent' ? participant.percent ?? null : null
      }))
    };
  },

  async listExpenses(groupId: string): Promise<ExpenseRecord[]> {
    const expenseRows = await db.getAllAsync<{
      id: string;
      group_id: string;
      payer_id: string;
      description: string;
      amount_cents: number;
      split_method: SplitMethod;
      created_at: string;
    }>('SELECT id, group_id, payer_id, description, amount_cents, split_method, created_at FROM expenses WHERE group_id = ? ORDER BY created_at DESC;', groupId);

    if (expenseRows.length === 0) {
      return [];
    }

    const participantRows = await db.getAllAsync<{ expense_id: string; member_id: string; percent: number | null }>(
      `
        SELECT expense_id, member_id, percent
        FROM expense_participants
        WHERE expense_id IN (${expenseRows.map(() => '?').join(', ')})
        ORDER BY member_id ASC;
      `,
      ...expenseRows.map((expense) => expense.id)
    );

    return expenseRows.map((expense) => ({
      id: expense.id,
      groupId: expense.group_id,
      payerId: expense.payer_id,
      description: expense.description,
      amountCents: expense.amount_cents,
      splitMethod: expense.split_method,
      createdAt: expense.created_at,
      participants: participantRows
        .filter((participant) => participant.expense_id === expense.id)
        .map((participant) => ({
          memberId: participant.member_id,
          percent: participant.percent
        }))
    }));
  },

  async saveReceipt(input: SaveReceiptInput): Promise<ReceiptRecord> {
    if (isEmptyString(input.imageUri)) {
      throw new RepositoryValidationError('INVALID_INPUT', 'imageUri is required.');
    }

    if (input.expenseId) {
      const expense = await db.getFirstAsync<{ id: string }>('SELECT id FROM expenses WHERE id = ?;', input.expenseId);
      if (!expense) {
        throw new RepositoryValidationError('EXPENSE_NOT_FOUND', 'expenseId does not exist.');
      }
    }

    const id = newId('rcp');
    const createdAt = nowIso();
    await db.runAsync(
      'INSERT INTO receipts (id, expense_id, image_uri, raw_text, created_at) VALUES (?, ?, ?, ?, ?);',
      id,
      input.expenseId ?? null,
      input.imageUri,
      input.rawText ?? null,
      createdAt
    );

    return {
      id,
      expenseId: input.expenseId ?? null,
      imageUri: input.imageUri,
      rawText: input.rawText ?? null,
      createdAt
    };
  }
});
