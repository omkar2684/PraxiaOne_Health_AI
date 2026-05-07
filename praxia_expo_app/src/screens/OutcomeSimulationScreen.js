import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';

export default function OutcomeSimulationScreen({ route, navigation }) {
  const { projections, causality_analysis } = route.params || {};
  const [timeframe, setTimeframe] = useState('two_weeks');

  const currentProjection = projections ? projections[timeframe] : null;
  const biomarkers = currentProjection?.biomarkers || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color={AppColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Outcome Simulation</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>If you stay on track</Text>
        
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleBtn, timeframe === 'two_weeks' && styles.toggleBtnActive]}
            onPress={() => setTimeframe('two_weeks')}
          >
            <Text style={[styles.toggleText, timeframe === 'two_weeks' && styles.toggleTextActive]}>2 Weeks</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, timeframe === 'one_month' && styles.toggleBtnActive]}
            onPress={() => setTimeframe('one_month')}
          >
            <Text style={[styles.toggleText, timeframe === 'one_month' && styles.toggleTextActive]}>1 Month</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>Projected Improvement</Text>

        <View style={styles.cardsContainer}>
          {biomarkers.length > 0 ? (
            biomarkers.map((b, idx) => {
              const isUp = b.trend === 'up';
              const color = isUp ? '#059669' : '#2563EB';

              return (
                <View key={idx} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <MaterialIcons name={isUp ? 'arrow-upward' : 'arrow-downward'} size={20} color={color} />
                      <Text style={styles.biomarkerName}>{b.name}</Text>
                    </View>
                    <Text style={[styles.improvement, { color }]}>{b.improvement}</Text>
                  </View>
                  <Text style={styles.fromTo}>({b.from_to})</Text>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { backgroundColor: color, width: '70%' }]} />
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="insights" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>Analyzing your latest progress...</Text>
              <Text style={styles.emptySub}>Check back in a moment as we calculate your personalized projections.</Text>
            </View>
          )}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            {currentProjection?.text || 'Projections are personalized estimates based on your current data, plan and adherence.'}
          </Text>
        </View>

        {causality_analysis && causality_analysis.length > 0 && (
          <View style={styles.causalitySection}>
            <Text style={styles.causalityTitle}>Impact Per Activity</Text>
            {causality_analysis.map((item, index) => (
              <View key={index} style={styles.causalityCard}>
                <View style={styles.causalityRank}>
                  <Text style={styles.causalityRankText}>#{item.rank || index + 1}</Text>
                </View>
                <View style={styles.causalityContent}>
                  <Text style={styles.causalityAction}>{item.action_name}</Text>
                  <Text style={styles.causalityBenefit}>{item.benefit}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('OutcomeSignal', { signals: route.params?.signals })}
        >
          <Text style={styles.primaryButtonText}>Next: Outcome Signal</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 15, backgroundColor: '#FFF' },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: AppColors.text },
  scrollContent: { padding: 20 },
  title: { fontSize: 24, fontWeight: '900', color: '#1E293B' },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 20, padding: 4, marginVertical: 16 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 16 },
  toggleBtnActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  toggleTextActive: { color: '#1E3A8A' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 8, marginBottom: 16 },
  cardsContainer: { marginBottom: 24 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  biomarkerName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginLeft: 8 },
  improvement: { fontSize: 16, fontWeight: 'bold' },
  fromTo: { fontSize: 12, color: '#64748B', marginBottom: 12, marginLeft: 28 },
  progressBarBg: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  infoBox: { backgroundColor: '#F1F5F9', padding: 16, borderRadius: 12, marginBottom: 24 },
  infoText: { fontSize: 12, color: '#475569', textAlign: 'center', lineHeight: 18 },
  primaryButton: { backgroundColor: '#1E3A8A', borderRadius: 14, height: 54, justifyContent: 'center', alignItems: 'center' },
  primaryButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: '#FFF', borderRadius: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: '#CBD5E1' },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#64748B', marginTop: 16, textAlign: 'center' },
  emptySub: { fontSize: 12, color: '#94A3B8', marginTop: 8, textAlign: 'center', lineHeight: 18 },
  causalitySection: { marginBottom: 24 },
  causalityTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 16 },
  causalityCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  causalityRank: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  causalityRankText: { color: '#2563EB', fontWeight: 'bold', fontSize: 16 },
  causalityContent: { flex: 1 },
  causalityAction: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  causalityBenefit: { fontSize: 13, color: '#64748B', lineHeight: 18 },
});
