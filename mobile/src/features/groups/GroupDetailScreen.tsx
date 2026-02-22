import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import type { ExpenseRecord, Repository } from '../../persistence';
import { computeExpenseBalances } from '../expenses/calc';
import type { GroupsStackParamList } from './types';

type Props = NativeStackScreenProps<GroupsStackParamList, 'GroupDetail'> & {
  repository: Repository;
};

export const GroupDetailScreen = ({ navigation, route, repository }: Props) => {
  const isFocused = useIsFocused();
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [loadedMembers, loadedExpenses] = await Promise.all([
          repository.listMembers(route.params.groupId),
          repository.listExpenses(route.params.groupId)
        ]);
        setMembers(loadedMembers);
        setExpenses(loadedExpenses);
        setError(null);
      } catch {
        setError('Unable to load members.');
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      void load();
    }
  }, [isFocused, repository, route.params.groupId]);

  const balances = useMemo(() => {
    if (members.length === 0 || expenses.length === 0) {
      return [];
    }

    return computeExpenseBalances(
      members.map((member) => member.id),
      expenses
    );
  }, [expenses, members]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading group details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        Group: {route.params.groupName}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        accessibilityLabel="Add Member"
        accessibilityRole="button"
        onPress={() =>
          navigation.navigate('AddMember', { groupId: route.params.groupId, groupName: route.params.groupName })
        }
        style={styles.primaryButton}
      >
        <Text style={styles.primaryButtonText}>Add Member</Text>
      </Pressable>
      <Pressable
        accessibilityLabel="Add Expense"
        accessibilityRole="button"
        onPress={() =>
          navigation.navigate('AddExpense', { groupId: route.params.groupId, groupName: route.params.groupName })
        }
        style={styles.primaryButton}
      >
        <Text style={styles.primaryButtonText}>Add Expense</Text>
      </Pressable>
      <Pressable
        accessibilityLabel="Settle Up"
        accessibilityRole="button"
        onPress={() =>
          navigation.navigate('SettleUp', { groupId: route.params.groupId, groupName: route.params.groupName })
        }
        style={styles.secondaryButton}
      >
        <Text style={styles.secondaryButtonText}>Settle Up</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Members</Text>
      {members.length === 0 ? <Text style={styles.empty}>No members yet.</Text> : null}
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        initialNumToRender={15}
        renderItem={({ item }) => (
          <View style={styles.memberRow}>
            <Text>{item.name}</Text>
          </View>
        )}
      />

      <Text style={styles.sectionTitle}>Expenses</Text>
      {expenses.length === 0 ? <Text style={styles.empty}>No expenses yet.</Text> : null}
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        initialNumToRender={20}
        windowSize={10}
        renderItem={({ item }) => (
          <View style={styles.memberRow}>
            <Text style={styles.expenseTitle}>{item.description}</Text>
            <Text>${(item.amountCents / 100).toFixed(2)}</Text>
            <Text style={styles.meta}>
              {item.splitMethod === 'percent'
                ? item.participants
                    .map((participant) => `${members.find((member) => member.id === participant.memberId)?.name ?? participant.memberId}: ${(participant.percent ?? 0).toFixed(2)}%`)
                    .join(', ')
                : 'Equal split'}
            </Text>
          </View>
        )}
      />

      <Text style={styles.sectionTitle}>Balances</Text>
      {balances.length === 0 ? <Text style={styles.empty}>No balances to show.</Text> : null}
      <FlatList
        data={balances}
        keyExtractor={(item) => item.memberId}
        initialNumToRender={15}
        renderItem={({ item }) => (
          <View style={styles.memberRow}>
            <Text>{members.find((member) => member.id === item.memberId)?.name ?? item.memberId}</Text>
            <Text style={item.balanceCents >= 0 ? styles.positive : styles.negative}>
              {(item.balanceCents / 100).toFixed(2)}
            </Text>
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
  primaryButton: { backgroundColor: '#0b66c3', borderRadius: 8, padding: 12, minHeight: 44, marginBottom: 8 },
  primaryButtonText: { color: '#ffffff', fontWeight: '700', textAlign: 'center' },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#0b66c3',
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    marginBottom: 8
  },
  secondaryButtonText: { color: '#0b66c3', fontWeight: '700', textAlign: 'center' },
  memberRow: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8
  },
  empty: { color: '#6b7280', marginVertical: 8 },
  error: { color: '#b91c1c', marginBottom: 8 },
  meta: { color: '#6b7280', marginTop: 2 },
  expenseTitle: { fontWeight: '700' },
  positive: { color: '#166534', fontWeight: '700' },
  negative: { color: '#b91c1c', fontWeight: '700' }
});
