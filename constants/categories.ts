import { Category } from '@/types';

export const EXPENSE_CATEGORIES: Category[] = [
  { id: '1', name: 'Food', nameAr: 'طعام', icon: '🍔', type: 'expense' },
  { id: '2', name: 'Transport', nameAr: 'نقل', icon: '🚗', type: 'expense' },
  { id: '3', name: 'Rent', nameAr: 'إيجار', icon: '🏠', type: 'expense' },
  { id: '4', name: 'Bills', nameAr: 'فواتير', icon: '💡', type: 'expense' },
  { id: '5', name: 'Leisure', nameAr: 'ترفيه', icon: '🎉', type: 'expense' },
  { id: '6', name: 'Health', nameAr: 'صحة', icon: '🏥', type: 'expense' },
  { id: '7', name: 'Shopping', nameAr: 'تسوق', icon: '🛍️', type: 'expense' },
  { id: '8', name: 'Education', nameAr: 'تعليم', icon: '📚', type: 'expense' },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: '9', name: 'Salary', nameAr: 'راتب', icon: '💰', type: 'income' },
  { id: '10', name: 'Business', nameAr: 'أعمال', icon: '💼', type: 'income' },
  { id: '11', name: 'Investment', nameAr: 'استثمار', icon: '📈', type: 'income' },
  { id: '12', name: 'Gift', nameAr: 'هدية', icon: '🎁', type: 'income' },
  { id: '13', name: 'Other', nameAr: 'أخرى', icon: '💵', type: 'income' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];