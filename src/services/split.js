export function splitEqualDeterministic(amountCents, participantIds) {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new Error("amountCents must be a positive integer");
  }
  if (!Array.isArray(participantIds) || participantIds.length === 0) {
    throw new Error("participantIds must be a non-empty array");
  }

  const sortedIds = [...participantIds].sort();
  const base = Math.floor(amountCents / sortedIds.length);
  const remainder = amountCents % sortedIds.length;

  return sortedIds.map((memberId, index) => ({
    memberId,
    shareCents: base + (index < remainder ? 1 : 0)
  }));
}
