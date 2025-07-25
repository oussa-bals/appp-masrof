import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  I18nManager,
  Platform,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Moon, Shield, Trash2, Info, ChevronLeft } from 'lucide-react-native';
import { Settings } from '@/types';
import { SettingsStorage } from '@/storage/settingsStorage';
import { database } from '@/storage/database';
import { COLORS } from '@/constants/colors';
import { TEXTS } from '@/constants/texts';

// Enable RTL (only on native platforms)
if (Platform.OS !== 'web') {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>({
    isDarkMode: false,
    isSecurityEnabled: false,
    securityType: 'pin',
    language: 'ar',
    currency: 'DA',
  });
  const [biometricSupported, setBiometricSupported] = useState(false);

  useEffect(() => {
    loadSettings();
    checkBiometricSupport();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await SettingsStorage.getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const checkBiometricSupport = async () => {
    try {
      // Biometric authentication is not available on web
      if (Platform.OS === 'web') {
        setBiometricSupported(false);
        return;
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricSupported(hasHardware && isEnrolled);
    } catch (error) {
      console.error('Error checking biometric support:', error);
    }
  };

  const updateSetting = async (key: keyof Settings, value: any) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await SettingsStorage.saveSettings({ [key]: value });
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من رغبتك في حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.',
      [
        { text: TEXTS.common.cancel, style: 'cancel' },
        {
          text: TEXTS.common.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await database.clearAllTransactions();
              await SettingsStorage.clearSettings();
              Alert.alert(TEXTS.common.success, 'تم حذف جميع البيانات بنجاح');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert(TEXTS.common.error, 'حدث خطأ أثناء حذف البيانات');
            }
          },
        },
      ]
    );
  };

  const SettingItem: React.FC<{
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }> = ({ icon, title, subtitle, onPress, rightElement }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>{icon}</View>
        <View style={styles.textContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement && <View style={styles.settingRight}>{rightElement}</View>}
      {!rightElement && <ChevronLeft size={20} color={COLORS.gray[400]} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{TEXTS.settings.title}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{TEXTS.settings.appearance}</Text>
          <SettingItem
            icon={<Moon size={24} color={COLORS.gray[600]} />}
            title={TEXTS.settings.darkMode}
            subtitle="تفعيل الوضع المظلم للتطبيق"
            rightElement={
              <Switch
                value={settings.isDarkMode}
                onValueChange={(value) => updateSetting('isDarkMode', value)}
                trackColor={{ false: COLORS.gray[300], true: COLORS.primary[300] }}
                thumbColor={settings.isDarkMode ? COLORS.primary[500] : COLORS.gray[500]}
              />
            }
          />
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{TEXTS.settings.security}</Text>
          <SettingItem
            icon={<Shield size={24} color={COLORS.gray[600]} />}
            title={TEXTS.settings.enableSecurity}
            subtitle="حماية التطبيق برمز PIN أو بصمة الإصبع"
            rightElement={
              <Switch
                value={settings.isSecurityEnabled}
                onValueChange={(value) => updateSetting('isSecurityEnabled', value)}
                trackColor={{ false: COLORS.gray[300], true: COLORS.primary[300] }}
                thumbColor={settings.isSecurityEnabled ? COLORS.primary[500] : COLORS.gray[500]}
              />
            }
          />
          
          {settings.isSecurityEnabled && (
            <View style={styles.subSettings}>
              <TouchableOpacity 
                style={styles.securityOption}
                onPress={() => updateSetting('securityType', 'pin')}
              >
                <Text style={styles.securityOptionText}>رمز PIN</Text>
                <View style={[
                  styles.radio,
                  settings.securityType === 'pin' && styles.radioSelected
                ]} />
              </TouchableOpacity>
              
              {biometricSupported && (
                <TouchableOpacity 
                  style={styles.securityOption}
                  onPress={() => updateSetting('securityType', 'biometric')}
                >
                  <Text style={styles.securityOptionText}>بصمة الإصبع</Text>
                  <View style={[
                    styles.radio,
                    settings.securityType === 'biometric' && styles.radioSelected
                  ]} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{TEXTS.settings.data}</Text>
          <SettingItem
            icon={<Trash2 size={24} color={COLORS.error[500]} />}
            title={TEXTS.settings.clearData}
            subtitle="حذف جميع المعاملات والإعدادات"
            onPress={handleClearData}
          />
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{TEXTS.settings.about}</Text>
          <SettingItem
            icon={<Info size={24} color={COLORS.gray[600]} />}
            title="حول التطبيق"
            subtitle="الإصدار 1.0.0"
            onPress={() => {
              Alert.alert(
                'مصروفي',
                'تطبيق مدير المصاريف الشخصية\nمصمم للمستخدمين الجزائريين\n\nالإصدار: 1.0.0\nتم التطوير باستخدام React Native و Expo'
              );
            }}
          />
        </View>
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
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.gray[700],
    marginBottom: 12,
    textAlign: 'right',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingLeft: {
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
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[800],
    textAlign: 'right',
  },
  settingSubtitle: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 2,
    textAlign: 'right',
  },
  settingRight: {
    marginLeft: 12,
  },
  subSettings: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginTop: 8,
    padding: 4,
  },
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  securityOptionText: {
    fontSize: 16,
    color: COLORS.gray[700],
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gray[400],
  },
  radioSelected: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[500],
  },
});