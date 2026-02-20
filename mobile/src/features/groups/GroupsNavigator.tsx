import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { Repository } from '../../persistence';
import { AddMemberScreen } from './AddMemberScreen';
import { CreateGroupScreen } from './CreateGroupScreen';
import { GroupDetailScreen } from './GroupDetailScreen';
import { GroupListScreen } from './GroupListScreen';
import type { GroupsStackParamList } from './types';

const Stack = createNativeStackNavigator<GroupsStackParamList>();

type Props = {
  repository: Repository;
};

export const GroupsNavigator = ({ repository }: Props) => (
  <Stack.Navigator initialRouteName="GroupList">
    <Stack.Screen name="GroupList" options={{ title: 'Groups' }}>
      {(screenProps) => <GroupListScreen {...screenProps} repository={repository} />}
    </Stack.Screen>
    <Stack.Screen name="CreateGroup" options={{ title: 'Create Group' }}>
      {(screenProps) => <CreateGroupScreen {...screenProps} repository={repository} />}
    </Stack.Screen>
    <Stack.Screen name="GroupDetail" options={{ title: 'Group Detail' }}>
      {(screenProps) => <GroupDetailScreen {...screenProps} repository={repository} />}
    </Stack.Screen>
    <Stack.Screen name="AddMember" options={{ title: 'Add Member' }}>
      {(screenProps) => <AddMemberScreen {...screenProps} repository={repository} />}
    </Stack.Screen>
  </Stack.Navigator>
);
