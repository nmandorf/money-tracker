import { createRepository } from '../repository';
import { RepositoryValidationError } from '../errors';
import { FakeDatabase } from '../testUtils/fakeDatabase';

describe('persistence repository integration', () => {
  let db: FakeDatabase;

  beforeEach(async () => {
    db = new FakeDatabase();
  });

  it('supports group/member/expense/receipt CRUD flows', async () => {
    const repo = createRepository(db);

    const group = await repo.createGroup('Trip');
    const alice = await repo.addMember(group.id, 'Alice');
    const bob = await repo.addMember(group.id, 'Bob');

    const expense = await repo.addExpense({
      groupId: group.id,
      payerId: alice.id,
      description: 'Dinner',
      amountCents: 5000,
      splitMethod: 'equal',
      participants: [{ memberId: alice.id }, { memberId: bob.id }]
    });

    const receipt = await repo.saveReceipt({
      expenseId: expense.id,
      imageUri: 'file:///receipt.jpg',
      rawText: 'Dinner total: 50.00'
    });

    const groups = await repo.listGroups();
    const members = await repo.listMembers(group.id);
    const expenses = await repo.listExpenses(group.id);

    expect(groups).toHaveLength(1);
    expect(members).toHaveLength(2);
    expect(expenses).toHaveLength(1);
    expect(expenses[0].participants).toHaveLength(2);
    expect(receipt.expenseId).toBe(expense.id);
  });

  it('rejects duplicate members in same group', async () => {
    const repo = createRepository(db);
    const group = await repo.createGroup('House');
    await repo.addMember(group.id, 'Alex');

    await expect(repo.addMember(group.id, 'Alex')).rejects.toMatchObject({
      code: 'DUPLICATE_MEMBER_NAME'
    } satisfies Partial<RepositoryValidationError>);
  });

  it('rejects expenses with participants not in group', async () => {
    const repo = createRepository(db);
    const group = await repo.createGroup('Camping');
    const payer = await repo.addMember(group.id, 'Payer');
    const outsiderGroup = await repo.createGroup('Other');
    const outsider = await repo.addMember(outsiderGroup.id, 'Outsider');

    await expect(
      repo.addExpense({
        groupId: group.id,
        payerId: payer.id,
        description: 'Snacks',
        amountCents: 1000,
        splitMethod: 'equal',
        participants: [{ memberId: payer.id }, { memberId: outsider.id }]
      })
    ).rejects.toMatchObject({
      code: 'INVALID_PARTICIPANTS'
    } satisfies Partial<RepositoryValidationError>);
  });
});
