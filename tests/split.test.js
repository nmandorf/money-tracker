import test from 'node:test';
import assert from 'node:assert/strict';
import { splitEqualDeterministic } from '../src/services/split.js';

test('splitEqualDeterministic reconciles amount with deterministic remainder', () => {
  const shares = splitEqualDeterministic(1001, ['m2', 'm1', 'm3']);
  assert.deepEqual(shares, [
    { memberId: 'm1', shareCents: 334 },
    { memberId: 'm2', shareCents: 334 },
    { memberId: 'm3', shareCents: 333 }
  ]);

  const sum = shares.reduce((acc, item) => acc + item.shareCents, 0);
  assert.equal(sum, 1001);
});
