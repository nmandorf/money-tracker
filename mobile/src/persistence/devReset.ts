import type { SQLiteDatabase } from 'expo-sqlite';

const resetStatements = `
  DELETE FROM expense_participants;
  DELETE FROM receipts;
  DELETE FROM expenses;
  DELETE FROM members;
  DELETE FROM groups;
`;

export const resetDatabaseForDev = async (db: SQLiteDatabase): Promise<void> => {
  if (!__DEV__) {
    throw new Error('resetDatabaseForDev is only available in development builds.');
  }

  await db.execAsync(resetStatements);
};

export const resetDatabaseUnsafeForTests = async (db: SQLiteDatabase): Promise<void> => {
  await db.execAsync(resetStatements);
};
