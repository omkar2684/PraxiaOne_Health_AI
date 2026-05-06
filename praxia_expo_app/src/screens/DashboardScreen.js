import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';
import { ApiService } from '../services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppSidebarWrapper from '../components/AppSidebarWrapper';

export default function DashboardScreen({ navigation }) {
  const [vitals, setVitals] = useState({ glucose: '--', steps: '--', sleep_hours: '--' });
  const [healthScore, setHealthScore] = useState(0);
  const [activeGoals, setActiveGoals] = useState([]);
  const [allPlans, setAllPlans] = useState([]);
  const [previewActions, setPreviewActions] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [currentTab, setCurrentTab] = useState('dashboard');
  const sidebarRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const v = await ApiService.getVitals();
      const hs = await ApiService.getHealthScore();
      const recs = await ApiService.getRecommendations();
      
      setVitals(v);
      setHealthScore(hs.score || 0);

      const now = new Date();
      let hours = now.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; 
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setLastUpdated(`Today at ${hours}:${minutes} ${ampm}`);
      
      let active = [];
      let mappedAll = [];
      if (recs && recs.length > 0) {
        setPreviewActions(recs.slice(0, 2));
        for (let r of recs) {
          const isActive = await AsyncStorage.getItem(`plan_active_${r.id}`);
          const isPlanActive = isActive === 'true';
          if (isPlanActive) {
            active.push(r);
          }
          mappedAll.push({
            id: r.id?.toString() || Math.random().toString(),
            title: r.title,
            description: r.description || r.subtitle,
            icon: r.icon,
            isActive: isPlanActive
          });
        }
      }
      setActiveGoals(active);
      setAllPlans(mappedAll);
    };
    fetchData();
  }, [currentTab]);

  return (
    <AppSidebarWrapper ref={sidebarRef} navigation={navigation}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.topNav}>
            <TouchableOpacity onPress={() => sidebarRef.current?.toggleDrawer()} style={{paddingBottom: 15}}>
              <MaterialIcons name="menu" size={30} color={AppColors.accent} />
            </TouchableOpacity>
          </View>
          <View style={styles.header}>
            <Text style={styles.greeting}>Hello, Ravi</Text>
            <Text style={styles.subGreeting}>Your health summary</Text>
          </View>

          {currentTab === 'dashboard' && (
            <>
              <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15, marginTop: -5}}>
                <MaterialIcons name="sync" size={14} color="#94A3B8" />
                <Text style={{color: '#64748B', fontSize: 13, marginLeft: 4}}>Last updated: {lastUpdated}</Text>
              </View>
              <View style={styles.scoreCard}>
                <View style={styles.circleCont}>
                  <View style={styles.scoreCircle}>
                    <Text style={styles.scoreNumber}>{healthScore}</Text>
                    <Text style={styles.scoreMax}>/ 100 ⓘ</Text>
                  </View>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Excellent</Text>
                </View>
              </View>

              <View style={styles.infoBanner}>
                <MaterialIcons name="auto-awesome" size={20} color={AppColors.primary} />
                <Text style={styles.infoText}>You're doing excellent! Maintain your consistent sleep for optimal recovery.</Text>
              </View>

              <Text style={styles.sectionTitle}>Key Factors</Text>
              
              <View style={styles.factorsCard}>
                <View style={styles.factorRow}>
                  <View style={[styles.factorIcon, {borderColor: '#F59E0B'}]} />
                  <Text style={styles.factorLabel}>Glucose</Text>
                  <View style={{flex: 1}} />
                  <Text style={styles.factorValue}>{vitals.glucose} mg/dL</Text>
                  <View style={[styles.statusDot, {backgroundColor: '#F59E0B'}]} />
                  <MaterialIcons name="chevron-right" size={20} color="#CBD5E1" />
                </View>
                <View style={styles.divider} />
                <View style={styles.factorRow}>
                  <MaterialIcons name="directions-run" size={20} color={AppColors.primary} />
                  <Text style={[styles.factorLabel, {marginLeft: 10}]}>Activity</Text>
                  <View style={{flex: 1}} />
                  <Text style={styles.factorValue}>{vitals.steps} / 100</Text>
                  <MaterialIcons name="arrow-upward" size={16} color={AppColors.primary} style={{marginLeft: 8}} />
                  <MaterialIcons name="chevron-right" size={20} color="#CBD5E1" />
                </View>
                <View style={styles.divider} />
                <View style={styles.factorRow}>
                  <MaterialIcons name="bedtime" size={20} color="#3B82F6" />
                  <Text style={[styles.factorLabel, {marginLeft: 10}]}>Sleep</Text>
                  <View style={{flex: 1}} />
                  <Text style={styles.factorValue}>{vitals.sleep_hours}</Text>
                  <MaterialIcons name="check-circle" size={16} color={AppColors.primary} style={{marginLeft: 8}} />
                  <MaterialIcons name="chevron-right" size={20} color="#CBD5E1" />
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.labResultsEntry}
                onPress={() => navigation.navigate('LabResults')}
              >
                <View style={styles.labIconBox}>
                  <MaterialIcons name="science" size={24} color="#2563EB" />
                </View>
                <View style={styles.labTexts}>
                  <Text style={styles.labTitle}>Lab Results</Text>
                  <Text style={styles.labSub}>View your latest blood panel</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="gray" />
              </TouchableOpacity>
            </>
          )}

          {currentTab === 'care' && (
            <View style={{ marginBottom: 80 }}>
              <View style={{ alignItems: 'center', marginBottom: 30 }}>
                <MaterialIcons name="favorite" size={60} color="#EF4444" />
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 10, color: '#1D3B5A' }}>Care Plan</Text>
                <Text style={{ color: 'gray', marginTop: 5 }}>Your personalized clinical roadmap</Text>
              </View>

              <View style={styles.careBox}>
                <Text style={styles.careBoxTitle}>Action Required</Text>
                <Text style={styles.careBoxDesc}>Your glucose trend is slightly elevated compared to last month. Consider a consultation with Dr. Smith.</Text>
                <TouchableOpacity style={styles.primaryBtn}>
                  <Text style={styles.primaryBtnText}>Message My Provider</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.careBox}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                  <Text style={styles.careBoxTitle}>Action Plans</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('ActionPlan', { insightsData: { action_plan: allPlans } })}>
                    <Text style={{ color: AppColors.primary, fontWeight: 'bold' }}>Manage</Text>
                  </TouchableOpacity>
                </View>
                {previewActions.length === 0 && <Text style={{ color: 'gray' }}>No actions available.</Text>}
                {previewActions.map((action, i) => (
                  <TouchableOpacity key={i} style={styles.previewCard} onPress={() => navigation.navigate('Recommendation')}>
                    <View style={styles.previewIconBox}>
                      <MaterialIcons name={action.icon === 'sleep' ? 'bedtime' : action.icon === 'food' ? 'restaurant' : 'directions-run'} size={24} color={AppColors.primary} />
                    </View>
                    <View style={styles.previewText}>
                      <Text style={styles.previewTitle}>{action.title}</Text>
                      <Text style={styles.previewDesc} numberOfLines={2}>{action.description || action.subtitle}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.careBox}>
                <Text style={styles.careBoxTitle}>Active Goals</Text>
                {activeGoals.length === 0 ? (
                  <Text style={{ color: 'gray', marginTop: 10 }}>No active goals currently. Head to Recommendations to start a journey.</Text>
                ) : (
                  activeGoals.map((goal, i) => (
                    <View key={i} style={styles.activeGoalRow}>
                      <View style={styles.goalNumber}><Text style={{color: 'white', fontWeight: 'bold'}}>{i + 1}</Text></View>
                      <View style={{ flex: 1, marginLeft: 15 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#1D3B5A' }}>{goal.title}</Text>
                        <Text style={{ color: 'gray', fontSize: 13, marginTop: 4 }}>{goal.impact_text || 'In Progress'}</Text>
                      </View>
                      <MaterialIcons name="check-circle" size={24} color="#10B981" />
                    </View>
                  ))
                )}
              </View>
            </View>
          )}

        </ScrollView>

        {/* Bottom Tab Bar */}
        <View style={styles.bottomTab}>
          <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentTab('dashboard')}>
            <MaterialIcons name="home" size={24} color={currentTab === 'dashboard' ? AppColors.primary : '#94A3B8'} />
            <Text style={[styles.tabText, {color: currentTab === 'dashboard' ? AppColors.primary : '#94A3B8'}]}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <MaterialIcons name="bar-chart" size={24} color="#94A3B8" />
            <Text style={styles.tabText}>Trends</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentTab('care')}>
            <MaterialIcons name="calendar-today" size={24} color={currentTab === 'care' ? AppColors.primary : '#94A3B8'} />
            <Text style={[styles.tabText, {color: currentTab === 'care' ? AppColors.primary : '#94A3B8'}]}>Care</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </AppSidebarWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 20 },
  topNav: { flexDirection: 'row', alignItems: 'center' },
  header: { marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#1D3B5A' },
  subGreeting: { fontSize: 14, color: 'gray' },
  scoreCard: { backgroundColor: 'white', padding: 30, borderRadius: 20, alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 },
  circleCont: { width: 180, height: 180, borderRadius: 90, borderWidth: 15, borderColor: AppColors.primary, borderBottomColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  scoreNumber: { fontSize: 60, fontWeight: '900', color: '#1D3B5A' },
  scoreMax: { fontSize: 16, color: 'gray' },
  badge: { backgroundColor: AppColors.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  badgeText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  infoBanner: { flexDirection: 'row', backgroundColor: '#ECFDF5', padding: 15, borderRadius: 12, marginBottom: 25 },
  infoText: { flex: 1, color: '#065F46', fontSize: 13, marginLeft: 10, fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1D3B5A', marginBottom: 15 },
  factorsCard: { backgroundColor: 'white', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5, marginBottom: 80 },
  factorRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  factorIcon: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, marginLeft: 2 },
  factorLabel: { fontSize: 15, fontWeight: 'bold', color: '#1D3B5A', marginLeft: 15 },
  factorValue: { fontSize: 15, fontWeight: 'bold', color: '#1D3B5A' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 10 },
  bottomTab: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 10, fontWeight: 'bold', marginTop: 4, color: '#94A3B8' },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 16 },
  labResultsEntry: { flexDirection: 'row', backgroundColor: 'white', padding: 16, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.03, elevation: 2, marginBottom: 80, borderWidth: 1, borderColor: '#F1F5F9' },
  labIconBox: { backgroundColor: '#EFF6FF', padding: 10, borderRadius: 12, marginRight: 15 },
  labTexts: { flex: 1 },
  labTitle: { fontWeight: 'bold', fontSize: 16, color: '#1E293B', marginBottom: 2 },
  labSub: { color: 'gray', fontSize: 13 },
  careBox: { backgroundColor: 'white', padding: 20, borderRadius: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.05, elevation: 4 },
  careBoxTitle: { fontSize: 18, fontWeight: 'bold', color: '#1D3B5A' },
  careBoxDesc: { fontSize: 14, color: '#333', lineHeight: 20, marginTop: 10, marginBottom: 20 },
  primaryBtn: { backgroundColor: AppColors.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  primaryBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  activeGoalRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  goalNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: AppColors.primary, justifyContent: 'center', alignItems: 'center' },
  previewCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.04, elevation: 2 },
  previewIconBox: { backgroundColor: '#EFF6FF', padding: 12, borderRadius: 12, marginRight: 16 },
  previewText: { flex: 1 },
  previewTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  previewDesc: { fontSize: 13, color: '#64748B' }
});
