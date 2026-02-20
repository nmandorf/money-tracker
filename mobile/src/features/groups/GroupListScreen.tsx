import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Repository } from '../../persistence';
import type { GroupsStackParamList } from './types';

type Props = NativeStackScreenProps<GroupsStackParamList, 'GroupList'> & {
  repository: Repository;
};

export const GroupListScreen = ({ navigation, repository }: Props) => {
  const isFocused = useIsFocused();
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await repository.listGroups();
        setGroups(result);
        setError(null);
      } catch {
        setError('Unable to load groups.');
      }
    };

    if (isFocused) {
      void load();
    }
  }, [isFocused, repository]);

  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        Groups
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate('CreateGroup')}
        style={styles.primaryButton}
      >
        <Text style={styles.primaryButtonText}>Create Group</Text>
      </Pressable>
      {groups.length === 0 ? <Text style={styles.empty}>No groups yet.</Text> : null}
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('GroupDetail', { groupId: item.id, groupName: item.name })}
            style={styles.groupRow}
          >
            <Text style={styles.groupName}>{item.name}</Text>
          </Pressable>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#ffffff' },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 12 },
  primaryButton: { backgroundColor: '#0b66c3', borderRadius: 8, padding: 12, marginBottom: 12 },
  primaryButtonText: { color: '#ffffff', fontWeight: '700', textAlign: 'center' },
  empty: { color: '#6b7280', marginVertical: 12 },
  groupRow: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8
  },
  groupName: { fontSize: 16, fontWeight: '600' },
  error: { color: '#b91c1c', marginBottom: 8 }
});
