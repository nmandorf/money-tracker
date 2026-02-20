import { assertCents } from './money';
import type { Allocation, MemberId, PercentAllocation } from './types';

const PERCENT_SCALE = 100;
const FULL_PERCENT_BASIS_POINTS = 10_000;

const sortMemberIds = (memberIds: MemberId[]): MemberId[] => [...memberIds].sort((a, b) => a.localeCompare(b));

export const splitEqual = (totalCents: number, memberIds: MemberId[]): Allocation[] => {
  const normalizedTotal = assertCents(totalCents, 'totalCents');

  if (memberIds.length === 0) {
    throw new Error('memberIds must not be empty');
  }

  const orderedMembers = sortMemberIds(memberIds);
  const base = Math.floor(normalizedTotal / orderedMembers.length);
  let remainder = normalizedTotal - base * orderedMembers.length;

  return orderedMembers.map((memberId) => {
    const extraCent = remainder > 0 ? 1 : 0;
    remainder -= extraCent;

    return {
      memberId,
      cents: base + extraCent
    };
  });
};

const toBasisPoints = (percent: number): number => {
  if (!Number.isFinite(percent)) {
    throw new Error('percent values must be finite');
  }

  const basisPoints = Math.round(percent * PERCENT_SCALE);

  if (Math.abs(basisPoints / PERCENT_SCALE - percent) > Number.EPSILON) {
    throw new Error('percent values must have at most 2 decimal places');
  }

  return basisPoints;
};

export const splitByPercent = (
  totalCents: number,
  percentAllocations: PercentAllocation[]
): Allocation[] => {
  const normalizedTotal = assertCents(totalCents, 'totalCents');

  if (percentAllocations.length === 0) {
    throw new Error('percentAllocations must not be empty');
  }

  const orderedAllocations = [...percentAllocations].sort((a, b) => a.memberId.localeCompare(b.memberId));
  const basisPoints = orderedAllocations.map((entry) => {
    const points = toBasisPoints(entry.percent);

    if (points < 0 || points > FULL_PERCENT_BASIS_POINTS) {
      throw new Error('percent values must be between 0 and 100');
    }

    return points;
  });

  const sumBasisPoints = basisPoints.reduce((sum, value) => sum + value, 0);

  if (sumBasisPoints !== FULL_PERCENT_BASIS_POINTS) {
    throw new Error('percent allocations must sum to exactly 100.00');
  }

  const provisional = orderedAllocations.map((entry, index) => {
    const product = normalizedTotal * basisPoints[index];
    const cents = Math.floor(product / FULL_PERCENT_BASIS_POINTS);
    const remainderWeight = product % FULL_PERCENT_BASIS_POINTS;

    return {
      memberId: entry.memberId,
      cents,
      remainderWeight
    };
  });

  const assigned = provisional.reduce((sum, item) => sum + item.cents, 0);
  let remainder = normalizedTotal - assigned;

  const prioritized = [...provisional].sort((a, b) => {
    if (b.remainderWeight !== a.remainderWeight) {
      return b.remainderWeight - a.remainderWeight;
    }

    return a.memberId.localeCompare(b.memberId);
  });

  for (const entry of prioritized) {
    if (remainder <= 0) {
      break;
    }

    entry.cents += 1;
    remainder -= 1;
  }

  return prioritized
    .sort((a, b) => a.memberId.localeCompare(b.memberId))
    .map(({ memberId, cents }) => ({ memberId, cents }));
};
