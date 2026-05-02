import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';
import { ApiService } from '../services/apiService';
import AppSidebarWrapper from '../components/AppSidebarWrapper';

export default function DashboardScreen({ navigation }) {
  const [vitals, setVitals] = useState({ glucose: '--', steps: '--', sleep_hours: '--' });
  const [healthScore, setHealthScore] = useState(0);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const v = await ApiService.getVitals();
      const hs = await ApiService.getHealthScore();
      setVitals(v);
      setHealthScore(hs.score || 0);
    };
    fetchData();
  }, []);

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
        </ScrollView>

        {/* Bottom Tab Bar */}
        <View style={styles.bottomTab}>
          <TouchableOpacity style={styles.tabItem}>
            <MaterialIcons name="home" size={24} color={AppColors.primary} />
            <Text style={[styles.tabText, {color: AppColors.primary}]}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <MaterialIcons name="bar-chart" size={24} color="#94A3B8" />
            <Text style={styles.tabText}>Trends</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <MaterialIcons name="calendar-today" size={24} color="#94A3B8" />
            <Text style={styles.tabText}>Care</Text>
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
  tabText: { fontSize: 10, fontWeight: 'bold', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 16 }
});
