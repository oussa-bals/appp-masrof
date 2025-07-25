import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Settings } from '@/types';

const SETTINGS_KEY = 'masroufi_settings';

const DEFAULT_SETTINGS: Settings = {
  isDarkMode: false,
  isSecurityEnabled: false,
  securityType: 'pin',
  language: 'ar',
  currency: 'DA',
};

export class SettingsStorage {
  static async getSettings(): Promise<Settings> {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage for web
        const settings = localStorage.getItem(SETTINGS_KEY);
        return settings ? { ...DEFAULT_SETTINGS, ...JSON.parse(settings) } : DEFAULT_SETTINGS;
      } else {
        const settings = await AsyncStorage.getItem(SETTINGS_KEY);
        return settings ? { ...DEFAULT_SETTINGS, ...JSON.parse(settings) } : DEFAULT_SETTINGS;
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  static async saveSettings(settings: Partial<Settings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      
      if (Platform.OS === 'web') {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      } else {
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  static async clearSettings(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(SETTINGS_KEY);
      } else {
        await AsyncStorage.removeItem(SETTINGS_KEY);
      }
    } catch (error) {
      console.error('Error clearing settings:', error);
    }
  }
}