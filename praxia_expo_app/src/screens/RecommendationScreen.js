import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';
import AppSidebarWrapper from '../components/AppSidebarWrapper';
import { ApiService } from '../services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function RecommendationScreen({ navigation }) {
  const sidebarRef = useRef(null);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePlans, setActivePlans] = useState({});
  const [startingPlan, setStartingPlan] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await ApiService.getRecommendations();
    if (data) {
      setRecs(data);
      const active = {};
      for (let r of data) {
        const val = await AsyncStorage.getItem(`plan_active_${r.id}`);
        if (val === 'true') active[r.id] = true;
      }
      setActivePlans(active);
    }
    setLoading(false);
  };

  const startPlan = async (id) => {
    setStartingPlan(id);
    await AsyncStorage.setItem(`plan_active_${id}`, 'true');
    setActivePlans(prev => ({ ...prev, [id]: true }));
    setStartingPlan(null);
  };

  if (loading) {
    return (
      <AppSidebarWrapper ref={sidebarRef} navigation={navigation}>
        <SafeAreaView style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
          <ActivityIndicator size="large" color={AppColors.primary} />
        </SafeAreaView>
      </AppSidebarWrapper>
    );
  }

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

        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
          }}
        >
          {recs.map((rec) => {
            const isActive = activePlans[rec.id] || false;
            const isStarting = startingPlan === rec.id;
            
            return (
              <View key={rec.id} style={{ width }}>
                <ScrollView contentContainerStyle={styles.scroll}>
                  <View style={styles.iconCircle}>
                    <MaterialIcons 
                      name={rec.icon === 'sleep' ? 'bedtime' : rec.icon === 'food' ? 'restaurant' : 'directions-walk'} 
                      size={40} 
                      color={AppColors.primary} 
                    />
                    {isActive && (
                      <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#10B981', borderRadius: 15, padding: 2, borderWidth: 2, borderColor: 'white' }}>
                        <MaterialIcons name="check" size={16} color="white" />
                      </View>
                    )}
                  </View>
                  
                  <Text style={styles.title}>{rec.title}</Text>
                  <Text style={styles.subtitle}>{rec.subtitle}</Text>

                  <View style={styles.impactCard}>
                    <View style={styles.impactHeader}>
                      <Text style={styles.impactHeaderText}>Expected Impact</Text>
                    </View>
                    <View style={styles.impactRow}>
                      <Text style={styles.impactValue}>{rec.impact_text || 'Improves general wellness'}</Text>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={[styles.startBtn, isActive && {backgroundColor: '#047857'}]} 
                    onPress={() => isActive ? navigation.navigate('Dashboard') : startPlan(rec.id)}
                    disabled={isStarting}
                  >
                    {isStarting ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.startBtnText}>{isActive ? '✓ Currently Active' : 'Start My Journey'}</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.exploreBtn} onPress={() => navigation.navigate('JourneyFlow')}>
                    <Text style={styles.exploreBtnText}>Explore Other Actions</Text>
                  </TouchableOpacity>
                  
                  <Text style={{color: '#EF4444', fontWeight: 'bold', marginBottom: 15}}>Re-test recommended in 60 days</Text>
                  
                  <TouchableOpacity 
                    style={styles.outlineBtn}
                    onPress={() => navigation.navigate('LabResults')}
                  >
                    <MaterialIcons name="upload-file" size={20} color={AppColors.primary} />
                    <Text style={styles.outlineBtnText}>Upload Updated Lab Results</Text>
                  </TouchableOpacity>

                  <View style={styles.insightCard}>
                    <Text style={styles.insightTitle}>Health Insight</Text>
                    <Text style={styles.insightDesc}>
                      {rec.description}
                    </Text>
                  </View>
                </ScrollView>
              </View>
            );
          })}
        </ScrollView>
        
        {/* Pagination Dots */}
        <View style={styles.paginationCont}>
          {recs.map((_, i) => (
            <View key={i} style={[styles.dot, currentIndex === i && styles.dotActive]} />
          ))}
        </View>
        
      </SafeAreaView>
    </AppSidebarWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'white' },
  logoCont: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 20, fontWeight: 'bold', color: '#1D3B5A', marginLeft: 8 },
  scroll: { padding: 20, alignItems: 'center', paddingBottom: 60 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', borderWidth: 8, borderColor: '#F8FAFC', shadowColor: '#10B981', shadowOffset: {width:0, height:0}, shadowOpacity: 0.2, shadowRadius: 15, marginTop: 20, marginBottom: 30 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1D3B5A', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#94A3B8', textAlign: 'center', paddingHorizontal: 20, marginBottom: 40, lineHeight: 24 },
  impactCard: { backgroundColor: 'white', width: '100%', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5, marginBottom: 30, borderWidth: 1, borderColor: '#F1F5F9' },
  impactHeader: { backgroundColor: '#F8FAFC', paddingVertical: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  impactHeaderText: { fontSize: 12, fontWeight: 'bold', color: '#94A3B8' },
  impactRow: { paddingVertical: 20, alignItems: 'center' },
  impactValue: { fontSize: 20, fontWeight: 'bold', color: AppColors.primary, textAlign: 'center' },
  startBtn: { backgroundColor: AppColors.primary, width: '100%', paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginBottom: 20, shadowColor: AppColors.primary, shadowOffset: {width:0, height:4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  startBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  exploreBtn: { marginBottom: 30 },
  exploreBtnText: { color: '#94A3B8', fontSize: 15, fontWeight: 'bold', textDecorationLine: 'underline' },
  outlineBtn: { flexDirection: 'row', width: '100%', borderColor: AppColors.primary, borderWidth: 2, paddingVertical: 16, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  outlineBtnText: { color: AppColors.primary, fontWeight: 'bold', marginLeft: 10 },
  insightCard: { backgroundColor: '#ECFDF5', width: '100%', padding: 20, borderRadius: 16 },
  insightTitle: { fontSize: 16, fontWeight: 'bold', color: '#065F46', marginBottom: 10 },
  insightDesc: { fontSize: 14, color: '#059669', lineHeight: 22 },
  paginationCont: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, backgroundColor: '#F8FAFC' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#CBD5E1', marginHorizontal: 4 },
  dotActive: { width: 24, backgroundColor: AppColors.primary }
});
