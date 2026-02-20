export function parseAmountToCents(value) {
  if (value === null || value === undefined || value === "") {
    throw new Error("Amount is required");
  }

  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    throw new Error("Amount must be a positive number");
  }

  const cents = Math.round(num * 100);
  if (cents <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  return cents;
}

export function centsToAmount(cents) {
  return Number((cents / 100).toFixed(2));
}

export function formatCents(cents) {
  return centsToAmount(cents).toFixed(2);
}
