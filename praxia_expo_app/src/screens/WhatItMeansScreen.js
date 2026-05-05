import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';
import AppSidebarWrapper from '../components/AppSidebarWrapper';

export default function WhatItMeansScreen({ route, navigation }) {
  const sidebarRef = useRef(null);
  const { factorName = 'Blood Sugar (Glucose)', insightsData } = route.params || {};

  // Find the layman terms from insightsData
  let explanation = 'High levels can lead to fatigue, weight gain, and long-term metabolic disease.';
  let goodNews = 'Small daily changes can significantly improve your numbers.';
  
  if (insightsData && insightsData.what_it_means) {
    const item = insightsData.what_it_means.find(w => w.biomarker.toLowerCase().includes(factorName.toLowerCase()) || factorName.toLowerCase().includes(w.biomarker.toLowerCase()));
    if (item) {
      explanation = item.explanation;
      if (item.good_news) goodNews = item.good_news;
    }
  }

  return (
    <AppSidebarWrapper ref={sidebarRef} navigation={navigation}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#1D3B5A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>What It Means</Text>
          <View style={{width: 24}} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.cardHeader}>
            <View style={[styles.circle, { backgroundColor: '#FEE2E2' }]}>
              <Text style={[styles.circleNum, { color: '#EF4444' }]}>!</Text>
            </View>
            <Text style={styles.cardTitle}>{factorName}</Text>
          </View>
          
          <Text style={styles.mainDesc}>
            {explanation}
          </Text>

          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>Why it matters (Layman's terms)</Text>
            <Text style={styles.sectionDesc}>
              {explanation}
            </Text>
          </View>

          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>Good news</Text>
            <Text style={styles.sectionDesc}>
              {goodNews}
            </Text>
          </View>

          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('ActionPlan', { insightsData })}>
            <Text style={styles.btnText}>Next: Action Plan</Text>
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  circle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  circleNum: { fontWeight: 'bold', fontSize: 16 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#1D3B5A' },
  mainDesc: { fontSize: 16, color: '#334155', lineHeight: 24, marginBottom: 30 },
  sectionBox: { marginBottom: 25 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1D3B5A', marginBottom: 8 },
  sectionDesc: { fontSize: 15, color: '#64748B', lineHeight: 22 },
  btn: { backgroundColor: '#2563EB', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
