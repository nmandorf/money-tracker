export type RepositoryValidationCode =
  | 'INVALID_INPUT'
  | 'GROUP_NOT_FOUND'
  | 'MEMBER_NOT_FOUND'
  | 'EXPENSE_NOT_FOUND'
  | 'DUPLICATE_MEMBER_NAME'
  | 'INVALID_PARTICIPANTS'
  | 'INVALID_SPLIT_PERCENT';

export class RepositoryValidationError extends Error {
  public readonly code: RepositoryValidationCode;

  public constructor(code: RepositoryValidationCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'RepositoryValidationError';
  }
}
