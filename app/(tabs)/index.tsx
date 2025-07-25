import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  I18nManager,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Transaction } from '@/types';
import { database } from '@/storage/database';
import { COLORS } from '@/constants/colors';
import { TEXTS } from '@/constants/texts';
import { formatCurrency, getCurrentMonth } from '@/utils/formatters';
import { TransactionCard } from '@/components/TransactionCard';
import { CustomButton } from '@/components/CustomButton';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Enable RTL (only on native platforms)
if (Platform.OS !== 'web') {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

export default function HomeScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      await database.init();
      const allTransactions = await database.getTransactions();
      const { year, month } = getCurrentMonth();
      const monthlyStats = await database.getStats(year, month);
      
      setTransactions(allTransactions.slice(0, 10)); // Show only recent 10
      setStats({
        totalIncome: monthlyStats.totalIncome,
        totalExpense: monthlyStats.totalExpense,
        balance: monthlyStats.balance,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const navigateToAddTransaction = () => {
    router.push('/add-transaction');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>{TEXTS.common.loading}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>{TEXTS.app.name}</Text>
          <Text style={styles.appSubtitle}>{TEXTS.app.subtitle}</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{TEXTS.home.balance}</Text>
          <Text style={[
            styles.balanceAmount,
            { color: stats.balance >= 0 ? COLORS.success[600] : COLORS.error[600] }
          ]}>
            {formatCurrency(Math.abs(stats.balance))}
          </Text>
        </View>

        {/* Monthly Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{TEXTS.home.monthlyIncome}</Text>
            <Text style={[styles.statAmount, { color: COLORS.success[600] }]}>
              {formatCurrency(stats.totalIncome)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{TEXTS.home.monthlyExpense}</Text>
            <Text style={[styles.statAmount, { color: COLORS.error[600] }]}>
              {formatCurrency(stats.totalExpense)}
            </Text>
          </View>
        </View>

        {/* Add Transaction Button */}
        <View style={styles.addButtonContainer}>
          <CustomButton
            title={TEXTS.home.addTransaction}
            onPress={navigateToAddTransaction}
            variant="primary"
            size="large"
            style={styles.addButton}
          />
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>{TEXTS.home.recentTransactions}</Text>
          {transactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{TEXTS.home.noTransactions}</Text>
            </View>
          ) : (
            transactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onPress={() => {
                  // Navigate to transaction details or edit
                }}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={navigateToAddTransaction}
        activeOpacity={0.8}
      >
        <Plus size={24} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray[50],
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.gray[600],
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: COLORS.primary[500],
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 14,
    color: COLORS.primary[100],
    textAlign: 'center',
    marginTop: 4,
  },
  balanceCard: {
    backgroundColor: COLORS.white,
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceLabel: {
    fontSize: 16,
    color: COLORS.gray[600],
    marginBottom: 8,
    textAlign: 'center',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray[600],
    marginBottom: 4,
    textAlign: 'center',
  },
  statAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addButtonContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  addButton: {
    marginTop: 8,
  },
  transactionsSection: {
    flex: 1,
    marginBottom: 80,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gray[800],
    marginHorizontal: 16,
    marginBottom: 12,
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray[500],
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});