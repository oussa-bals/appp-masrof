import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '@/constants/colors';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: size === 'small' ? 8 : size === 'medium' ? 12 : 16,
      paddingHorizontal: size === 'small' ? 16 : size === 'medium' ? 24 : 32,
    };

    if (disabled) {
      return { ...baseStyle, backgroundColor: COLORS.gray[300] };
    }

    switch (variant) {
      case 'primary':
        return { ...baseStyle, backgroundColor: COLORS.primary[500] };
      case 'secondary':
        return { 
          ...baseStyle, 
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: COLORS.primary[500]
        };
      case 'danger':
        return { ...baseStyle, backgroundColor: COLORS.error[500] };
      default:
        return { ...baseStyle, backgroundColor: COLORS.primary[500] };
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: size === 'small' ? 14 : size === 'medium' ? 16 : 18,
      fontWeight: '600',
      textAlign: 'center',
    };

    if (disabled) {
      return { ...baseStyle, color: COLORS.gray[500] };
    }

    switch (variant) {
      case 'primary':
      case 'danger':
        return { ...baseStyle, color: COLORS.white };
      case 'secondary':
        return { ...baseStyle, color: COLORS.primary[500] };
      default:
        return { ...baseStyle, color: COLORS.white };
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[getTextStyle(), textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};