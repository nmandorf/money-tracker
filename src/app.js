import { createHttpError, notFound, readJson, sendJson } from "./lib/http.js";
import { parseAmountToCents } from "./lib/money.js";
import { StateStore } from "./store/state.js";
import { computeBalances } from "./services/balance.js";
import { extractReceiptSuggestions, validateReceiptFile } from "./services/ocr.js";
import { increment, snapshotMetrics } from "./services/metrics.js";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export function createApp() {
  const store = new StateStore();
  const uiPath = resolve(process.cwd(), "public/index.html");

  return async function handleRequest(req, res) {
    try {
      const url = new URL(req.url, "http://localhost");
      const method = req.method;

      if (method === "GET" && url.pathname === "/health") {
        return sendJson(res, 200, {
          ok: true,
          ocrEnabled: process.env.OCR_ENABLED !== "0",
          metrics: snapshotMetrics()
        });
      }

      if (method === "GET" && url.pathname === "/") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Money Tracker API");
        return;
      }

      if (method === "GET" && url.pathname === "/app") {
        const html = await readFile(uiPath, "utf8");
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(html);
        return;
      }

      if (method === "POST" && url.pathname === "/groups") {
        const body = await readJson(req);
        requireNonEmptyString(body.name, "name");
        const group = store.createGroup(body.name.trim());
        increment("groups.created");
        return sendJson(res, 201, serializeGroup(group, store));
      }

      const groupMatch = url.pathname.match(/^\/groups\/(grp_\d+)$/);
      if (groupMatch && method === "PATCH") {
        const group = requireGroup(store, groupMatch[1]);
        const body = await readJson(req);
        requireNonEmptyString(body.name, "name");
        store.updateGroup(group, body);
        increment("groups.updated");
        return sendJson(res, 200, serializeGroup(group, store));
      }

      const addMemberMatch = url.pathname.match(/^\/groups\/(grp_\d+)\/members$/);
      if (addMemberMatch && method === "POST") {
        const group = requireGroup(store, addMemberMatch[1]);
        const body = await readJson(req);
        requireNonEmptyString(body.name, "name");
        const member = store.createMember(group.id, body.name.trim());
        increment("members.created");
        return sendJson(res, 201, member);
      }

      const removeMemberMatch = url.pathname.match(/^\/groups\/(grp_\d+)\/members\/(mbr_\d+)$/);
      if (removeMemberMatch && method === "DELETE") {
        const group = requireGroup(store, removeMemberMatch[1]);
        const member = requireMember(store, removeMemberMatch[2], group.id);
        const result = store.deactivateOrDeleteMember(member);
        increment("members.removed");
        return sendJson(res, 200, result);
      }

      const manualExpenseMatch = url.pathname.match(/^\/groups\/(grp_\d+)\/expenses\/manual$/);
      if (manualExpenseMatch && method === "POST") {
        const group = requireGroup(store, manualExpenseMatch[1]);
        const body = await readJson(req);
        validateExpenseBody(store, group.id, body, { requireAmount: true });

        const expense = store.createExpense({
          groupId: group.id,
          source: "manual",
          status: "final",
          payerMemberId: body.payerMemberId,
          participantIds: dedupe(body.participantIds),
          amountCents: parseAmountToCents(body.amount),
          note: body.note ?? "",
          date: body.date ?? new Date().toISOString(),
          imageName: null,
          imageMimeType: null,
          imageData: null,
          ocrStatus: "not_applicable",
          ocrSuggestions: null
        });

        increment("expenses.manual.created");
        return sendJson(res, 201, serializeExpense(expense));
      }

      const receiptExpenseMatch = url.pathname.match(/^\/groups\/(grp_\d+)\/expenses\/receipt$/);
      if (receiptExpenseMatch && method === "POST") {
        const group = requireGroup(store, receiptExpenseMatch[1]);
        const body = await readJson(req);
        validateExpenseBody(store, group.id, body, { requireAmount: false });
        validateReceiptFile(body);

        const expense = store.createExpense({
          groupId: group.id,
          source: "receipt",
          status: "draft",
          payerMemberId: body.payerMemberId,
          participantIds: dedupe(body.participantIds),
          amountCents: null,
          note: body.note ?? "",
          date: body.date ?? new Date().toISOString(),
          imageName: body.imageName,
          imageMimeType: body.imageMimeType,
          imageData: body.imageData,
          ocrStatus: "pending",
          ocrSuggestions: null
        });

        increment("expenses.receipt.created");
        processReceiptAsync(store, expense.id);
        return sendJson(res, 202, serializeExpense(expense));
      }

      const expenseFinalizeMatch = url.pathname.match(/^\/groups\/(grp_\d+)\/expenses\/(exp_\d+)\/finalize$/);
      if (expenseFinalizeMatch && method === "PATCH") {
        const group = requireGroup(store, expenseFinalizeMatch[1]);
        const expense = requireExpense(store, expenseFinalizeMatch[2], group.id);
        const body = await readJson(req);

        requireVersionMatch(expense, body.version);

        const amount = body.amount ?? expense.ocrSuggestions?.amount;
        if (amount === undefined || amount === null) {
          throw createHttpError(400, "Amount is required to finalize receipt expense");
        }

        validateExpenseBody(store, group.id, {
          payerMemberId: body.payerMemberId ?? expense.payerMemberId,
          participantIds: body.participantIds ?? expense.participantIds,
          amount
        }, { requireAmount: true });

        store.updateExpense(expense, {
          status: "final",
          amountCents: parseAmountToCents(amount),
          payerMemberId: body.payerMemberId ?? expense.payerMemberId,
          participantIds: dedupe(body.participantIds ?? expense.participantIds),
          note: body.note ?? expense.note,
          date: body.date ?? expense.date
        });
        increment("expenses.finalized");
        return sendJson(res, 200, serializeExpense(expense));
      }

      const expenseUpdateMatch = url.pathname.match(/^\/groups\/(grp_\d+)\/expenses\/(exp_\d+)$/);
      if (expenseUpdateMatch && method === "PATCH") {
        const group = requireGroup(store, expenseUpdateMatch[1]);
        const expense = requireExpense(store, expenseUpdateMatch[2], group.id);
        const body = await readJson(req);
        requireVersionMatch(expense, body.version);

        const patch = {
          note: body.note ?? expense.note,
          date: body.date ?? expense.date
        };

        if (body.payerMemberId || body.participantIds || body.amount !== undefined) {
          validateExpenseBody(store, group.id, {
            payerMemberId: body.payerMemberId ?? expense.payerMemberId,
            participantIds: body.participantIds ?? expense.participantIds,
            amount: body.amount ?? (expense.amountCents ? expense.amountCents / 100 : undefined)
          }, { requireAmount: expense.status === "final" });
        }

        if (body.payerMemberId) patch.payerMemberId = body.payerMemberId;
        if (body.participantIds) patch.participantIds = dedupe(body.participantIds);
        if (body.amount !== undefined) patch.amountCents = parseAmountToCents(body.amount);

        store.updateExpense(expense, patch);
        increment("expenses.updated");
        return sendJson(res, 200, serializeExpense(expense));
      }

      if (expenseUpdateMatch && method === "DELETE") {
        const group = requireGroup(store, expenseUpdateMatch[1]);
        const expense = requireExpense(store, expenseUpdateMatch[2], group.id);
        store.deleteExpense(expense);
        increment("expenses.deleted");
        return sendJson(res, 200, { deleted: true, expenseId: expense.id });
      }

      const balancesMatch = url.pathname.match(/^\/groups\/(grp_\d+)\/balances$/);
      if (balancesMatch && method === "GET") {
        const group = requireGroup(store, balancesMatch[1]);
        const expenses = Array.from(group.expenseIds).map((id) => store.expenses.get(id));
        const members = new Map(Array.from(group.memberIds).map((id) => [id, store.members.get(id)]));
        const balances = computeBalances(expenses, members);
        increment("balances.requested");
        return sendJson(res, 200, {
          groupId: group.id,
          generatedAt: new Date().toISOString(),
          ...balances
        });
      }

      notFound(res);
    } catch (error) {
      const status = error.status ?? 500;
      const message = status >= 500 ? "Internal server error" : error.message;
      if (status >= 500) {
        increment("errors.internal");
      } else {
        increment("errors.validation");
      }
      sendJson(res, status, { error: message });
    }
  };
}

function requireGroup(store, groupId) {
  const group = store.groups.get(groupId);
  if (!group) {
    throw createHttpError(404, "Group not found");
  }
  return group;
}

function requireMember(store, memberId, groupId) {
  const member = store.members.get(memberId);
  if (!member || member.groupId !== groupId) {
    throw createHttpError(404, "Member not found");
  }
  return member;
}

function requireExpense(store, expenseId, groupId) {
  const expense = store.expenses.get(expenseId);
  if (!expense || expense.groupId !== groupId) {
    throw createHttpError(404, "Expense not found");
  }
  return expense;
}

function validateExpenseBody(store, groupId, body, options = { requireAmount: true }) {
  if (!body || typeof body !== "object") {
    throw createHttpError(400, "Request body is required");
  }

  if (!body.payerMemberId) {
    throw createHttpError(400, "payerMemberId is required");
  }

  const payer = store.members.get(body.payerMemberId);
  if (!payer || payer.groupId !== groupId) {
    throw createHttpError(400, "payerMemberId is invalid for this group");
  }

  if (!Array.isArray(body.participantIds) || body.participantIds.length === 0) {
    throw createHttpError(400, "participantIds must be a non-empty array");
  }

  for (const id of body.participantIds) {
    const member = store.members.get(id);
    if (!member || member.groupId !== groupId) {
      throw createHttpError(400, `participant ${id} is invalid for this group`);
    }
  }

  if (options.requireAmount) {
    try {
      parseAmountToCents(body.amount);
    } catch (error) {
      throw createHttpError(400, error.message);
    }
  }
}

function requireVersionMatch(expense, version) {
  if (!Number.isInteger(version)) {
    throw createHttpError(400, "version is required for update");
  }
  if (version !== expense.version) {
    throw createHttpError(409, "Version conflict");
  }
}

function requireNonEmptyString(value, fieldName) {
  if (!value || typeof value !== "string" || !value.trim()) {
    throw createHttpError(400, `${fieldName} must be a non-empty string`);
  }
}

function dedupe(items) {
  return [...new Set(items)];
}

function serializeGroup(group, store) {
  return {
    id: group.id,
    name: group.name,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    members: Array.from(group.memberIds).map((id) => store.members.get(id))
  };
}

function serializeExpense(expense) {
  return {
    id: expense.id,
    groupId: expense.groupId,
    source: expense.source,
    status: expense.status,
    payerMemberId: expense.payerMemberId,
    participantIds: expense.participantIds,
    amountCents: expense.amountCents,
    amount: expense.amountCents ? expense.amountCents / 100 : null,
    note: expense.note,
    date: expense.date,
    imageName: expense.imageName,
    imageMimeType: expense.imageMimeType,
    ocrStatus: expense.ocrStatus,
    ocrSuggestions: expense.ocrSuggestions,
    version: expense.version,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt
  };
}

async function processReceiptAsync(store, expenseId) {
  const expense = store.expenses.get(expenseId);
  if (!expense) return;

  try {
    const suggestions = await extractReceiptSuggestions({
      imageName: expense.imageName,
      imageData: expense.imageData
    });
    store.updateExpense(expense, {
      ocrStatus: "succeeded",
      ocrSuggestions: suggestions
    });
    increment("ocr.succeeded");
  } catch {
    store.updateExpense(expense, {
      ocrStatus: "failed",
      ocrSuggestions: null
    });
    increment("ocr.failed");
  }
}
