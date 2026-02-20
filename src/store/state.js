function nowIso() {
  return new Date().toISOString();
}

class IdFactory {
  constructor() {
    this.counters = new Map();
  }

  next(prefix) {
    const current = this.counters.get(prefix) ?? 0;
    const next = current + 1;
    this.counters.set(prefix, next);
    return `${prefix}_${next}`;
  }
}

export class StateStore {
  constructor() {
    this.ids = new IdFactory();
    this.groups = new Map();
    this.members = new Map();
    this.expenses = new Map();
  }

  createGroup(name) {
    const id = this.ids.next("grp");
    const timestamp = nowIso();
    const group = {
      id,
      name,
      createdAt: timestamp,
      updatedAt: timestamp,
      memberIds: new Set(),
      expenseIds: new Set()
    };
    this.groups.set(id, group);
    return group;
  }

  updateGroup(group, patch) {
    if (patch.name) {
      group.name = patch.name;
    }
    group.updatedAt = nowIso();
    return group;
  }

  createMember(groupId, name) {
    const id = this.ids.next("mbr");
    const timestamp = nowIso();
    const member = {
      id,
      groupId,
      name,
      active: true,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.members.set(id, member);
    this.groups.get(groupId).memberIds.add(id);
    return member;
  }

  deactivateOrDeleteMember(member) {
    const hasHistory = Array.from(this.expenses.values()).some((expense) =>
      expense.groupId === member.groupId &&
      (expense.payerMemberId === member.id || expense.participantIds.includes(member.id))
    );

    if (hasHistory) {
      member.active = false;
      member.updatedAt = nowIso();
      return { mode: "deactivated", member };
    }

    const group = this.groups.get(member.groupId);
    group.memberIds.delete(member.id);
    this.members.delete(member.id);
    return { mode: "deleted", memberId: member.id };
  }

  createExpense(expense) {
    const id = this.ids.next("exp");
    const timestamp = nowIso();
    const record = {
      id,
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
      ...expense
    };
    this.expenses.set(id, record);
    this.groups.get(expense.groupId).expenseIds.add(id);
    return record;
  }

  updateExpense(expense, patch) {
    Object.assign(expense, patch);
    expense.version += 1;
    expense.updatedAt = nowIso();
    return expense;
  }

  deleteExpense(expense) {
    const group = this.groups.get(expense.groupId);
    group.expenseIds.delete(expense.id);
    this.expenses.delete(expense.id);
  }
}
