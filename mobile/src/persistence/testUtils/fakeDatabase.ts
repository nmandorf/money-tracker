import type { RepositoryDatabase } from '../repository';

type GroupRow = { id: string; name: string; created_at: string };
type MemberRow = { id: string; group_id: string; name: string; created_at: string };
type ExpenseRow = {
  id: string;
  group_id: string;
  payer_id: string;
  description: string;
  amount_cents: number;
  split_method: 'equal' | 'percent';
  created_at: string;
};
type ParticipantRow = { expense_id: string; member_id: string; percent: number | null };
type ReceiptRow = {
  id: string;
  expense_id: string | null;
  image_uri: string;
  raw_text: string | null;
  created_at: string;
};

const includesSql = (source: string, token: string): boolean =>
  source.toLowerCase().includes(token.toLowerCase());

export class FakeDatabase implements RepositoryDatabase {
  private userVersion = 0;
  private groups: GroupRow[] = [];
  private members: MemberRow[] = [];
  private expenses: ExpenseRow[] = [];
  private expenseParticipants: ParticipantRow[] = [];
  private receipts: ReceiptRow[] = [];

  public async execAsync(source: string): Promise<void> {
    if (includesSql(source, 'pragma user_version =')) {
      const match = source.match(/PRAGMA user_version = (\d+)/i);
      this.userVersion = match ? Number(match[1]) : this.userVersion;
      return;
    }

    if (includesSql(source, 'delete from')) {
      this.expenseParticipants = [];
      this.receipts = [];
      this.expenses = [];
      this.members = [];
      this.groups = [];
    }
  }

  public async runAsync(source: string, ...params: unknown[]): Promise<void> {
    if (includesSql(source, 'insert into groups')) {
      const [id, name, createdAt] = params as [string, string, string];
      this.groups.push({ id, name, created_at: createdAt });
      return;
    }

    if (includesSql(source, 'insert into members')) {
      const [id, groupId, name, createdAt] = params as [string, string, string, string];
      this.members.push({ id, group_id: groupId, name, created_at: createdAt });
      return;
    }

    if (includesSql(source, 'insert into expenses')) {
      const [id, groupId, payerId, description, amountCents, splitMethod, createdAt] = params as [
        string,
        string,
        string,
        string,
        number,
        'equal' | 'percent',
        string
      ];
      this.expenses.push({
        id,
        group_id: groupId,
        payer_id: payerId,
        description,
        amount_cents: amountCents,
        split_method: splitMethod,
        created_at: createdAt
      });
      return;
    }

    if (includesSql(source, 'insert into expense_participants')) {
      const [expenseId, memberId, percent] = params as [string, string, number | null];
      this.expenseParticipants.push({ expense_id: expenseId, member_id: memberId, percent });
      return;
    }

    if (includesSql(source, 'insert into receipts')) {
      const [id, expenseId, imageUri, rawText, createdAt] = params as [
        string,
        string | null,
        string,
        string | null,
        string
      ];
      this.receipts.push({
        id,
        expense_id: expenseId,
        image_uri: imageUri,
        raw_text: rawText,
        created_at: createdAt
      });
      return;
    }
  }

  public async getFirstAsync<T>(source: string, ...params: unknown[]): Promise<T | null> {
    if (includesSql(source, 'pragma user_version')) {
      return { user_version: this.userVersion } as T;
    }

    if (includesSql(source, 'select id from groups where id')) {
      const [id] = params as [string];
      const row = this.groups.find((group) => group.id === id);
      return (row ? { id: row.id } : null) as T | null;
    }

    if (includesSql(source, 'select id from members where group_id') && includesSql(source, 'and name')) {
      const [groupId, name] = params as [string, string];
      const row = this.members.find((member) => member.group_id === groupId && member.name === name);
      return (row ? { id: row.id } : null) as T | null;
    }

    if (includesSql(source, 'select id from members where id') && includesSql(source, 'and group_id')) {
      const [memberId, groupId] = params as [string, string];
      const row = this.members.find((member) => member.id === memberId && member.group_id === groupId);
      return (row ? { id: row.id } : null) as T | null;
    }

    if (includesSql(source, 'select id from expenses where id')) {
      const [id] = params as [string];
      const row = this.expenses.find((expense) => expense.id === id);
      return (row ? { id: row.id } : null) as T | null;
    }

    return null;
  }

  public async getAllAsync<T>(source: string, ...params: unknown[]): Promise<T[]> {
    if (includesSql(source, 'from groups')) {
      return [...this.groups].sort((a, b) => b.created_at.localeCompare(a.created_at)) as T[];
    }

    if (includesSql(source, 'from members')) {
      const [groupId] = params as [string];
      return this.members
        .filter((member) => member.group_id === groupId)
        .sort((a, b) => a.created_at.localeCompare(b.created_at)) as T[];
    }

    if (includesSql(source, 'from expenses')) {
      const [groupId] = params as [string];
      return this.expenses
        .filter((expense) => expense.group_id === groupId)
        .sort((a, b) => b.created_at.localeCompare(a.created_at)) as T[];
    }

    if (includesSql(source, 'from expense_participants')) {
      const ids = params as string[];
      return this.expenseParticipants
        .filter((participant) => ids.includes(participant.expense_id))
        .sort((a, b) => a.member_id.localeCompare(b.member_id)) as T[];
    }

    return [];
  }

  public async withTransactionAsync(task: () => Promise<void>): Promise<void> {
    await task();
  }
}
