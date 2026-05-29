import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors, AppShadow, AppRadius } from '../constants/theme';
import BottomTabBar from '../components/BottomTabBar';
import AppSidebarWrapper from '../components/AppSidebarWrapper';

// ── Mock Data ─────────────────────────────────────────────────────────────────

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeekDates() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - dayOfWeek + i);
    return {
      label: WEEK_DAYS[i],
      date: d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
      dateObj: d,
    };
  });
}

const MOCK_DATA = {
  activity: {
    steps: 7245,
    stepsGoal: 10000,
    calories: 482,
    caloriesGoal: 600,
  },
  vitals: {
    hrv: { value: '68', unit: 'ms', change: '+13%', up: true },
    rhr: { value: '56', unit: 'bpm', change: '+4%', up: true },
    bp: { value: '118/76', unit: 'mmHg', change: 'Normal', up: null },
    spo2: { value: '97%', unit: '', change: 'Normal', up: null },
  },
  sleep: {
    score: 82,
    duration: '7h 15m',
    timeInBed: '7h 48m',
  },
  mood: {
    mood: 'Good',
    energy: 7,
    energyMax: 10,
  },
  adherence: {
    medications: { done: 3, total: 3 },
    supplements: { done: 4, total: 4 },
    lifestyle: { done: 5, total: 6 },
  },
};

// ── Sub-Components ────────────────────────────────────────────────────────────

function SectionCard({ title, action, onActionPress, children }) {
  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {action && (
          <TouchableOpacity onPress={onActionPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.sectionAction}>{action}</Text>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );
}

function ProgressBar({ value, max, color = AppColors.primary, height = 6 }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <View style={[styles.progressBg, { height }]}>
      <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color, height }]} />
    </View>
  );
}

function AdherenceCircle({ done, total }) {
  const pct = Math.round((done / total) * 100);
  const complete = done === total;
  const color = complete ? AppColors.accent : AppColors.warning;

  return (
    <View style={[styles.adherenceCircle, { borderColor: color }]}>
      <MaterialIcons
        name={complete ? 'check-circle' : 'warning-amber'}
        size={16}
        color={color}
      />
      <Text style={[styles.adherencePct, { color }]}>{pct}%</Text>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function DailySnapshotScreen({ navigation }) {
  const sidebarRef = useRef(null);
  const weekDates = getWeekDates();
  const [selectedDate, setSelectedDate] = useState(
    weekDates.findIndex((d) => d.isToday)
  );

  const { activity, vitals, sleep, mood, adherence } = MOCK_DATA;
  const stepsProgress = Math.round((activity.steps / activity.stepsGoal) * 100);
  const calProgress = Math.round((activity.calories / activity.caloriesGoal) * 100);

  return (
    <AppSidebarWrapper ref={sidebarRef} navigation={navigation} activeScreen="DailySnapshot">
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
          <Text style={styles.headerTitle}>Daily Health Snapshot</Text>
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
        {/* ── Week Date Picker ───────────────────────────────────────── */}
        <View style={[styles.card, styles.datePicker]}>
          {/* Month navigation */}
          <View style={styles.monthRow}>
            <TouchableOpacity><MaterialIcons name="chevron-left" size={20} color={AppColors.textMuted} /></TouchableOpacity>
            <Text style={styles.monthLabel}>
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity><MaterialIcons name="chevron-right" size={20} color={AppColors.textMuted} /></TouchableOpacity>
          </View>
          {/* Day pills */}
          <View style={styles.daysRow}>
            {weekDates.map((d, i) => {
              const isSelected = i === selectedDate;
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.dayPill, isSelected && styles.dayPillActive]}
                  onPress={() => setSelectedDate(i)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayLabel, isSelected && styles.dayLabelActive]}>
                    {d.label}
                  </Text>
                  <Text style={[styles.dayNum, isSelected && styles.dayNumActive]}>
                    {d.date}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Activity ──────────────────────────────────────────────── */}
        <SectionCard title="Activity">
          <View style={styles.twoCol}>
            {/* Steps */}
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <MaterialIcons name="directions-walk" size={20} color={AppColors.primary} />
              </View>
              <Text style={styles.activityLabel}>Steps</Text>
              <Text style={styles.activityValue}>
                {activity.steps.toLocaleString()}
              </Text>
              <Text style={styles.activityGoal}>of {activity.stepsGoal.toLocaleString()}</Text>
              <ProgressBar value={activity.steps} max={activity.stepsGoal} color={AppColors.primary} />
            </View>
            {/* Calories */}
            <View style={[styles.activityItem, styles.activityItemRight]}>
              <View style={[styles.activityIcon, { backgroundColor: AppColors.orangeLight }]}>
                <MaterialIcons name="local-fire-department" size={20} color={AppColors.orange} />
              </View>
              <Text style={styles.activityLabel}>Active Calories</Text>
              <Text style={styles.activityValue}>{activity.calories}</Text>
              <Text style={styles.activityGoal}>of {activity.caloriesGoal} kcal</Text>
              <ProgressBar value={activity.calories} max={activity.caloriesGoal} color={AppColors.orange} />
            </View>
          </View>
        </SectionCard>

        {/* ── Vitals ────────────────────────────────────────────────── */}
        <SectionCard
          title="Vitals"
          action="View all ›"
          onActionPress={() => {}}
        >
          <View style={styles.vitalsRow}>
            {[
              { label: 'HRV',           ...vitals.hrv },
              { label: 'Resting HR',    ...vitals.rhr },
              { label: 'Blood Pressure',...vitals.bp },
              { label: 'SpO₂',          ...vitals.spo2 },
            ].map((v, i) => (
              <View key={i} style={styles.vitalCell}>
                <Text style={styles.vitalLabel}>{v.label}</Text>
                <Text style={styles.vitalValue}>{v.value}</Text>
                {v.unit ? <Text style={styles.vitalUnit}>{v.unit}</Text> : null}
                <View style={styles.vitalChange}>
                  {v.up !== null && (
                    <MaterialIcons
                      name={v.up ? 'arrow-upward' : 'arrow-downward'}
                      size={10}
                      color={v.up ? AppColors.accent : AppColors.danger}
                    />
                  )}
                  <Text style={[styles.vitalChangeTxt, {
                    color: v.change === 'Normal' ? AppColors.accent :
                           v.up ? AppColors.accent : AppColors.danger,
                  }]}>
                    {v.change}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </SectionCard>

        {/* ── Sleep ─────────────────────────────────────────────────── */}
        <SectionCard title="Sleep">
          <View style={styles.twoCol}>
            {/* Sleep Score */}
            <View style={styles.sleepItem}>
              <View style={[styles.activityIcon, { backgroundColor: AppColors.tealLight }]}>
                <MaterialIcons name="bedtime" size={20} color={AppColors.teal} />
              </View>
              <Text style={styles.activityLabel}>Sleep Score</Text>
              <Text style={styles.activityValue}>{sleep.score}
                <Text style={styles.activityGoal}> /100</Text>
              </Text>
              <ProgressBar value={sleep.score} max={100} color={AppColors.teal} />
            </View>
            {/* Duration */}
            <View style={[styles.sleepItem, styles.activityItemRight]}>
              <View style={[styles.activityIcon, { backgroundColor: AppColors.primaryLight }]}>
                <MaterialIcons name="schedule" size={20} color={AppColors.primary} />
              </View>
              <Text style={styles.activityLabel}>Sleep Duration</Text>
              <Text style={styles.activityValue}>{sleep.duration}</Text>
              <Text style={styles.activityGoal}>Time in bed: {sleep.timeInBed}</Text>
            </View>
          </View>
        </SectionCard>

        {/* ── Mood & Energy ─────────────────────────────────────────── */}
        <SectionCard title="Mood & Energy">
          <View style={styles.twoCol}>
            {/* Mood */}
            <View style={styles.moodItem}>
              <View style={[styles.moodIcon, { backgroundColor: AppColors.accentLight }]}>
                <MaterialIcons name="sentiment-satisfied-alt" size={22} color={AppColors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.moodLabel}>Mood</Text>
                <Text style={styles.moodValue}>{mood.mood}</Text>
              </View>
            </View>
            {/* Energy */}
            <View style={[styles.moodItem, styles.activityItemRight]}>
              <View style={[styles.moodIcon, { backgroundColor: AppColors.warningLight }]}>
                <MaterialIcons name="bolt" size={22} color={AppColors.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.moodLabel}>Energy</Text>
                <Text style={styles.moodValue}>
                  {mood.energy}
                  <Text style={styles.moodUnit}> /{mood.energyMax}</Text>
                </Text>
              </View>
            </View>
          </View>
        </SectionCard>

        {/* ── Adherence ─────────────────────────────────────────────── */}
        <SectionCard
          title="Adherence"
          action="View all ›"
          onActionPress={() => navigation.navigate('ActionPlan', {})}
        >
          <View style={styles.adherenceRow}>
            {/* Medications */}
            <View style={styles.adherenceItem}>
              <AdherenceCircle done={adherence.medications.done} total={adherence.medications.total} />
              <Text style={styles.adherenceLabel}>Medications</Text>
              <Text style={styles.adherenceCount}>
                {adherence.medications.done}/{adherence.medications.total}
              </Text>
            </View>
            {/* Supplements */}
            <View style={styles.adherenceItem}>
              <AdherenceCircle done={adherence.supplements.done} total={adherence.supplements.total} />
              <Text style={styles.adherenceLabel}>Supplements</Text>
              <Text style={styles.adherenceCount}>
                {adherence.supplements.done}/{adherence.supplements.total}
              </Text>
            </View>
            {/* Lifestyle */}
            <View style={styles.adherenceItem}>
              <AdherenceCircle done={adherence.lifestyle.done} total={adherence.lifestyle.total} />
              <Text style={styles.adherenceLabel}>Lifestyle Tasks</Text>
              <Text style={styles.adherenceCount}>
                {adherence.lifestyle.done}/{adherence.lifestyle.total}
              </Text>
            </View>
          </View>
        </SectionCard>

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
  scrollContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },

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
    marginRight: 34, // balance the back button
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

  // Date Picker
  datePicker: { paddingVertical: 14 },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  monthLabel: { fontSize: 14, fontWeight: '700', color: AppColors.text },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayPill: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
    minWidth: 36,
  },
  dayPillActive: {
    backgroundColor: AppColors.primary,
  },
  dayLabel: { fontSize: 10, fontWeight: '600', color: AppColors.textMuted, marginBottom: 4 },
  dayLabelActive: { color: 'rgba(255,255,255,0.8)' },
  dayNum: { fontSize: 15, fontWeight: '800', color: AppColors.text },
  dayNumActive: { color: '#FFFFFF' },

  // Two column layout
  twoCol: { flexDirection: 'row', gap: 16 },
  activityItemRight: { borderLeftWidth: 1, borderLeftColor: AppColors.border, paddingLeft: 16 },

  // Activity
  activityItem: { flex: 1 },
  activityIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: AppColors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  activityLabel: { fontSize: 11, fontWeight: '600', color: AppColors.textMuted, marginBottom: 3 },
  activityValue: { fontSize: 22, fontWeight: '900', color: AppColors.text, marginBottom: 2 },
  activityGoal: { fontSize: 11, color: AppColors.textMuted, marginBottom: 8 },

  // Sleep
  sleepItem: { flex: 1 },

  // Progress bar
  progressBg: {
    backgroundColor: AppColors.borderMid,
    borderRadius: AppRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: AppRadius.full,
  },

  // Vitals
  vitalsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  vitalCell: { flex: 1, alignItems: 'center' },
  vitalLabel: { fontSize: 10, fontWeight: '600', color: AppColors.textMuted, marginBottom: 4, textAlign: 'center' },
  vitalValue: { fontSize: 15, fontWeight: '900', color: AppColors.text, textAlign: 'center' },
  vitalUnit: { fontSize: 10, color: AppColors.textMuted, textAlign: 'center' },
  vitalChange: { flexDirection: 'row', alignItems: 'center', gap: 1, marginTop: 3 },
  vitalChangeTxt: { fontSize: 10, fontWeight: '700' },

  // Mood
  moodItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  moodIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  moodLabel: { fontSize: 11, color: AppColors.textMuted, fontWeight: '600' },
  moodValue: { fontSize: 18, fontWeight: '900', color: AppColors.text, marginTop: 2 },
  moodUnit: { fontSize: 12, fontWeight: '500', color: AppColors.textMuted },

  // Adherence
  adherenceRow: { flexDirection: 'row', justifyContent: 'space-around' },
  adherenceItem: { alignItems: 'center', gap: 8 },
  adherenceCircle: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 3, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  adherencePct: { fontSize: 11, fontWeight: '800', marginTop: 1 },
  adherenceLabel: { fontSize: 11, color: AppColors.textMuted, fontWeight: '600', textAlign: 'center' },
  adherenceCount: { fontSize: 13, fontWeight: '800', color: AppColors.text },
});
