export type MemberId = string;

export type Cents = number;

export type Allocation = {
  memberId: MemberId;
  cents: Cents;
};

export type PercentAllocation = {
  memberId: MemberId;
  percent: number;
};

export type Expense = {
  payerId: MemberId;
  allocations: Allocation[];
};

export type Balance = {
  memberId: MemberId;
  balanceCents: Cents;
};

export type SettlementTransfer = {
  fromMemberId: MemberId;
  toMemberId: MemberId;
  cents: Cents;
};
