export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  note?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  type: 'income' | 'expense' | 'both';
}

export interface Settings {
  isDarkMode: boolean;
  isSecurityEnabled: boolean;
  securityType: 'pin' | 'biometric';
  pin?: string;
  language: string;
  currency: string;
}

export interface MonthlyStats {
  month: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}