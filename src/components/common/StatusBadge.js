// Hamro Safety - Safety Status Badge
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { SAFETY_STATE_CONFIG, SAFETY_STATES } from '../../constants/safetyStates';

export const StatusBadge = ({
  status = SAFETY_STATES.SAFE,
  label,
  size = 'md',
  style,
}) => {
  const config = SAFETY_STATE_CONFIG[status] || SAFETY_STATE_CONFIG[SAFETY_STATES.SAFE];
  const color = colors[config.colorKey] || colors.safe;
  const isLarge = size === 'lg';

  return (
    <View
      style={[
        styles.badge,
        {
          borderColor: color,
          backgroundColor: status === SAFETY_STATES.SOS_ACTIVE ? colors.emergencyLight : colors.surface,
        },
        isLarge && styles.badgeLarge,
        style,
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Safety status: ${label || config.badgeText}`}
    >
      <Ionicons
        name={config.icon}
        size={isLarge ? 20 : 16}
        color={color}
        style={styles.icon}
      />
      <Text
        style={[
          styles.text,
          { color: status === SAFETY_STATES.SOS_ACTIVE ? colors.emergencyDark : color },
          isLarge && styles.textLarge,
        ]}
      >
        {label || config.badgeText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  badgeLarge: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 24,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textLarge: {
    fontSize: 14,
  },
});

export default StatusBadge;
