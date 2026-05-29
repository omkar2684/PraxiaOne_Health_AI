import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppColors, AppShadow, AppRadius } from '../constants/theme';
import { ApiService } from '../services/apiService';
import BottomTabBar from '../components/BottomTabBar';
import HealthGauge from '../components/HealthGauge';
import Sparkline from '../components/Sparkline';
import AppSidebarWrapper from '../components/AppSidebarWrapper';

// ── Mock / Fallback Data ──────────────────────────────────────────────────────

const MOCK_TRENDS = [
  {
    key: 'hrv',
    label: 'HRV',
    value: '68',
    unit: 'ms',
    change: '+13%',
    positive: true,
    color: AppColors.primary,
    sparkData: [52, 56, 58, 60, 62, 65, 68],
  },
  {
    key: 'rhr',
    label: 'Resting HR',
    value: '56',
    unit: 'bpm',
    change: '+4%',
    positive: true,
    color: AppColors.danger,
    sparkData: [62, 60, 59, 58, 57, 56, 56],
  },
  {
    key: 'sleep',
    label: 'Sleep Score',
    value: '82',
    unit: '/100',
    change: '+6%',
    positive: true,
    color: AppColors.teal,
    sparkData: [74, 76, 78, 80, 79, 81, 82],
  },
  {
    key: 'steps',
    label: 'Steps',
    value: '7,245',
    unit: '',
    change: '+1,245',
    positive: true,
    color: AppColors.accent,
    sparkData: [4800, 6200, 5500, 7800, 6500, 7000, 7245],
  },
];

const MOCK_PRIORITIES = [
  {
    id: 1,
    icon: 'bedtime',
    iconColor: AppColors.primary,
    iconBg: AppColors.primaryLight,
    title: 'Improve Sleep Consistency',
    subtitle: 'Your sleep schedule is inconsistent',
    badge: 'Medium',
    badgeColor: AppColors.warning,
    badgeBg: AppColors.warningLight,
  },
  {
    id: 2,
    icon: 'science',
    iconColor: AppColors.danger,
    iconBg: AppColors.dangerLight,
    title: 'Reduce Inflammation',
    subtitle: 'CRP improving',
    badge: 'Good',
    badgeColor: AppColors.accent,
    badgeBg: AppColors.accentLight,
  },
  {
    id: 3,
    icon: 'water-drop',
    iconColor: AppColors.orange,
    iconBg: AppColors.orangeLight,
    title: 'Optimize Glucose',
    subtitle: 'Fasting glucose above target',
    badge: 'Medium',
    badgeColor: AppColors.warning,
    badgeBg: AppColors.warningLight,
  },
];

const MOCK_BIOMARKERS = [
  { id: 1, name: 'CRP',             value: '1.2', unit: 'mg/L',  change: '33%', up: false, color: AppColors.accent },
  { id: 2, name: 'Fasting Glucose', value: '92',  unit: 'mg/dL', change: '8%',  up: false, color: AppColors.accent },
  { id: 3, name: 'LDL Cholesterol', value: '132', unit: 'mg/dL', change: '12%', up: false, color: AppColors.accent },
  { id: 4, name: 'Vitamin D',       value: '38',  unit: 'ng/mL', change: '5%',  up: true,  color: AppColors.warning },
];

// ── Sub-Components ────────────────────────────────────────────────────────────

function SectionHeader({ title, action, onPress }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function TrendCard({ item }) {
  return (
    <View style={styles.trendItem}>
      <Text style={styles.trendLabel}>{item.label}</Text>
      <Text style={styles.trendValue}>
        {item.value}
        <Text style={styles.trendUnit}> {item.unit}</Text>
      </Text>
      <View style={styles.trendChange}>
        <MaterialIcons
          name={item.positive ? 'arrow-upward' : 'arrow-downward'}
          size={11}
          color={item.positive ? AppColors.accent : AppColors.danger}
        />
        <Text style={[styles.trendChangeTxt, { color: item.positive ? AppColors.accent : AppColors.danger }]}>
          {item.change}
        </Text>
      </View>
      <Sparkline data={item.sparkData} color={item.color} width={56} height={20} />
    </View>
  );
}

function PriorityRow({ item, isLast, onPress }) {
  return (
    <>
      <TouchableOpacity style={styles.priorityRow} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.priorityIconBox, { backgroundColor: item.iconBg }]}>
          <MaterialIcons name={item.icon} size={18} color={item.iconColor} />
        </View>
        <View style={styles.priorityText}>
          <Text style={styles.priorityTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.prioritySubtitle} numberOfLines={1}>{item.subtitle}</Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: item.badgeBg }]}>
          <Text style={[styles.priorityBadgeTxt, { color: item.badgeColor }]}>{item.badge}</Text>
        </View>
      </TouchableOpacity>
      {!isLast && <View style={styles.divider} />}
    </>
  );
}

function BiomarkerCell({ item }) {
  return (
    <View style={styles.bioCell}>
      <Text style={styles.bioCellName}>{item.name}</Text>
      <Text style={styles.bioCellValue}>
        {item.value}{' '}
        <Text style={styles.bioCellUnit}>{item.unit}</Text>
      </Text>
      <View style={styles.bioCellChange}>
        <MaterialIcons
          name={item.up ? 'arrow-upward' : 'arrow-downward'}
          size={11}
          color={item.up ? AppColors.warning : AppColors.accent}
        />
        <Text style={[styles.bioCellChangeTxt, { color: item.up ? AppColors.warning : AppColors.accent }]}>
          {item.up ? '↑' : '↓'} {item.change}
        </Text>
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function DashboardScreen({ navigation }) {
  const sidebarRef = useRef(null);
  const [username, setUsername] = useState('Alex');
  const [healthScore, setHealthScore] = useState(78);
  const [scoreLabel, setScoreLabel] = useState('Good');
  const [refreshing, setRefreshing] = useState(false);
  const [trendsWindow, setTrendsWindow] = useState('7D');

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const dateStr = () => {
    return new Date().toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });
  };

  const load = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('username');
      if (stored) setUsername(stored);
      const hs = await ApiService.getHealthScore();
      if (hs?.score) {
        setHealthScore(hs.score);
        const s = hs.score >= 80 ? 'Excellent' : hs.score >= 65 ? 'Good' : hs.score >= 50 ? 'Fair' : 'Needs Attention';
        setScoreLabel(s);
      }
    } catch (_) {}
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useEffect(() => { load(); }, [load]);

  const scoreColor =
    healthScore >= 70 ? AppColors.accent :
    healthScore >= 50 ? AppColors.warning : AppColors.danger;

  return (
    <AppSidebarWrapper ref={sidebarRef} navigation={navigation} activeScreen="Dashboard">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={AppColors.primary} />}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={styles.header}>
          {/* Hamburger Menu */}
          <TouchableOpacity
            onPress={() => sidebarRef.current?.toggleDrawer()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.menuBtn}
          >
            <MaterialIcons name="menu" size={24} color={AppColors.text} />
          </TouchableOpacity>
          {/* Praxia Logo Mark */}
          <View style={styles.logoMark}>
            <MaterialIcons name="favorite" size={14} color="#FFFFFF" />
          </View>
          <Text style={styles.logoText}>praxia</Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="notifications-none" size={24} color={AppColors.text} />
          </TouchableOpacity>
        </View>

        {/* ── Greeting ───────────────────────────────────────────────── */}
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>
            {greeting()}, {username} 👋
          </Text>
          <Text style={styles.greetingDate}>{dateStr()}</Text>
        </View>

        {/* ── Health Score Card ───────────────────────────────────────── */}
        <View style={[styles.card, styles.scoreCard]}>
          <View style={styles.scoreCardHeader}>
            <Text style={styles.cardTitle}>Health Score</Text>
            <MaterialIcons name="info-outline" size={16} color={AppColors.textLight} />
          </View>
          <View style={styles.scoreRow}>
            {/* Arc Gauge */}
            <HealthGauge score={healthScore} size={130} stroke={12} />
            {/* Right side info */}
            <View style={styles.scoreInfo}>
              <Text style={[styles.scoreLevelText, { color: scoreColor }]}>{scoreLabel}</Text>
              <Text style={styles.scoreSub}>You're trending well.{'\n'}Keep going!</Text>
              <TouchableOpacity
                style={styles.viewDetailsBtn}
                onPress={() => navigation.navigate('AiSummary')}
              >
                <Text style={styles.viewDetailsTxt}>View details</Text>
                <MaterialIcons name="chevron-right" size={14} color={AppColors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Trends Overview ─────────────────────────────────────────── */}
        <View style={[styles.card]}>
          <View style={styles.trendsHeader}>
            <TouchableOpacity onPress={() => navigation.navigate('DailySnapshot')}>
              <Text style={styles.cardTitle}>Trends Overview</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('DailySnapshot')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.sectionAction}>View all ›</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.windowPill}>
                <Text style={styles.windowPillTxt}>{trendsWindow}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={14} color={AppColors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.trendsGrid}>
            {MOCK_TRENDS.map((item) => (
              <TrendCard key={item.key} item={item} />
            ))}
          </View>
        </View>

        {/* ── Top Priorities ──────────────────────────────────────────── */}
        <View style={[styles.card]}>
          <SectionHeader
            title="Top Priorities"
            action="View all ›"
            onPress={() => navigation.navigate('ActionPlan', { insightsData: {} })}
          />
          {MOCK_PRIORITIES.map((item, i) => (
            <PriorityRow
              key={item.id}
              item={item}
              isLast={i === MOCK_PRIORITIES.length - 1}
              onPress={() => navigation.navigate('Recommendation')}
            />
          ))}
        </View>

        {/* ── Latest Biomarkers ───────────────────────────────────────── */}
        <View style={[styles.card, { marginBottom: 4 }]}>
          <SectionHeader
            title="Latest Biomarkers"
            action="View all ›"
            onPress={() => navigation.navigate('LabResults')}
          />
          <View style={styles.bioGrid}>
            {MOCK_BIOMARKERS.map((item) => (
              <BiomarkerCell key={item.id} item={item} />
            ))}
          </View>
        </View>

        {/* Spacer for tab bar */}
        <View style={{ height: 16 }} />
        </ScrollView>

        {/* ── Bottom Tab Bar ──────────────────────────────────────────────── */}
        <BottomTabBar navigation={navigation} activeTab="home" />
      </SafeAreaView>
    </AppSidebarWrapper>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  menuBtn: {
    marginRight: 10,
  },
  logoMark: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.primary,
    letterSpacing: -0.5,
  },

  // Greeting
  greeting: {
    marginBottom: 18,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '800',
    color: AppColors.text,
    letterSpacing: -0.4,
  },
  greetingDate: {
    fontSize: 13,
    color: AppColors.textMuted,
    marginTop: 2,
    fontWeight: '400',
  },

  // Card base
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: AppRadius.lg,
    padding: 16,
    marginBottom: 14,
    ...AppShadow.md,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.text,
  },

  // Health Score Card
  scoreCard: {},
  scoreCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreLevelText: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  scoreSub: {
    fontSize: 13,
    color: AppColors.textMuted,
    lineHeight: 18,
    marginBottom: 12,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailsTxt: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.primary,
  },

  // Trends
  trendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  windowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: AppColors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: AppRadius.full,
  },
  windowPillTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.textMuted,
  },
  trendsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trendItem: {
    flex: 1,
    alignItems: 'flex-start',
    paddingRight: 4,
  },
  trendLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: AppColors.textMuted,
    marginBottom: 4,
  },
  trendValue: {
    fontSize: 15,
    fontWeight: '800',
    color: AppColors.text,
  },
  trendUnit: {
    fontSize: 10,
    fontWeight: '500',
    color: AppColors.textMuted,
  },
  trendChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    marginTop: 2,
    marginBottom: 6,
  },
  trendChangeTxt: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.text,
  },
  sectionAction: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.primary,
  },

  // Priorities
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  priorityIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityText: {
    flex: 1,
  },
  priorityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 2,
  },
  prioritySubtitle: {
    fontSize: 12,
    color: AppColors.textMuted,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: AppRadius.full,
  },
  priorityBadgeTxt: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.border,
    marginHorizontal: -4,
  },

  // Biomarkers
  bioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  bioCell: {
    width: '50%',
    paddingVertical: 10,
    paddingRight: 12,
  },
  bioCellName: {
    fontSize: 11,
    fontWeight: '600',
    color: AppColors.textMuted,
    marginBottom: 3,
  },
  bioCellValue: {
    fontSize: 17,
    fontWeight: '800',
    color: AppColors.text,
    marginBottom: 3,
  },
  bioCellUnit: {
    fontSize: 11,
    fontWeight: '400',
    color: AppColors.textMuted,
  },
  bioCellChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  bioCellChangeTxt: {
    fontSize: 11,
    fontWeight: '700',
  },
});
