import test from 'node:test';
import assert from 'node:assert/strict';
import { computeBalances } from '../src/services/balance.js';

test('balance computation handles larger dataset within practical threshold', () => {
  const membersById = new Map();
  for (let i = 0; i < 150; i += 1) {
    membersById.set(`m${i}`, { id: `m${i}`, name: `Member ${i}`, active: true });
  }

  const memberIds = [...membersById.keys()];
  const expenses = [];
  for (let i = 0; i < 3000; i += 1) {
    expenses.push({
      status: 'final',
      amountCents: 1000 + (i % 10),
      payerMemberId: memberIds[i % memberIds.length],
      participantIds: memberIds.slice(0, 10)
    });
  }

  const start = Date.now();
  const result = computeBalances(expenses, membersById);
  const duration = Date.now() - start;

  assert.equal(result.members.length, 150);
  assert.ok(duration < 1500, `Expected compute time < 1500ms, got ${duration}ms`);
});
