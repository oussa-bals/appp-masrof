import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { Transaction } from '@/types';

class Database {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    try {
      if (Platform.OS === 'web') {
        // For web, we'll use a different approach or fallback
        console.log('SQLite not fully supported on web, using fallback');
        return;
      }
      
      this.db = await SQLite.openDatabaseAsync('masroufi.db');
      await this.createTables();
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }

  private async createTables() {
    if (!this.db) {
      console.warn('Database not available');
      return;
    }

    try {
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          amount REAL NOT NULL,
          category TEXT NOT NULL,
          date TEXT NOT NULL,
          note TEXT,
          createdAt TEXT NOT NULL
        );
      `);
    } catch (error) {
      console.error('Error creating tables:', error);
    }
  }

  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<string> {
    if (!this.db) {
      console.warn('Database not available, using fallback storage');
      // For web fallback, we could use localStorage here
      return Date.now().toString();
    }

    try {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      await this.db.runAsync(
        'INSERT INTO transactions (id, type, amount, category, date, note, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, transaction.type, transaction.amount, transaction.category, transaction.date, transaction.note || '', transaction.createdAt]
      );

      return id;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  async getTransactions(): Promise<Transaction[]> {
    if (!this.db) {
      console.warn('Database not available, returning empty array');
      return [];
    }

    try {
      const result = await this.db.getAllAsync(
        'SELECT * FROM transactions ORDER BY date DESC, createdAt DESC'
      );

      return result.map(row => ({
        id: row.id as string,
        type: row.type as 'income' | 'expense',
        amount: row.amount as number,
        category: row.category as string,
        date: row.date as string,
        note: row.note as string,
        createdAt: row.createdAt as string,
      }));
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  async getTransactionsByMonth(year: number, month: number): Promise<Transaction[]> {
    if (!this.db) {
      console.warn('Database not available, returning empty array');
      return [];
    }

    try {
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

      const result = await this.db.getAllAsync(
        'SELECT * FROM transactions WHERE date >= ? AND date <= ? ORDER BY date DESC',
        [startDate, endDate]
      );

      return result.map(row => ({
        id: row.id as string,
        type: row.type as 'income' | 'expense',
        amount: row.amount as number,
        category: row.category as string,
        date: row.date as string,
        note: row.note as string,
        createdAt: row.createdAt as string,
      }));
    } catch (error) {
      console.error('Error getting transactions by month:', error);
      return [];
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    if (!this.db) {
      console.warn('Database not available');
      return;
    }

    try {
      await this.db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  }

  async clearAllTransactions(): Promise<void> {
    if (!this.db) {
      console.warn('Database not available');
      return;
    }

    try {
      await this.db.runAsync('DELETE FROM transactions');
    } catch (error) {
      console.error('Error clearing transactions:', error);
    }
  }

  async getStats(year: number, month: number) {
    if (!this.db) {
      console.warn('Database not available, returning empty stats');
      return {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        categoryStats: {},
        transactionCount: 0,
      };
    }

    try {
      const transactions = await this.getTransactionsByMonth(year, month);
      
      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const categoryStats = transactions.reduce((acc, transaction) => {
        if (!acc[transaction.category]) {
          acc[transaction.category] = 0;
        }
        acc[transaction.category] += transaction.amount;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense,
        categoryStats,
        transactionCount: transactions.length,
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        categoryStats: {},
        transactionCount: 0,
      };
    }
  }
}

export const database = new Database();