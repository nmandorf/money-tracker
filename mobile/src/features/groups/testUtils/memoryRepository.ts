import { RepositoryValidationError, type Repository } from '../../../persistence';

type Group = { id: string; name: string; createdAt: string };
type Member = { id: string; groupId: string; name: string; createdAt: string };

let groupCounter = 1;
let memberCounter = 1;

export const createMemoryRepository = (): Repository => {
  const groups: Group[] = [];
  const members: Member[] = [];

  return {
    async createGroup(name: string) {
      const trimmed = name.trim();
      if (!trimmed) {
        throw new RepositoryValidationError('INVALID_INPUT', 'Group name is required.');
      }
      const group = { id: `grp_${groupCounter++}`, name: trimmed, createdAt: new Date().toISOString() };
      groups.unshift(group);
      return group;
    },
    async listGroups() {
      return [...groups];
    },
    async addMember(groupId: string, name: string) {
      const trimmed = name.trim();
      if (!trimmed) {
        throw new RepositoryValidationError('INVALID_INPUT', 'Member name is required.');
      }
      const duplicate = members.find((member) => member.groupId === groupId && member.name === trimmed);
      if (duplicate) {
        throw new RepositoryValidationError('DUPLICATE_MEMBER_NAME', 'Duplicate member');
      }
      const member = {
        id: `mem_${memberCounter++}`,
        groupId,
        name: trimmed,
        createdAt: new Date().toISOString()
      };
      members.push(member);
      return member;
    },
    async listMembers(groupId: string) {
      return members.filter((member) => member.groupId === groupId);
    },
    async addExpense() {
      throw new Error('Not implemented in memory repository test helper.');
    },
    async listExpenses() {
      return [];
    },
    async saveReceipt() {
      throw new Error('Not implemented in memory repository test helper.');
    }
  };
};
