import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Transaction } from '@/types';
import { COLORS } from '@/constants/colors';
import { ALL_CATEGORIES } from '@/constants/categories';
import { formatCurrency, formatDateShort } from '@/utils/formatters';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onPress }) => {
  const category = ALL_CATEGORIES.find(c => c.id === transaction.category);
  const isIncome = transaction.type === 'income';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{category?.icon || '💰'}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.categoryText}>{category?.nameAr || transaction.category}</Text>
          {transaction.note ? (
            <Text style={styles.noteText}>{transaction.note}</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={[styles.amountText, { color: isIncome ? COLORS.success[600] : COLORS.error[600] }]}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </Text>
        <Text style={styles.dateText}>{formatDateShort(transaction.date)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[800],
    textAlign: 'right',
  },
  noteText: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 2,
    textAlign: 'right',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  dateText: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 2,
    textAlign: 'right',
  },
});