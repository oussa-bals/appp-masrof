import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  I18nManager,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Calendar, DollarSign, MapPin, FileText, CircleAlert as AlertCircle } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolateColor
} from 'react-native-reanimated';
import { Transaction } from '@/types';
import { database } from '@/storage/database';
import { COLORS } from '@/constants/colors';
import { TEXTS } from '@/constants/texts';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/categories';
import { CategorySelector } from '@/components/CategorySelector';
import { CustomButton } from '@/components/CustomButton';
import { validateAmount, sanitizeAmount } from '@/utils/validation';

// Enable RTL (only on native platforms)
if (Platform.OS !== 'web') {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

export default function AddTransactionScreen() {
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Animation values
  const toggleAnimation = useSharedValue(transactionType === 'income' ? 1 : 0);
  const formAnimation = useSharedValue(1);

  const categories = transactionType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!amount.trim()) {
      newErrors.amount = TEXTS.validation.amountRequired;
    } else if (!validateAmount(amount)) {
      newErrors.amount = TEXTS.validation.invalidAmount;
    } else if (sanitizeAmount(amount) <= 0) {
      newErrors.amount = TEXTS.validation.amountMustBePositive;
    }
    
    if (!selectedCategory) {
      newErrors.category = TEXTS.validation.categoryRequired;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    
    // Form animation
    formAnimation.value = withTiming(0.95, { duration: 100 }, () => {
      formAnimation.value = withTiming(1, { duration: 100 });
    });

    try {
      const transaction: Omit<Transaction, 'id'> = {
        type: transactionType,
        amount: sanitizeAmount(amount),
        category: selectedCategory,
        date,
        note: note.trim() + (location.trim() ? ` - ${location.trim()}` : ''),
        createdAt: new Date().toISOString(),
      };

      await database.addTransaction(transaction);
      Alert.alert(TEXTS.common.success, 'تم حفظ المعاملة بنجاح', [
        { text: TEXTS.common.ok, onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error saving transaction:', error);
      Alert.alert(TEXTS.common.error, 'حدث خطأ أثناء حفظ المعاملة');
    } finally {
      setSaving(false);
    }
  };

  const handleTypeChange = (type: 'income' | 'expense') => {
    setTransactionType(type);
    setSelectedCategory('');
    setErrors({});
    
    // Animate toggle
    toggleAnimation.value = withSpring(type === 'income' ? 1 : 0);
  };
  const showDatePicker = () => {
    // In a real app, you'd use a proper date picker component
    Alert.alert('Date Picker', 'In a full implementation, this would show a date picker');
  };

  // Animated styles
  const toggleAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      toggleAnimation.value,
      [0, 1],
      [COLORS.error[500], COLORS.success[500]]
    );
    
    return { backgroundColor };
  });

  const formAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: formAnimation.value }],
  }));

  const InputField: React.FC<{
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    icon: React.ReactNode;
    error?: string;
    multiline?: boolean;
    keyboardType?: 'default' | 'numeric';
  }> = ({ label, value, onChangeText, placeholder, icon, error, multiline, keyboardType }) => (
    <View style={styles.inputContainer}>
      <View style={styles.inputHeader}>
        <View style={styles.inputLabelContainer}>
          {icon}
          <Text style={styles.inputLabel}>{label}</Text>
        </View>
        {error && (
          <View style={styles.errorContainer}>
            <AlertCircle size={16} color={COLORS.error[500]} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          error && styles.inputError
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray[400]}
        textAlign="right"
        multiline={multiline}
        keyboardType={keyboardType}
      />
    </View>
  );
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إضافة معاملة جديدة</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={formAnimatedStyle}>
        {/* Transaction Type Toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نوع المعاملة</Text>
          <View style={styles.toggleContainer}>
            <Animated.View style={[styles.toggleSlider, toggleAnimatedStyle]} />
            <TouchableOpacity
              style={[
                styles.toggleButton,
                transactionType === 'expense' && styles.toggleButtonActive,
              ]}
              onPress={() => handleTypeChange('expense')}
            >
              <Text style={[
                styles.toggleText,
                transactionType === 'expense' && styles.toggleTextActive,
              ]}>
                {TEXTS.transaction.expense}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                transactionType === 'income' && styles.toggleButtonActive,
              ]}
              onPress={() => handleTypeChange('income')}
            >
              <Text style={[
                styles.toggleText,
                transactionType === 'income' && styles.toggleTextActive,
              ]}>
                {TEXTS.transaction.income}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <InputField
            label={TEXTS.transaction.amount}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="numeric"
            icon={<DollarSign size={20} color={COLORS.primary[500]} />}
            error={errors.amount}
          />
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <View style={styles.inputHeader}>
            <Text style={styles.sectionTitle}>{TEXTS.transaction.category}</Text>
            {errors.category && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={COLORS.error[500]} />
                <Text style={styles.errorText}>{errors.category}</Text>
              </View>
            )}
          </View>
          <CategorySelector
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
            <View style={styles.dateButtonLeft}>
            <Calendar size={20} color={COLORS.gray[600]} />
              <Text style={styles.dateLabel}>{TEXTS.transaction.date}</Text>
            </View>
            <Text style={styles.dateText}>{date}</Text>
          </TouchableOpacity>
        </View>

        {/* Location Input */}
        <View style={styles.section}>
          <InputField
            label={`${TEXTS.common.location} (${TEXTS.common.optional})`}
            value={location}
            onChangeText={setLocation}
            placeholder="مثال: السوق، المطعم، المحل..."
            icon={<MapPin size={20} color={COLORS.gray[500]} />}
          />
        </View>
        {/* Note Input */}
        <View style={styles.section}>
          <InputField
            label={`${TEXTS.transaction.note} (${TEXTS.common.optional})`}
            value={note}
            onChangeText={setNote}
            placeholder="إضافة ملاحظة..."
            multiline
            icon={<FileText size={20} color={COLORS.gray[500]} />}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <CustomButton
            title={loading ? TEXTS.common.loading : TEXTS.transaction.save}
            onPress={handleSave}
            variant="primary"
            size="large"
            disabled={loading}
            style={styles.saveButton}
          />
          <CustomButton
            title={TEXTS.transaction.cancel}
            onPress={() => router.back()}
            variant="secondary"
            size="large"
            disabled={loading}
            style={styles.cancelButton}
          />
        </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primary[500],
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[800],
    marginBottom: 12,
    textAlign: 'right',
  },
  toggleContainer: {
    position: 'relative',
    flexDirection: 'row',
    backgroundColor: COLORS.gray[200],
    borderRadius: 12,
    padding: 4,
  },
  toggleSlider: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: '48%',
    height: '85%',
    borderRadius: 8,
    zIndex: 1,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    zIndex: 2,
  },
  toggleButtonActive: {
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.gray[700],
  },
  toggleTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[800],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error[500],
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderColor: COLORS.error[500],
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[800],
  },
  dateText: {
    fontSize: 16,
    color: COLORS.primary[600],
    fontWeight: '600',
  },
  actionButtons: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  saveButton: {
    backgroundColor: COLORS.success[500],
    shadowColor: COLORS.success[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cancelButton: {
    borderColor: COLORS.gray[400],
  },
});