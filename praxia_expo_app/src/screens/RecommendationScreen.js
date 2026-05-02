import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';
import AppSidebarWrapper from '../components/AppSidebarWrapper';

export default function RecommendationScreen({ navigation }) {
  const sidebarRef = useRef(null);

  return (
    <AppSidebarWrapper ref={sidebarRef} navigation={navigation}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => sidebarRef.current?.toggleDrawer()}>
            <MaterialIcons name="menu" size={28} color="#1D3B5A" />
          </TouchableOpacity>
          <View style={styles.logoCont}>
            <MaterialIcons name="spa" size={24} color={AppColors.primary} />
            <Text style={styles.logoText}>PraxiaOne</Text>
          </View>
          <View style={{width: 28}} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="directions-walk" size={40} color={AppColors.primary} />
          </View>
          
          <Text style={styles.title}>Walk 30 Minutes Daily</Text>
          <Text style={styles.subtitle}>Highest impact to improve score and reduce glucose risk</Text>

          <View style={styles.impactCard}>
            <View style={styles.impactHeader}>
              <Text style={styles.impactHeaderText}>Impact in 8 weeks</Text>
            </View>
            <View style={styles.impactRow}>
              <View style={styles.impactCol}>
                <Text style={[styles.impactValue, {color: AppColors.primary}]}><MaterialIcons name="arrow-upward" size={18} /> +8 pts</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.impactCol}>
                <Text style={[styles.impactValue, {color: AppColors.primary}]}>-20% <Text style={styles.impactLabel}>Glucose</Text></Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.startBtn} onPress={() => navigation.navigate('Escalation')}>
            <Text style={styles.startBtnText}>Start My Journey</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.exploreBtn}>
            <Text style={styles.exploreBtnText}>Explore Other Actions</Text>
          </TouchableOpacity>

          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Health Insight</Text>
            <Text style={styles.insightDesc}>
              Walking after meals helps regulate blood sugar levels and improves cardiovascular health.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppSidebarWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'white' },
  logoCont: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 20, fontWeight: 'bold', color: '#1D3B5A', marginLeft: 8 },
  scroll: { padding: 20, alignItems: 'center' },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', borderWidth: 8, borderColor: '#F8FAFC', shadowColor: '#10B981', shadowOffset: {width:0, height:0}, shadowOpacity: 0.2, shadowRadius: 15, marginTop: 20, marginBottom: 30 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1D3B5A', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#94A3B8', textAlign: 'center', paddingHorizontal: 20, marginBottom: 40, lineHeight: 24 },
  impactCard: { backgroundColor: 'white', width: '100%', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5, marginBottom: 30 },
  impactHeader: { backgroundColor: '#F8FAFC', paddingVertical: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  impactHeaderText: { fontSize: 12, fontWeight: 'bold', color: '#94A3B8' },
  impactRow: { flexDirection: 'row', paddingVertical: 20 },
  impactCol: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  divider: { width: 1, backgroundColor: '#F1F5F9' },
  impactValue: { fontSize: 22, fontWeight: 'bold' },
  impactLabel: { fontSize: 14, color: '#94A3B8', fontWeight: 'bold' },
  startBtn: { backgroundColor: AppColors.primary, width: '100%', paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginBottom: 20, shadowColor: AppColors.primary, shadowOffset: {width:0, height:4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  startBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  exploreBtn: { marginBottom: 40 },
  exploreBtnText: { color: '#94A3B8', fontSize: 15, fontWeight: 'bold', textDecorationLine: 'underline' },
  insightCard: { backgroundColor: '#ECFDF5', width: '100%', padding: 20, borderRadius: 16 },
  insightTitle: { fontSize: 16, fontWeight: 'bold', color: '#065F46', marginBottom: 10 },
  insightDesc: { fontSize: 14, color: '#059669', lineHeight: 22 }
});
