import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Repository } from '../../persistence';
import type { GroupsStackParamList } from './types';

type Props = NativeStackScreenProps<GroupsStackParamList, 'GroupDetail'> & {
  repository: Repository;
};

export const GroupDetailScreen = ({ navigation, route, repository }: Props) => {
  const isFocused = useIsFocused();
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await repository.listMembers(route.params.groupId);
        setMembers(result);
        setError(null);
      } catch {
        setError('Unable to load members.');
      }
    };

    if (isFocused) {
      void load();
    }
  }, [isFocused, repository, route.params.groupId]);

  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        Group: {route.params.groupName}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        accessibilityRole="button"
        onPress={() =>
          navigation.navigate('AddMember', { groupId: route.params.groupId, groupName: route.params.groupName })
        }
        style={styles.primaryButton}
      >
        <Text style={styles.primaryButtonText}>Add Member</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Members</Text>
      {members.length === 0 ? <Text style={styles.empty}>No members yet.</Text> : null}
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.memberRow}>
            <Text>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#ffffff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginVertical: 8 },
  primaryButton: { backgroundColor: '#0b66c3', borderRadius: 8, padding: 12 },
  primaryButtonText: { color: '#ffffff', fontWeight: '700', textAlign: 'center' },
  memberRow: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8
  },
  empty: { color: '#6b7280', marginVertical: 8 },
  error: { color: '#b91c1c', marginBottom: 8 }
});
