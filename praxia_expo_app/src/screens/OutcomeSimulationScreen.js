import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';

export default function OutcomeSimulationScreen({ route, navigation }) {
  const { projection } = route.params || {};
  const biomarkers = projection?.biomarkers || [];

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
        <Text style={styles.subtitle}>Projected Improvement by Next Test (in ~18 days)</Text>

        <View style={styles.cardsContainer}>
          {biomarkers.map((b, idx) => {
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
          })}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            {projection?.subtext || 'Projections are personalized estimates based on your current data, plan and adherence.'}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('OutcomeSignal')}
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
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 8, marginBottom: 24 },
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
});
