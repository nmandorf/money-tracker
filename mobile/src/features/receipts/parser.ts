export type ReceiptPrefill = {
  amountCents: number | null;
  vendorName: string | null;
  date: string | null;
};

const toCents = (value: string): number => Math.round(Number(value) * 100);

export const parseReceiptText = (rawText: string): ReceiptPrefill => {
  const lines = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const amountMatches = [...rawText.matchAll(/\b(\d{1,5}\.\d{2})\b/g)].map((match) => Number(match[1]));
  const maxAmount = amountMatches.length > 0 ? Math.max(...amountMatches) : null;

  const dateMatch = rawText.match(/\b(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})\b/);
  const vendorCandidate = lines.find((line) => /[A-Za-z]/.test(line) && !/total|tax|subtotal|tip|date/i.test(line));

  return {
    amountCents: maxAmount !== null ? toCents(String(maxAmount.toFixed(2))) : null,
    vendorName: vendorCandidate ?? null,
    date: dateMatch ? dateMatch[1] : null
  };
};
