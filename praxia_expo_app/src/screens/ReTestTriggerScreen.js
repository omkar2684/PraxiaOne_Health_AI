import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar, Alert } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';
import AppSidebarWrapper from '../components/AppSidebarWrapper';

export default function ReTestTriggerScreen({ navigation }) {
  const sidebarRef = React.useRef(null);
  return (
    <AppSidebarWrapper ref={sidebarRef} navigation={navigation}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => sidebarRef.current?.toggleDrawer()} style={styles.backButton}>
            <MaterialIcons name="menu" size={24} color="#1D3B5A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Re-Test Trigger</Text>
          <View style={{ width: 28 }} />
        </View>

      <View style={styles.content}>
        <View style={styles.centerSection}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="edit-calendar" size={50} color="#2563EB" />
          </View>
          <Text style={styles.preTitle}>Next test recommended</Text>
          <Text style={styles.title}>in 18 days</Text>
          <Text style={styles.date}>June 2, 2024</Text>
        </View>

        <View style={styles.cardsContainer}>
          <InfoCard icon="trending-up" title="Why retest?" subtitle="To measure your progress and adjust your plan" />
          <InfoCard icon="science" title="What we'll check" subtitle="Track key biomarkers to see improvement" />
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => {
            Alert.alert("Success", "Test booked successfully!", [
              { text: "OK", onPress: () => navigation.navigate("Dashboard") }
            ]);
          }}
        >
          <Text style={styles.primaryButtonText}>Book Follow-Up Test</Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    </AppSidebarWrapper>
  );
}

const InfoCard = ({ icon, title, subtitle }) => (
  <View style={styles.card}>
    <MaterialIcons name={icon} size={28} color="#2563EB" />
    <View style={styles.cardTextContainer}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 15, backgroundColor: '#FFF' },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: AppColors.text },
  content: { padding: 20, flex: 1 },
  centerSection: { alignItems: 'center', marginTop: 20, marginBottom: 40 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  preTitle: { fontSize: 16, color: '#475569', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '900', color: '#1E3A8A', marginBottom: 8 },
  date: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  cardsContainer: { marginBottom: 24 },
  card: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, alignItems: 'center' },
  cardTextContainer: { marginLeft: 16, flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#64748B' },
  primaryButton: { backgroundColor: '#1E3A8A', borderRadius: 14, height: 54, justifyContent: 'center', alignItems: 'center' },
  primaryButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
