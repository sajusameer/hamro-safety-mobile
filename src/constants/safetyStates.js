// Hamro Safety - Safety States & Badges
// Zuptrix Solutions Pvt. Ltd.

export const SAFETY_STATES = {
  SAFE: 'SAFE',
  SOS_ACTIVATING: 'SOS_ACTIVATING',
  SOS_ACTIVE: 'SOS_ACTIVE',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  RESOLVED: 'RESOLVED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
};

export const SAFETY_STATE_CONFIG = {
  [SAFETY_STATES.SAFE]: {
    label: 'Safe & Protected',
    badgeText: 'STATUS: SAFE',
    colorKey: 'safe',
    icon: 'shield-checkmark',
    description: 'All safety monitors active. Hold SOS button for 3s in an emergency.',
  },
  [SAFETY_STATES.SOS_ACTIVATING]: {
    label: 'Activating Emergency...',
    badgeText: 'STATUS: ACTIVATING',
    colorKey: 'warning',
    icon: 'alert-circle',
    description: 'Keep holding to broadcast emergency alert to your Safety Circle.',
  },
  [SAFETY_STATES.SOS_ACTIVE]: {
    label: 'EMERGENCY ACTIVE',
    badgeText: 'STATUS: ACTIVE SOS',
    colorKey: 'emergency',
    icon: 'warning',
    description: 'Broadcasting live location to contacts and preparing emergency response.',
  },
  [SAFETY_STATES.ACKNOWLEDGED]: {
    label: 'Alert Acknowledged',
    badgeText: 'STATUS: ACKNOWLEDGED',
    colorKey: 'warning',
    icon: 'checkmark-circle',
    description: 'Trusted contact has seen your alert. Emergency response underway.',
  },
  [SAFETY_STATES.RESOLVED]: {
    label: 'Incident Resolved',
    badgeText: 'STATUS: RESOLVED',
    colorKey: 'resolved',
    icon: 'checkmark-done-circle',
    description: 'Emergency resolved. Safe status restored.',
  },
  [SAFETY_STATES.CANCELLED]: {
    label: 'SOS Cancelled',
    badgeText: 'STATUS: CANCELLED',
    colorKey: 'textSecondary',
    icon: 'close-circle',
    description: 'The emergency trigger was cancelled before dispatch.',
  },
  [SAFETY_STATES.FAILED]: {
    label: 'Dispatch Warning',
    badgeText: 'STATUS: DISPATCH FAILED',
    colorKey: 'emergency',
    icon: 'alert-circle',
    description: 'Network failure during alert broadcast. Direct calling recommended.',
  },
  [SAFETY_STATES.EXPIRED]: {
    label: 'Safety Timer Expired',
    badgeText: 'STATUS: TIMER EXPIRED',
    colorKey: 'warning',
    icon: 'timer',
    description: 'Expected arrival time elapsed without safe check-in.',
  },
};

export default { SAFETY_STATES, SAFETY_STATE_CONFIG };
