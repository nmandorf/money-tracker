import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import type { Repository } from '../../persistence';
import { computeExpenseSettlements } from '../expenses/calc';
import type { GroupsStackParamList } from './types';

type Props = NativeStackScreenProps<GroupsStackParamList, 'SettleUp'> & {
  repository: Repository;
};

const centsToMoney = (cents: number): string => `$${(cents / 100).toFixed(2)}`;

export const SettleUpScreen = ({ repository, route }: Props) => {
  const isFocused = useIsFocused();
  const [transfers, setTransfers] = useState<{ fromId: string; toId: string; cents: number }[]>([]);
  const [memberMap, setMemberMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const members = await repository.listMembers(route.params.groupId);
        const expenses = await repository.listExpenses(route.params.groupId);
        const map = Object.fromEntries(members.map((member) => [member.id, member.name]));
        const settlements = computeExpenseSettlements(
          members.map((member) => member.id),
          expenses
        );
        setMemberMap(map);
        setTransfers(
          settlements.map((item) => ({
            fromId: item.fromMemberId,
            toId: item.toMemberId,
            cents: item.cents
          }))
        );
        setError(null);
      } catch {
        setError('Unable to compute settlements.');
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      void load();
    }
  }, [isFocused, repository, route.params.groupId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading settlement data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        Settle Up: {route.params.groupName}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {transfers.length === 0 && !error ? <Text style={styles.empty}>All settled up.</Text> : null}
      <FlatList
        data={transfers}
        keyExtractor={(item, index) => `${item.fromId}-${item.toId}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>
              {memberMap[item.fromId] ?? item.fromId}
              {' -> '}
              {memberMap[item.toId] ?? item.toId}
            </Text>
            <Text style={styles.amount}>{centsToMoney(item.cents)}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  row: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  amount: { fontWeight: '700' },
  empty: { color: '#4b5563' },
  error: { color: '#b91c1c' }
});
