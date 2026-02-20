import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { Repository } from '../../persistence';
import type { GroupsStackParamList } from './types';

type Props = NativeStackScreenProps<GroupsStackParamList, 'CreateGroup'> & {
  repository: Repository;
};

export const CreateGroupScreen = ({ navigation, repository }: Props) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSave = async () => {
    const normalizedName = name.trim();
    if (!normalizedName) {
      setError('Group name is required.');
      return;
    }

    try {
      const group = await repository.createGroup(normalizedName);
      navigation.replace('GroupDetail', { groupId: group.id, groupName: group.name });
    } catch {
      setError('Unable to create group.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Group Name</Text>
      <TextInput
        accessibilityLabel="Group Name"
        onChangeText={setName}
        placeholder="Enter group name"
        style={styles.input}
        value={name}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable accessibilityRole="button" onPress={onSave} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Save Group</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#ffffff' },
  label: { fontWeight: '600', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8
  },
  primaryButton: { backgroundColor: '#0b66c3', borderRadius: 8, padding: 12 },
  primaryButtonText: { color: '#ffffff', fontWeight: '700', textAlign: 'center' },
  error: { color: '#b91c1c', marginBottom: 8 }
});
