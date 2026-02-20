import { getSchemaVersion, initializeDatabase } from '../db';

describe('database migrations', () => {
  it('applies migrations and updates user_version', async () => {
    let userVersion = 0;
    const executedStatements: string[] = [];

    const db = {
      async execAsync(source: string): Promise<void> {
        executedStatements.push(source);
        const match = source.match(/PRAGMA user_version = (\d+)/i);
        if (match) {
          userVersion = Number(match[1]);
        }
      },
      async getFirstAsync<T>(): Promise<T | null> {
        return { user_version: userVersion } as T;
      },
      async withTransactionAsync(task: () => Promise<void>): Promise<void> {
        await task();
      }
    };

    await initializeDatabase(db);

    expect(userVersion).toBe(getSchemaVersion());
    expect(executedStatements.some((statement) => statement.includes('CREATE TABLE IF NOT EXISTS groups'))).toBe(
      true
    );
  });
});
