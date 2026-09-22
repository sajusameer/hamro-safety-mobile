// Hamro Safety - Quick Exit / Screen Mask
// Company: Zuptrix Solutions Pvt. Ltd.
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEmergency } from '../../context/EmergencyContext';
import { SAFETY_STATES } from '../../constants/safetyStates';
import colors from '../../theme/colors';

export const QuickExitScreen = ({ navigation }) => {
  const { safetyState } = useEmergency();
  const [dummyNote, setDummyNote] = useState('Groceries:\n- Rice 5kg\n- Milk 1L\n- Dal\n- Vegetables');
  const [unmaskCount, setUnmaskCount] = useState(0);

  const isEmergencyActive = safetyState === SAFETY_STATES.SOS_ACTIVE;

  const handleSecretUnmask = () => {
    const next = unmaskCount + 1;
    if (next >= 3) {
      navigation.goBack();
    } else {
      setUnmaskCount(next);
      setTimeout(() => setUnmaskCount(0), 1500);
    }
  };

  return (
    <View style={styles.container}>
      {/* Camouflage Header */}
      <View style={styles.notepadHeader}>
        <Text style={styles.notepadTitle}>Daily Notes</Text>
        {/* Invisible tap target in top right corner */}
        <TouchableOpacity
          onPress={handleSecretUnmask}
          style={styles.secretButton}
          accessibilityLabel="Secret back"
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Background Safety Status Notice */}
      <View style={styles.discreetStatusBar}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isEmergencyActive ? colors.emergency : colors.safe },
          ]}
        />
        <Text style={styles.discreetStatusText}>
          {isEmergencyActive
            ? 'Background SOS Broadcast is ACTIVE'
            : 'Hamro Safety background protection running'}
        </Text>
      </View>

      {/* Camouflage Notepad Body */}
      <TextInput
        value={dummyNote}
        onChangeText={setDummyNote}
        multiline
        style={styles.noteInput}
        placeholder="Type notes here..."
      />

      {/* Subtle Bottom Instruction to Unmask */}
      <View style={styles.bottomHint}>
        <Text style={styles.hintText}>
          Triple-tap top right icon (⋮) or tap below to return to safety app
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.returnBtn}>
          <Text style={styles.returnBtnText}>Exit Disguise Screen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7', // Notepad paper color
    paddingTop: 48,
    paddingHorizontal: 20,
  },
  notepadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 12,
  },
  notepadTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#334155',
  },
  secretButton: {
    padding: 8,
  },
  discreetStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginTop: 8,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  discreetStatusText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  noteInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 24,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  bottomHint: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
  },
  hintText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 8,
  },
  returnBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  returnBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
});

export default QuickExitScreen;
