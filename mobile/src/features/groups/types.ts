export type GroupsStackParamList = {
  GroupList: undefined;
  CreateGroup: undefined;
  GroupDetail: {
    groupId: string;
    groupName: string;
  };
  AddMember: {
    groupId: string;
    groupName: string;
  };
  AddExpense: {
    groupId: string;
    groupName: string;
  };
  SettleUp: {
    groupId: string;
    groupName: string;
  };
};
