import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';
import AppSidebarWrapper from '../components/AppSidebarWrapper';
import { ApiService } from '../services/apiService';

export default function AiInsightsScreen({ route, navigation }) {
  const sidebarRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const passedBiomarkers = route?.params?.biomarkers || [];

  useEffect(() => {
    const fetchData = async () => {
      const result = await ApiService.getAiInsights(passedBiomarkers);
      if (result) {
        // Sort top findings: High/Low first, Normal last
        if (result.top_findings) {
          result.top_findings.sort((a, b) => {
            const isAbnormalA = a.status === 'High' || a.status === 'Low' || a.status === 'Elevated' || a.status === 'Irregular';
            const isAbnormalB = b.status === 'High' || b.status === 'Low' || b.status === 'Elevated' || b.status === 'Irregular';
            return (isAbnormalB ? 1 : 0) - (isAbnormalA ? 1 : 0);
          });
        }
        setData(result);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <AppSidebarWrapper ref={sidebarRef} navigation={navigation}>
        <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#2563EB" />
        </SafeAreaView>
      </AppSidebarWrapper>
    );
  }

  const getStatusColor = (status) => {
    if (status === 'Elevated' || status === 'High') return '#EF4444';
    if (status === 'Irregular' || status === 'Low') return '#F59E0B';
    return '#10B981';
  };
  const getStatusBg = (status) => {
    if (status === 'Elevated' || status === 'High') return '#FEE2E2';
    if (status === 'Irregular' || status === 'Low') return '#FEF3C7';
    return '#ECFDF5';
  };

  return (
    <AppSidebarWrapper ref={sidebarRef} navigation={navigation}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#1D3B5A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Insights</Text>
          <View style={{width: 24}} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.sectionTitle}>Top Findings</Text>

          {data.top_findings?.map((factor, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={styles.card} 
              onPress={() => navigation.navigate('WhatItMeans', { 
                factorName: factor.name,
                insightsData: data
              })}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.circle, { backgroundColor: getStatusBg(factor.status) }]}>
                  <Text style={[styles.circleNum, { color: getStatusColor(factor.status) }]}>{idx + 1}</Text>
                </View>
                <Text style={styles.cardTitle}>{factor.name}</Text>
                <View style={{flex: 1}} />
                <Text style={[styles.statusBadge, { color: getStatusColor(factor.status), backgroundColor: getStatusBg(factor.status) }]}>{factor.status}</Text>
              </View>
              <Text style={styles.cardDesc}>{factor.finding}</Text>
            </TouchableOpacity>
          ))}

          <Text style={[styles.sectionTitle, {marginTop: 10}]}>All Biomarkers Info</Text>
          {passedBiomarkers.map((b, idx) => (
            <View key={`b-${idx}`} style={styles.infoRow}>
               <Text style={styles.infoName}>{b.name}</Text>
               <Text style={styles.infoVal}>{b.value} <Text style={{color: getStatusColor(b.status), fontWeight: 'bold'}}>{b.status}</Text></Text>
            </View>
          ))}

          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('WhatItMeans', { 
            factorName: data.top_findings?.[0]?.name,
            insightsData: data
          })}>
            <Text style={styles.btnText}>See What This Means</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </AppSidebarWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'white' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1D3B5A' },
  scroll: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1D3B5A', marginBottom: 20 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  circle: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  circleNum: { fontWeight: 'bold', fontSize: 14 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1D3B5A' },
  statusBadge: { fontSize: 12, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' },
  cardDesc: { color: '#64748B', fontSize: 14, lineHeight: 20, marginLeft: 38 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  infoName: { fontSize: 14, color: '#475569' },
  infoVal: { fontSize: 14, color: '#1E293B' },
  btn: { backgroundColor: '#2563EB', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
