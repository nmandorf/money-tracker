import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { RepositoryValidationError } from '../../persistence';
import type { Repository } from '../../persistence';
import type { GroupsStackParamList } from './types';

type Props = NativeStackScreenProps<GroupsStackParamList, 'AddMember'> & {
  repository: Repository;
};

export const AddMemberScreen = ({ navigation, repository, route }: Props) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSave = async () => {
    const normalizedName = name.trim();
    if (!normalizedName) {
      setError('Member name is required.');
      return;
    }

    try {
      await repository.addMember(route.params.groupId, normalizedName);
      navigation.goBack();
    } catch (err) {
      if (err instanceof RepositoryValidationError && err.code === 'DUPLICATE_MEMBER_NAME') {
        setError('Member name already exists in this group.');
        return;
      }
      setError('Unable to add member.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Member to {route.params.groupName}</Text>
      <TextInput
        accessibilityLabel="Member Name"
        onChangeText={setName}
        placeholder="Enter member name"
        style={styles.input}
        value={name}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable accessibilityRole="button" onPress={onSave} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Save Member</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#ffffff' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
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
