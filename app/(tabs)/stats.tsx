import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  I18nManager,
  Platform,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { database } from '@/storage/database';
import { COLORS } from '@/constants/colors';
import { TEXTS } from '@/constants/texts';
import { formatCurrency, getCurrentMonth, getMonthName } from '@/utils/formatters';
import { PieChartComponent } from '@/components/PieChartComponent';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Enable RTL (only on native platforms)
if (Platform.OS !== 'web') {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

export default function StatsScreen() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const { year, month } = getCurrentMonth();
    return { year, month };
  });
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    categoryStats: {} as Record<string, number>,
    transactionCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [selectedMonth]);

  const loadStats = async () => {
    try {
      setLoading(true);
      await database.init();
      const monthlyStats = await database.getStats(selectedMonth.year, selectedMonth.month);
      setStats(monthlyStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{TEXTS.stats.title}</Text>
        
        {/* Month Selector */}
        <TouchableOpacity style={styles.monthSelector}>
          <Text style={styles.monthText}>
            {getMonthName(selectedMonth.month)} {selectedMonth.year}
          </Text>
          <ChevronDown size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Overview Cards */}
        <View style={styles.overviewContainer}>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>{TEXTS.home.monthlyIncome}</Text>
            <Text style={[styles.overviewAmount, { color: COLORS.success[600] }]}>
              {formatCurrency(stats.totalIncome)}
            </Text>
          </View>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>{TEXTS.home.monthlyExpense}</Text>
            <Text style={[styles.overviewAmount, { color: COLORS.error[600] }]}>
              {formatCurrency(stats.totalExpense)}
            </Text>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{TEXTS.home.balance}</Text>
          <Text style={[
            styles.balanceAmount,
            { color: stats.balance >= 0 ? COLORS.success[600] : COLORS.error[600] }
          ]}>
            {formatCurrency(Math.abs(stats.balance))}
          </Text>
        </View>

        {/* Transaction Count */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>عدد المعاملات</Text>
          <Text style={styles.infoValue}>{stats.transactionCount}</Text>
        </View>

        {/* Pie Chart for Categories */}
        {Object.keys(stats.categoryStats).length > 0 && (
          <PieChartComponent
            data={stats.categoryStats}
            title={TEXTS.stats.categoryBreakdown}
          />
        )}

        {/* Empty State */}
        {stats.transactionCount === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>لا توجد معاملات في هذا الشهر</Text>
          </View>
        )}
      </ScrollView>
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
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primary[500],
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 16,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary[600],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  monthText: {
    color: COLORS.white,
    fontSize: 16,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  overviewContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overviewLabel: {
    fontSize: 12,
    color: COLORS.gray[600],
    marginBottom: 4,
    textAlign: 'center',
  },
  overviewAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  balanceCard: {
    backgroundColor: COLORS.white,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoLabel: {
    fontSize: 16,
    color: COLORS.gray[700],
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary[600],
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray[500],
    textAlign: 'center',
  },
});