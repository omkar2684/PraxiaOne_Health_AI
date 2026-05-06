import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';

export default function OutcomeSignalScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color={AppColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Outcome Signal</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.successCard}>
          <View style={styles.checkCircle}>
            <MaterialIcons name="check" size={28} color="#059669" />
          </View>
          <View style={styles.successTextContainer}>
            <Text style={styles.successTitle}>You're on track!</Text>
            <Text style={styles.successSub}>Your actions are driving positive changes.</Text>
          </View>
        </View>

        <Text style={styles.title}>Improvement So Far</Text>
        <Text style={styles.subtitle}>(Compared to last week)</Text>

        <View style={styles.signalsContainer}>
          <SignalRow label="Activity" value="+22%" color="#059669" />
          <View style={styles.divider} />
          <SignalRow label="Sleep" value="+15%" color="#059669" />
          <View style={styles.divider} />
          <SignalRow label="Sugar Intake" value="-18%" color="#2563EB" />
        </View>

        <View style={{ flex: 1, minHeight: 40 }} />

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Great job! Consistency is key.</Text>
        </View>

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('ReTestTrigger')}
        >
          <Text style={styles.primaryButtonText}>Keep It Up!</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const SignalRow = ({ label, value, color }) => (
  <View style={styles.signalRow}>
    <Text style={styles.signalLabel}>{label}</Text>
    <Text style={[styles.signalValue, { color }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 15, backgroundColor: '#FFF' },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: AppColors.text },
  scrollContent: { padding: 20, flexGrow: 1 },
  successCard: { flexDirection: 'row', backgroundColor: '#ECFDF5', padding: 16, borderRadius: 16, borderColor: '#A7F3D0', borderWidth: 1, alignItems: 'center', marginBottom: 32 },
  checkCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },
  successTextContainer: { flex: 1, marginLeft: 16 },
  successTitle: { fontSize: 16, fontWeight: 'bold', color: '#065F46', marginBottom: 4 },
  successSub: { fontSize: 13, color: '#065F46' },
  title: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#64748B', marginBottom: 24 },
  signalsContainer: { marginBottom: 24 },
  signalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  signalLabel: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  signalValue: { fontSize: 16, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#E2E8F0' },
  infoBox: { backgroundColor: '#F1F5F9', padding: 16, borderRadius: 12, marginBottom: 24 },
  infoText: { fontSize: 14, fontWeight: 'bold', color: '#475569', textAlign: 'center' },
  primaryButton: { backgroundColor: '#1E3A8A', borderRadius: 14, height: 54, justifyContent: 'center', alignItems: 'center' },
  primaryButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
