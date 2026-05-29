import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Dimensions, TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors } from '../constants/theme';
import { ApiService } from '../services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.78;

// ── Menu structure ────────────────────────────────────────────────────────────
const MENU_SECTIONS = [
  {
    heading: 'DASHBOARD',
    items: [
      { icon: 'home',          label: 'Home Dashboard',    screen: 'Dashboard',     color: AppColors.primary },
      { icon: 'today',         label: 'Daily Snapshot',    screen: 'DailySnapshot', color: AppColors.teal },
      { icon: 'auto-awesome',  label: 'AI Health Summary', screen: 'AiSummary',     color: AppColors.accent },
    ],
  },
  {
    heading: 'YOUR JOURNEY',
    items: [
      { icon: 'sensors',            label: 'Data Sources',      screen: 'DataSources',      color: '#64748B' },
      { icon: 'chat-bubble-outline', label: 'AI Assistant',     screen: 'Assistant',         color: '#64748B' },
      { icon: 'auto-awesome',       label: 'Predictions',       screen: 'Prediction',        color: '#64748B' },
      { icon: 'check-circle-outline',label: 'Recommendations',  screen: 'ActionPlan',        color: '#64748B' },
      { icon: 'trending-up',        label: 'Track Progress',    screen: 'TrackProgress',     color: '#64748B' },
      { icon: 'science',            label: 'Lab Results',       screen: 'LabResults',        color: '#64748B' },
      { icon: 'medical-services',   label: 'Escalation',        screen: 'Escalation',        color: '#64748B' },
      { icon: 'forum',              label: 'Message Portal',    screen: 'MessagePortal',     color: '#64748B' },
      { icon: 'map',                label: 'Journey Flow',      screen: 'JourneyFlow',       color: '#64748B' },
    ],
  },
  {
    heading: 'ACCOUNT',
    items: [
      { icon: 'settings', label: 'Settings', screen: 'Settings', color: '#64748B' },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

const AppSidebarWrapper = forwardRef(({ navigation, children, activeScreen = '' }, ref) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const [username, setUsername] = useState('User');

  useEffect(() => {
    const fetchUser = async () => {
      const stored = await AsyncStorage.getItem('username');
      if (stored) setUsername(stored);
    };
    fetchUser();
  }, []);

  useImperativeHandle(ref, () => ({
    toggleDrawer: () => toggleDrawer(),
    openDrawer: () => openDrawer(),
    closeDrawer: () => closeDrawer(),
  }));

  const openDrawer = () => {
    setIsDrawerOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setIsDrawerOpen(false));
  };

  const toggleDrawer = () => {
    isDrawerOpen ? closeDrawer() : openDrawer();
  };

  const handleLogout = async () => {
    closeDrawer();
    setTimeout(async () => {
      await ApiService.logout();
      navigation.replace('Login');
    }, 260);
  };

  const navigateTo = (screen) => {
    closeDrawer();
    setTimeout(() => navigation.navigate(screen), 260);
  };

  const initials = username
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');

  return (
    <View style={{ flex: 1 }}>
      {/* ── Screen content ─────────────────────────────────────────── */}
      <View style={{ flex: 1 }}>{children}</View>

      {/* ── Backdrop overlay ───────────────────────────────────────── */}
      {isDrawerOpen && (
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <Animated.View
            style={[styles.overlay, { opacity: overlayAnim }]}
          />
        </TouchableWithoutFeedback>
      )}

      {/* ── Slide-in Drawer ────────────────────────────────────────── */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>

          {/* Header with gradient */}
          <LinearGradient
            colors={[AppColors.primary, AppColors.primaryMid]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.drawerHeader}
          >
            {/* Close button */}
            <TouchableOpacity style={styles.closeBtn} onPress={closeDrawer}>
              <MaterialIcons name="close" size={20} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>

            {/* Avatar */}
            <View style={styles.avatarWrapper}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials || 'U'}</Text>
              </View>
            </View>
            <Text style={styles.username}>{username}</Text>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Active Session</Text>
            </View>
          </LinearGradient>

          {/* Menu items */}
          <ScrollView
            style={styles.menuScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {MENU_SECTIONS.map((section, si) => (
              <View key={si}>
                <Text style={styles.sectionHeading}>{section.heading}</Text>

                {section.items.map((item, ii) => {
                  const isActive = activeScreen === item.screen;
                  return (
                    <TouchableOpacity
                      key={ii}
                      style={[styles.menuItem, isActive && styles.menuItemActive]}
                      onPress={() => navigateTo(item.screen)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.menuIconBox,
                        { backgroundColor: isActive ? AppColors.primary : `${item.color}18` },
                      ]}>
                        <MaterialIcons
                          name={item.icon}
                          size={19}
                          color={isActive ? '#fff' : item.color}
                        />
                      </View>
                      <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                        {item.label}
                      </Text>
                      {isActive && (
                        <MaterialIcons name="chevron-right" size={18} color={AppColors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                })}

                {si < MENU_SECTIONS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}

            {/* Logout */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
              <MaterialIcons name="logout" size={19} color="#EF4444" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
});

export default AppSidebarWrapper;

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(15,23,42,0.45)',
    zIndex: 10,
  },
  drawer: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#FFFFFF',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 24,
  },

  // Header
  drawerHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'flex-start',
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 4,
    marginBottom: 16,
  },
  avatarWrapper: { marginBottom: 12 },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: {
    fontSize: 22, fontWeight: '900', color: '#FFFFFF',
  },
  username: {
    fontSize: 17, fontWeight: '800', color: '#FFFFFF',
    marginBottom: 6, letterSpacing: -0.3,
  },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 999,
  },
  statusDot: {
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: '#4ADE80',
  },
  statusText: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },

  // Menu
  menuScroll: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: 8 },
  sectionHeading: {
    fontSize: 10, fontWeight: '800', color: '#94A3B8',
    letterSpacing: 1.4, marginLeft: 20, marginTop: 16, marginBottom: 4,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 16,
    marginHorizontal: 8, borderRadius: 12, marginBottom: 2,
    gap: 12,
  },
  menuItemActive: {
    backgroundColor: `${AppColors.primary}10`,
  },
  menuIconBox: {
    width: 34, height: 34, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: {
    flex: 1, fontSize: 14, fontWeight: '600', color: '#334155',
  },
  menuLabelActive: {
    color: AppColors.primary, fontWeight: '700',
  },

  divider: {
    height: 1, backgroundColor: '#E8ECF0',
    marginHorizontal: 20, marginTop: 8,
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 16,
    marginHorizontal: 8, borderRadius: 12,
    marginTop: 8,
    backgroundColor: '#FEF2F2',
  },
  logoutText: { fontSize: 14, fontWeight: '700', color: '#EF4444' },
});
