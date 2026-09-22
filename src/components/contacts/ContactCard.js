// Hamro Safety - Contact Card Component
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';

export const ContactCard = ({
  contact,
  onEdit,
  onDelete,
  showCircleBadges = true,
  style,
}) => {
  const isPrimary = contact.priority === 1;

  const handleCall = () => {
    if (contact.phone) {
      Linking.openURL(`tel:${contact.phone}`);
    }
  };

  return (
    <View style={[styles.card, style]}>
      <View style={styles.topRow}>
        <View style={styles.nameGroup}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {contact.name ? contact.name.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
          <View style={styles.textDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{contact.name}</Text>
              {isPrimary && (
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryText}>PRIMARY</Text>
                </View>
              )}
            </View>
            <Text style={styles.relationship}>
              {contact.relationship} • {contact.phone}
            </Text>
          </View>
        </View>

        {/* Call Action */}
        <TouchableOpacity
          onPress={handleCall}
          style={styles.callButton}
          accessibilityLabel={`Call ${contact.name}`}
        >
          <Ionicons name="call" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Permissions / Circle badges */}
      {showCircleBadges && contact.safety_circle && (
        <View style={styles.circleRow}>
          {contact.safety_circle.allow_sos_alerts && (
            <View style={styles.tag}>
              <Ionicons name="shield-checkmark" size={12} color={colors.emergency} />
              <Text style={styles.tagText}>SOS Alert</Text>
            </View>
          )}
          {contact.safety_circle.allow_emergency_location && (
            <View style={styles.tag}>
              <Ionicons name="location-outline" size={12} color={colors.primary} />
              <Text style={styles.tagText}>Location</Text>
            </View>
          )}
          {contact.safety_circle.allow_safety_timer_alerts && (
            <View style={styles.tag}>
              <Ionicons name="timer-outline" size={12} color={colors.warning} />
              <Text style={styles.tagText}>Timer Alert</Text>
            </View>
          )}
        </View>
      )}

      {/* Bottom actions: Edit / Delete */}
      <View style={styles.actionRow}>
        {onEdit && (
          <TouchableOpacity onPress={onEdit} style={styles.textBtn}>
            <Ionicons name="pencil-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.actionLabel}>Edit</Text>
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.textBtn}>
            <Ionicons name="trash-outline" size={14} color={colors.emergency} />
            <Text style={[styles.actionLabel, { color: colors.emergency }]}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  textDetails: {
    marginLeft: 12,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  primaryBadge: {
    backgroundColor: colors.emergencyLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  primaryText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.emergencyDark,
  },
  relationship: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  callButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  circleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  tagText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  textBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

export default ContactCard;
