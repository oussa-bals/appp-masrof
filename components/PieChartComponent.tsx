import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withDelay,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { ALL_CATEGORIES } from '@/constants/categories';
import { formatCurrency } from '@/utils/formatters';

const screenWidth = Dimensions.get('window').width;

interface PieChartComponentProps {
  data: Record<string, number>;
  title: string;
}

export const PieChartComponent: React.FC<PieChartComponentProps> = ({ data, title }) => {
  const animationProgress = useSharedValue(0);
  
  React.useEffect(() => {
    animationProgress.value = withDelay(300, withTiming(1, { duration: 1000 }));
  }, [data]);

  const colors = [
    COLORS.primary[500],
    COLORS.purple[500],
    COLORS.teal[500],
    COLORS.success[500],
    COLORS.warning[500],
    COLORS.error[500],
    COLORS.purple[600],
    COLORS.teal[600],
    COLORS.primary[600],
  ];

  const chartData = Object.entries(data)
    .filter(([_, amount]) => amount > 0)
    .sort(([, a], [, b]) => b - a) // Sort by amount descending
    .map(([categoryId, amount], index) => {
      const category = ALL_CATEGORIES.find(c => c.id === categoryId);
      return {
        categoryId,
        name: category?.nameAr || categoryId,
        amount,
        color: colors[index % colors.length],
        icon: category?.icon || '💰',
      };
    });

  if (chartData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>لا توجد بيانات لعرضها</Text>
        </View>
      </View>
    );
  }

  const total = chartData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      {/* Enhanced chart with animations */}
      <View style={styles.chartContainer}>
        {/* Total amount display */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>المجموع</Text>
          <Text style={styles.totalAmount}>{formatCurrency(total)}</Text>
        </View>
        
        {chartData.map((item, index) => {
          const percentage = ((item.amount / total) * 100).toFixed(1);
          
          const animatedStyle = useAnimatedStyle(() => {
            const opacity = interpolate(
              animationProgress.value,
              [0, 0.5, 1],
              [0, 0.5, 1],
              Extrapolate.CLAMP
            );
            
            const translateX = interpolate(
              animationProgress.value,
              [0, 1],
              [50, 0],
              Extrapolate.CLAMP
            );
            
            return {
              opacity: withDelay(index * 100, withTiming(opacity)),
              transform: [{ translateX: withDelay(index * 100, withTiming(translateX)) }],
            };
          });
          
          return (
            <Animated.View key={item.categoryId} style={[styles.chartItem, animatedStyle]}>
              <View style={styles.chartItemLeft}>
                <Animated.View 
                  style={[
                    styles.colorIndicator, 
                    { backgroundColor: item.color },
                    useAnimatedStyle(() => ({
                      transform: [{ 
                        scale: withDelay(
                          index * 100 + 500, 
                          withTiming(animationProgress.value, { duration: 300 })
                        )
                      }],
                    }))
                  ]} 
                />
                <Text style={styles.categoryIcon}>{item.icon}</Text>
                <Text style={styles.categoryName}>{item.name}</Text>
              </View>
              <View style={styles.chartItemRight}>
                <View style={styles.percentageContainer}>
                  <Text style={[styles.percentage, { color: item.color }]}>{percentage}%</Text>
                  <View style={[styles.percentageBar, { backgroundColor: `${item.color}20` }]}>
                    <Animated.View 
                      style={[
                        styles.percentageFill, 
                        { backgroundColor: item.color },
                        useAnimatedStyle(() => ({
                          width: withDelay(
                            index * 150 + 800,
                            withTiming(`${parseFloat(percentage) * animationProgress.value}%`, { duration: 800 })
                          ),
                        }))
                      ]} 
                    />
                  </View>
                </View>
                <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
              </View>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: COLORS.gray[800],
  },
  totalContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: COLORS.gray[50],
    borderRadius: 12,
  },
  totalLabel: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary[600],
  },
  chartContainer: {
    gap: 16,
  },
  chartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: COLORS.gray[50],
    borderRadius: 12,
  },
  chartItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    fontSize: 20,
    marginHorizontal: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[700],
    flex: 1,
    textAlign: 'right',
  },
  chartItemRight: {
    alignItems: 'flex-end',
    minWidth: 100,
  },
  percentageContainer: {
    alignItems: 'flex-end',
    marginBottom: 4,
    width: '100%',
  },
  percentage: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  percentageBar: {
    width: 80,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  percentageFill: {
    height: '100%',
    borderRadius: 3,
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[600],
    textAlign: 'right',
  },
  emptyContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray[500],
    textAlign: 'center',
  },
});