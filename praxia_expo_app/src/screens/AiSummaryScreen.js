import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors, AppShadow, AppRadius } from '../constants/theme';
import BottomTabBar from '../components/BottomTabBar';
import AppSidebarWrapper from '../components/AppSidebarWrapper';
import { ApiService } from '../services/apiService';

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_INSIGHTS = [
  {
    id: 1,
    icon: 'favorite',
    iconColor: AppColors.accent,
    iconBg: AppColors.accentLight,
    title: 'Your recovery is improving',
    subtitle: 'HRV and sleep quality are trending in the right direction.',
  },
  {
    id: 2,
    icon: 'local-fire-department',
    iconColor: AppColors.danger,
    iconBg: AppColors.dangerLight,
    title: 'Inflammation remains a focus',
    subtitle: 'CRP is elevated. Anti-inflammatory habits will help.',
  },
  {
    id: 3,
    icon: 'water-drop',
    iconColor: AppColors.orange,
    iconBg: AppColors.orangeLight,
    title: 'Glucose control needs attention',
    subtitle: 'Fasting glucose is above your optimal range.',
  },
  {
    id: 4,
    icon: 'directions-run',
    iconColor: AppColors.primary,
    iconBg: AppColors.primaryLight,
    title: 'Activity is on track',
    subtitle: 'Great job hitting your step goal consistently!',
  },
];

const MOCK_RECOMMENDATIONS = [
  {
    id: 1,
    icon: 'bedtime',
    iconColor: AppColors.primary,
    iconBg: AppColors.primaryLight,
    title: 'Prioritize 7+ hours of sleep',
    subtitle: 'Maintain a consistent bedtime to improve recovery.',
    impact: 'High Impact',
    impactColor: AppColors.danger,
    impactBg: AppColors.dangerLight,
  },
  {
    id: 2,
    icon: 'set-meal',
    iconColor: AppColors.teal,
    iconBg: AppColors.tealLight,
    title: 'Add omega-3 rich foods',
    subtitle: 'May help reduce inflammation and improve HRV.',
    impact: 'High Impact',
    impactColor: AppColors.danger,
    impactBg: AppColors.dangerLight,
  },
  {
    id: 3,
    icon: 'directions-walk',
    iconColor: AppColors.orange,
    iconBg: AppColors.orangeLight,
    title: 'Take a 10-min post-meal walk',
    subtitle: 'Can help improve glucose response.',
    impact: 'Medium Impact',
    impactColor: AppColors.warning,
    impactBg: AppColors.warningLight,
  },
];

// ── Sub-Components ────────────────────────────────────────────────────────────

function InsightRow({ item, isLast, onPress }) {
  return (
    <>
      <TouchableOpacity style={styles.insightRow} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.insightIcon, { backgroundColor: item.iconBg }]}>
          <MaterialIcons name={item.icon} size={20} color={item.iconColor} />
        </View>
        <View style={styles.insightText}>
          <Text style={styles.insightTitle}>{item.title}</Text>
          <Text style={styles.insightSubtitle} numberOfLines={2}>{item.subtitle}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color={AppColors.textLight} />
      </TouchableOpacity>
      {!isLast && <View style={styles.divider} />}
    </>
  );
}

function RecommendationRow({ item, isLast, onPress }) {
  return (
    <>
      <TouchableOpacity style={styles.recRow} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.recIcon, { backgroundColor: item.iconBg }]}>
          <MaterialIcons name={item.icon} size={20} color={item.iconColor} />
        </View>
        <View style={styles.recText}>
          <Text style={styles.recTitle}>{item.title}</Text>
          <Text style={styles.recSubtitle} numberOfLines={2}>{item.subtitle}</Text>
        </View>
        <View style={[styles.impactBadge, { backgroundColor: item.impactBg }]}>
          <Text style={[styles.impactTxt, { color: item.impactColor }]} numberOfLines={1}>
            {item.impact}
          </Text>
        </View>
      </TouchableOpacity>
      {!isLast && <View style={styles.divider} />}
    </>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function AiSummaryScreen({ navigation }) {
  const sidebarRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(MOCK_INSIGHTS);
  const [recommendations, setRecommendations] = useState(MOCK_RECOMMENDATIONS);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const recs = await ApiService.getRecommendations();
        if (recs && recs.length > 0) {
          setRecommendations(
            recs.map((r, i) => ({
              id: r.id || i,
              icon: r.icon === 'bedtime' ? 'bedtime' : r.icon === 'restaurant' ? 'set-meal' : 'directions-walk',
              iconColor: i === 0 ? AppColors.primary : i === 1 ? AppColors.teal : AppColors.orange,
              iconBg: i === 0 ? AppColors.primaryLight : i === 1 ? AppColors.tealLight : AppColors.orangeLight,
              title: r.title,
              subtitle: r.subtitle || r.description,
              impact: i === 0 ? 'High Impact' : 'Medium Impact',
              impactColor: i === 0 ? AppColors.danger : AppColors.warning,
              impactBg: i === 0 ? AppColors.dangerLight : AppColors.warningLight,
            }))
          );
        }
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  return (
    <AppSidebarWrapper ref={sidebarRef} navigation={navigation} activeScreen="AiSummary">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

        {/* ── Custom Header ─────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.backBtn}
          >
            <MaterialIcons name="arrow-back" size={22} color={AppColors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Health Summary</Text>
          <TouchableOpacity
            onPress={() => sidebarRef.current?.toggleDrawer()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="menu" size={22} color={AppColors.text} />
          </TouchableOpacity>
        </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── AI Banner ─────────────────────────────────────────────── */}
        <LinearGradient
          colors={['#EDE9FE', '#F5F3FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.aiBanner}
        >
          <View style={styles.aiBannerIcon}>
            <MaterialIcons name="auto-awesome" size={22} color={AppColors.primary} />
          </View>
          <Text style={styles.aiBannerText}>
            Here's your personalized health summary for today, powered by Praxia AI.
          </Text>
        </LinearGradient>

        {/* ── Key Insights ──────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Key Insights</Text>
          </View>
          {insights.map((item, i) => (
            <InsightRow
              key={item.id}
              item={item}
              isLast={i === insights.length - 1}
              onPress={() => navigation.navigate('AiInsights', { insight: item })}
            />
          ))}
        </View>

        {/* ── AI Recommendations ────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI Recommendations</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Recommendation')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.sectionAction}>View all ›</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={AppColors.primary} style={{ paddingVertical: 20 }} />
          ) : (
            recommendations.map((item, i) => (
              <RecommendationRow
                key={item.id}
                item={item}
                isLast={i === recommendations.length - 1}
                onPress={() => navigation.navigate('Recommendation')}
              />
            ))
          )}

          {/* Divider before Ask Praxia row */}
          <View style={styles.divider} />

          {/* Ask Praxia AI CTA */}
          <TouchableOpacity
            style={styles.recRow}
            onPress={() => navigation.navigate('Assistant')}
            activeOpacity={0.7}
          >
            <View style={[styles.recIcon, { backgroundColor: AppColors.primaryLight }]}>
              <MaterialIcons name="smart-toy" size={20} color={AppColors.primary} />
            </View>
            <View style={styles.recText}>
              <Text style={styles.recTitle}>Ask Praxia AI</Text>
              <Text style={styles.recSubtitle}>Ask any health question or get personalised guidance.</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={AppColors.textLight} />
          </TouchableOpacity>
        </View>

        {/* ── Quick Stats ───────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={{ height: 12 }} />
          <View style={styles.statsRow}>
            {[
              { label: 'Health Score', value: '78', unit: '/100', color: AppColors.accent },
              { label: 'Sleep',        value: '82', unit: '/100', color: AppColors.teal },
              { label: 'Activity',     value: '72', unit: '%',    color: AppColors.primary },
            ].map((s, i) => (
              <View key={i} style={[styles.statCell, i > 0 && styles.statCellBorder]}>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statUnit}>{s.unit}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

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
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  backBtn: { marginRight: 12 },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: AppColors.text,
    textAlign: 'center',
    marginRight: 34,
  },

  // AI Banner
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: AppRadius.lg,
    marginBottom: 14,
  },
  aiBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(124,58,237,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  aiBannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#4C1D95',
    lineHeight: 20,
  },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: AppRadius.lg,
    padding: 16,
    marginBottom: 14,
    ...AppShadow.md,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: AppColors.text },
  sectionAction: { fontSize: 13, fontWeight: '600', color: AppColors.primary },

  divider: { height: 1, backgroundColor: AppColors.border, marginVertical: 2 },

  // Insight rows
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  insightText: { flex: 1 },
  insightTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 2,
  },
  insightSubtitle: {
    fontSize: 12,
    color: AppColors.textMuted,
    lineHeight: 16,
  },

  // Recommendation rows
  recRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
  },
  recIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  recText: { flex: 1 },
  recTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 2,
  },
  recSubtitle: {
    fontSize: 12,
    color: AppColors.textMuted,
    lineHeight: 16,
  },
  impactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: AppRadius.full,
    maxWidth: 90,
    alignItems: 'center',
  },
  impactTxt: {
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statCellBorder: {
    borderLeftWidth: 1,
    borderLeftColor: AppColors.border,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 30,
  },
  statUnit: {
    fontSize: 12,
    color: AppColors.textMuted,
    fontWeight: '500',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: AppColors.textMuted,
    fontWeight: '600',
  },
});
