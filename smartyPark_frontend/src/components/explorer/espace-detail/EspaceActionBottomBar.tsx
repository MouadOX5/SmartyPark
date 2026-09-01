import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Navigation, Activity } from 'lucide-react-native';

interface EspaceActionBottomBarProps {
  insetsBottom: number;
  onItineraire: () => void;
  onStartSession: () => void;
  isStartingSession: boolean;
  isActive: boolean;
  isActiveForThisEspace: boolean;
}

export default function EspaceActionBottomBar({
  insetsBottom,
  onItineraire,
  onStartSession,
  isStartingSession,
  isActive,
  isActiveForThisEspace,
}: EspaceActionBottomBarProps) {
  return (
    <View style={[styles.bottomBar, { paddingBottom: Math.max(insetsBottom, 16) }]}>
      <View style={styles.bottomBarInner}>
        <TouchableOpacity style={styles.btnOutline} onPress={onItineraire} activeOpacity={0.8}>
          <Navigation size={20} color="#1e293b" />
          <Text style={styles.btnOutlineText}>Y aller (Maps)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={onStartSession}
          disabled={isStartingSession}
          activeOpacity={0.8}
        >
          {isStartingSession ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Activity size={20} color="#FFFFFF" />
              <Text style={styles.btnPrimaryText}>
                {isActive && isActiveForThisEspace ? 'Session en cours' : 'Déclarer ma présence'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingHorizontal: 20,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 50,
  },
  bottomBarInner: {
    flexDirection: 'row',
    gap: 16,
    maxWidth: 768,
    alignSelf: 'center',
    width: '100%',
  },
  btnOutline: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0', // slate-200
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnOutlineText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b', // slate-800
  },
  btnPrimary: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#006c49', // primary
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
