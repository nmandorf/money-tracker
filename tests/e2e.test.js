import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../src/app.js';

function startTestServer() {
  const app = createApp();
  const server = http.createServer(app);
  return new Promise((resolve) => {
    server.listen(0, () => {
      const address = server.address();
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${address.port}`
      });
    });
  });
}

async function jsonRequest(baseUrl, path, method, body) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  return { status: res.status, body: await res.json() };
}

test('group, members, manual expense, and balances flow', async () => {
  const { server, baseUrl } = await startTestServer();

  try {
    const group = await jsonRequest(baseUrl, '/groups', 'POST', { name: 'Trip' });
    assert.equal(group.status, 201);

    const a = await jsonRequest(baseUrl, `/groups/${group.body.id}/members`, 'POST', { name: 'Alex' });
    const b = await jsonRequest(baseUrl, `/groups/${group.body.id}/members`, 'POST', { name: 'Blair' });
    assert.equal(a.status, 201);
    assert.equal(b.status, 201);

    const expense = await jsonRequest(baseUrl, `/groups/${group.body.id}/expenses/manual`, 'POST', {
      amount: 20,
      payerMemberId: a.body.id,
      participantIds: [a.body.id, b.body.id],
      note: 'Lunch'
    });
    assert.equal(expense.status, 201);

    const balances = await jsonRequest(baseUrl, `/groups/${group.body.id}/balances`, 'GET');
    assert.equal(balances.status, 200);
    const alex = balances.body.members.find((m) => m.memberId === a.body.id);
    const blair = balances.body.members.find((m) => m.memberId === b.body.id);
    assert.equal(alex.netCents, 1000);
    assert.equal(blair.netCents, -1000);
    assert.equal(balances.body.settlement[0].fromMemberId, b.body.id);
    assert.equal(balances.body.settlement[0].toMemberId, a.body.id);
  } finally {
    server.close();
  }
});

test('receipt draft is excluded from balances and supports optimistic locking', async () => {
  const { server, baseUrl } = await startTestServer();

  try {
    const group = await jsonRequest(baseUrl, '/groups', 'POST', { name: 'House' });
    const a = await jsonRequest(baseUrl, `/groups/${group.body.id}/members`, 'POST', { name: 'A' });
    const b = await jsonRequest(baseUrl, `/groups/${group.body.id}/members`, 'POST', { name: 'B' });

    const draft = await jsonRequest(baseUrl, `/groups/${group.body.id}/expenses/receipt`, 'POST', {
      payerMemberId: a.body.id,
      participantIds: [a.body.id, b.body.id],
      imageName: 'grocery-48.50.jpg',
      imageMimeType: 'image/jpeg',
      imageData: Buffer.from('fake').toString('base64')
    });
    assert.equal(draft.status, 202);

    const balancesBefore = await jsonRequest(baseUrl, `/groups/${group.body.id}/balances`, 'GET');
    assert.equal(balancesBefore.body.members.every((m) => m.netCents === 0), true);

    const wrongVersion = await jsonRequest(baseUrl, `/groups/${group.body.id}/expenses/${draft.body.id}`, 'PATCH', {
      version: 999,
      note: 'bad update'
    });
    assert.equal(wrongVersion.status, 409);
  } finally {
    server.close();
  }
});

test('supports many members and preserves historical links when a member is removed', async () => {
  const { server, baseUrl } = await startTestServer();

  try {
    const group = await jsonRequest(baseUrl, '/groups', 'POST', { name: 'Big Group' });
    const memberIds = [];
    for (let i = 0; i < 120; i += 1) {
      const member = await jsonRequest(baseUrl, `/groups/${group.body.id}/members`, 'POST', { name: `m${i}` });
      assert.equal(member.status, 201);
      memberIds.push(member.body.id);
    }

    const expense = await jsonRequest(baseUrl, `/groups/${group.body.id}/expenses/manual`, 'POST', {
      amount: 12,
      payerMemberId: memberIds[0],
      participantIds: [memberIds[0], memberIds[1]],
      note: 'Shared snack'
    });
    assert.equal(expense.status, 201);

    const removed = await jsonRequest(
      baseUrl,
      `/groups/${group.body.id}/members/${memberIds[1]}`,
      'DELETE'
    );
    assert.equal(removed.status, 200);
    assert.equal(removed.body.mode, 'deactivated');

    const balances = await jsonRequest(baseUrl, `/groups/${group.body.id}/balances`, 'GET');
    const removedMember = balances.body.members.find((m) => m.memberId === memberIds[1]);
    assert.equal(removedMember.active, false);
    assert.equal(removedMember.netCents, -600);
  } finally {
    server.close();
  }
});
