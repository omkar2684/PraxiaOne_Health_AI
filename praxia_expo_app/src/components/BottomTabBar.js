import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors, AppShadow } from '../constants/theme';

const TABS = [
  { key: 'home',     label: 'Home',      icon: 'home',         screen: 'Dashboard' },
  { key: 'biology',  label: 'Biology',   icon: 'science',      screen: 'LabResults' },
  { key: 'fab',      label: '',          icon: 'add',          screen: null,    isFab: true },
  { key: 'behavior', label: 'Behavior',  icon: 'directions-run', screen: 'TrackProgress' },
  { key: 'care',     label: 'Care Plan', icon: 'favorite',     screen: 'ActionPlan' },
];

export default function BottomTabBar({ navigation, activeTab = 'home' }) {
  const insets = useSafeAreaInsets();

  const handlePress = (tab) => {
    if (!tab.screen) return;
    navigation.navigate(tab.screen);
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map((tab) => {
        if (tab.isFab) {
          return (
            <View key="fab" style={styles.fabWrapper}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate('ConnectData')}
                style={styles.fab}
              >
                <MaterialIcons name="add" size={30} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          );
        }

        const active = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            activeOpacity={0.7}
            onPress={() => handlePress(tab)}
          >
            <MaterialIcons
              name={tab.icon}
              size={24}
              color={active ? AppColors.primary : AppColors.textLight}
            />
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    ...AppShadow.lg,
    // Ensure shadow goes upward
    shadowOffset: { width: 0, height: -3 },
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: AppColors.textLight,
    marginTop: 3,
  },
  tabLabelActive: {
    color: AppColors.primary,
    fontWeight: '700',
  },
  fabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
  },
  fab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
  },
});
