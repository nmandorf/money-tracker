import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { RepositoryValidationError, type Repository } from '../../persistence';
import { mockOcrAdapter } from '../receipts/ocr';
import { parseReceiptText } from '../receipts/parser';
import type { GroupsStackParamList } from './types';

type Props = NativeStackScreenProps<GroupsStackParamList, 'AddExpense'> & {
  repository: Repository;
};

const toDollarsString = (cents: number): string => (cents / 100).toFixed(2);
const toCents = (dollars: string): number | null => {
  if (!/^\d+(\.\d{1,2})?$/.test(dollars.trim())) {
    return null;
  }
  return Math.round(Number(dollars) * 100);
};

export const AddExpenseScreen = ({ navigation, repository, route }: Props) => {
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState<string>('');
  const [splitMethod, setSplitMethod] = useState<'equal' | 'percent'>('equal');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [percentMap, setPercentMap] = useState<Record<string, string>>({});
  const [receiptRawText, setReceiptRawText] = useState<string | null>(null);
  const [receiptImageUri, setReceiptImageUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const loadedMembers = await repository.listMembers(route.params.groupId);
        setMembers(loadedMembers);
        setSelectedParticipants(loadedMembers.map((member) => member.id));
        if (loadedMembers.length > 0) {
          setPayerId(loadedMembers[0].id);
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [repository, route.params.groupId]);

  const percentTotal = useMemo(() => {
    return selectedParticipants.reduce((sum, memberId) => {
      const value = percentMap[memberId];
      if (!value) {
        return sum;
      }
      return sum + Math.round(Number(value) * 100);
    }, 0);
  }, [percentMap, selectedParticipants]);

  const percentIsValid = splitMethod === 'equal' || percentTotal === 10_000;

  const toggleParticipant = (memberId: string) => {
    const exists = selectedParticipants.includes(memberId);
    const next = exists
      ? selectedParticipants.filter((id) => id !== memberId)
      : [...selectedParticipants, memberId].sort((a, b) => a.localeCompare(b));

    setSelectedParticipants(next);

    if (splitMethod === 'percent') {
      const reset: Record<string, string> = {};
      for (const id of next) {
        reset[id] = '';
      }
      setPercentMap(reset);
    }
  };

  const loadMockReceipt = async () => {
    const imageUri = 'file://mock-coffee-receipt.jpg';
    const rawText = await mockOcrAdapter.extractTextFromImage(imageUri);
    const parsed = parseReceiptText(rawText);

    if (parsed.amountCents !== null) {
      setAmount(toDollarsString(parsed.amountCents));
    }
    if (parsed.vendorName) {
      setDescription(parsed.vendorName);
    }

    setReceiptImageUri(imageUri);
    setReceiptRawText(rawText);
  };

  const onSave = async () => {
    const amountCents = toCents(amount);

    if (!description.trim()) {
      setError('Description is required.');
      return;
    }

    if (!amountCents || amountCents <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }

    if (!payerId) {
      setError('Payer is required.');
      return;
    }

    if (selectedParticipants.length === 0) {
      setError('Select at least one participant.');
      return;
    }

    if (!percentIsValid) {
      setError('Percent allocations must total exactly 100.00%.');
      return;
    }

    try {
      const participants = selectedParticipants.map((memberId) => ({
        memberId,
        percent: splitMethod === 'percent' ? Number(percentMap[memberId] ?? 0) : undefined
      }));

      const expense = await repository.addExpense({
        groupId: route.params.groupId,
        payerId,
        description,
        amountCents,
        splitMethod,
        participants
      });

      if (receiptImageUri) {
        await repository.saveReceipt({
          expenseId: expense.id,
          imageUri: receiptImageUri,
          rawText: receiptRawText
        });
      }

      navigation.goBack();
    } catch (err) {
      if (err instanceof RepositoryValidationError) {
        setError(err.message);
        return;
      }
      setError('Unable to save expense.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading members...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Expense</Text>
      <TextInput
        accessibilityLabel="Expense Description"
        onChangeText={setDescription}
        placeholder="Description"
        style={styles.input}
        value={description}
      />
      <TextInput
        accessibilityLabel="Expense Amount"
        keyboardType="decimal-pad"
        onChangeText={setAmount}
        placeholder="Amount (e.g. 12.50)"
        style={styles.input}
        value={amount}
      />

      <Text style={styles.sectionLabel}>Payer</Text>
      <FlatList
        data={members}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Payer ${item.name}`}
            onPress={() => setPayerId(item.id)}
            style={[styles.choiceChip, payerId === item.id ? styles.choiceChipActive : null]}
          >
            <Text style={payerId === item.id ? styles.choiceTextActive : undefined}>{item.name}</Text>
          </Pressable>
        )}
      />

      <Text style={styles.sectionLabel}>Participants</Text>
      <FlatList
        data={members}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const selected = selectedParticipants.includes(item.id);
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Participant ${item.name}`}
              onPress={() => toggleParticipant(item.id)}
              style={[styles.choiceChip, selected ? styles.choiceChipActive : null]}
            >
              <Text style={selected ? styles.choiceTextActive : undefined}>{item.name}</Text>
            </Pressable>
          );
        }}
      />

      <Text style={styles.sectionLabel}>Split Method</Text>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setSplitMethod('equal')}
          style={[styles.choiceChip, splitMethod === 'equal' ? styles.choiceChipActive : null]}
        >
          <Text style={splitMethod === 'equal' ? styles.choiceTextActive : undefined}>Equal</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => setSplitMethod('percent')}
          style={[styles.choiceChip, splitMethod === 'percent' ? styles.choiceChipActive : null]}
        >
          <Text style={splitMethod === 'percent' ? styles.choiceTextActive : undefined}>Percent</Text>
        </Pressable>
      </View>

      {splitMethod === 'percent' ? (
        <View>
          <Text style={styles.sectionLabel}>Percent Allocations</Text>
          {selectedParticipants.map((memberId) => {
            const member = members.find((item) => item.id === memberId);
            if (!member) {
              return null;
            }
            return (
              <View key={memberId} style={styles.percentRow}>
                <Text style={styles.percentName}>{member.name}</Text>
                <TextInput
                  accessibilityLabel={`Percent ${member.name}`}
                  keyboardType="decimal-pad"
                  onChangeText={(value) => {
                    if (!/^\d{0,3}(\.\d{0,2})?$/.test(value)) {
                      return;
                    }
                    setPercentMap((previous) => ({ ...previous, [memberId]: value }));
                  }}
                  placeholder="0.00"
                  style={styles.percentInput}
                  value={percentMap[memberId] ?? ''}
                />
              </View>
            );
          })}
          <Text style={[styles.percentTotal, percentIsValid ? styles.valid : styles.invalid]}>
            Total: {(percentTotal / 100).toFixed(2)}%
          </Text>
        </View>
      ) : null}

      <Pressable accessibilityRole="button" onPress={loadMockReceipt} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Attach Mock Receipt</Text>
      </Pressable>
      {receiptRawText ? <Text style={styles.helper}>Receipt parsed and fields prefilled. You can still edit.</Text> : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        accessibilityRole="button"
        disabled={!percentIsValid}
        onPress={onSave}
        style={[styles.primaryButton, !percentIsValid ? styles.disabled : null]}
      >
        <Text style={styles.primaryButtonText}>Save Expense</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, marginBottom: 8 },
  sectionLabel: { marginTop: 8, marginBottom: 6, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 8 },
  choiceChip: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
    marginRight: 8
  },
  choiceChipActive: { backgroundColor: '#0b66c3', borderColor: '#0b66c3' },
  choiceTextActive: { color: '#ffffff', fontWeight: '600' },
  percentRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  percentName: { flex: 1 },
  percentInput: {
    width: 90,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8
  },
  percentTotal: { marginBottom: 8, fontWeight: '700' },
  valid: { color: '#166534' },
  invalid: { color: '#b91c1c' },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#0b66c3',
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginTop: 8
  },
  secondaryButtonText: { color: '#0b66c3', fontWeight: '700', textAlign: 'center' },
  helper: { color: '#4b5563', marginTop: 6 },
  primaryButton: {
    backgroundColor: '#0b66c3',
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginTop: 10
  },
  primaryButtonText: { color: '#ffffff', fontWeight: '700', textAlign: 'center' },
  disabled: { opacity: 0.5 },
  error: { color: '#b91c1c', marginTop: 6 }
});
