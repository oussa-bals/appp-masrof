import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, I18nManager, Platform } from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { TEXTS } from '@/constants/texts';
import { SettingsStorage } from '@/storage/settingsStorage';

// Enable RTL (only on native platforms)
if (Platform.OS !== 'web') {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

export default function SplashScreen() {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.5);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after delay
    const timer = setTimeout(async () => {
      try {
        const settings = await SettingsStorage.getSettings();
        if (settings.isSecurityEnabled) {
          router.replace('/lock');
        } else {
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        router.replace('/(tabs)');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>💰</Text>
        </View>
        <Text style={styles.appName}>{TEXTS.app.name}</Text>
        <Text style={styles.appSubtitle}>{TEXTS.app.subtitle}</Text>
      </Animated.View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>مصمم للمستخدمين الجزائريين</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  logo: {
    fontSize: 48,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 16,
    color: COLORS.primary[100],
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.primary[200],
    textAlign: 'center',
  },
});