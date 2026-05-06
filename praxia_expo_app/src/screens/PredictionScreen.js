import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';
import AppSidebarWrapper from '../components/AppSidebarWrapper';

export default function PredictionScreen({ navigation }) {
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
          <View style={styles.card}>
            <Text style={styles.cardSubtitle}>If nothing changes</Text>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Score ➔</Text>
              <Text style={styles.scoreValue}>72</Text>
            </View>

            {/* Mock Chart Area */}
            <View style={styles.chartArea}>
              <View style={styles.chartLine} />
            </View>
            <View style={styles.chartLabels}>
              <Text style={styles.chartLabelText}>Today</Text>
              <Text style={styles.chartLabelText}>8 wks</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>What if you...</Text>

          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Recommendation')}>
            <View style={styles.actionIconBox}>
              <MaterialIcons name="directions-walk" size={20} color="#1D3B5A" />
            </View>
            <Text style={styles.actionText}>Walk 30 min/day</Text>
            <Text style={styles.actionArrow}>➔</Text>
            <Text style={styles.actionScoreLabel}>Score </Text>
            <Text style={styles.actionScoreValue}>82</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIconBox}>
              <MaterialIcons name="bedtime" size={20} color="#1D3B5A" />
            </View>
            <Text style={styles.actionText}>Improve Sleep</Text>
            <Text style={styles.actionArrow}>➔</Text>
            <Text style={styles.actionScoreLabel}>Score </Text>
            <Text style={styles.actionScoreValue}>85</Text>
          </TouchableOpacity>

          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <MaterialIcons name="bedtime" size={24} color={AppColors.primary} />
              <Text style={styles.detailTitle}>Sleep Optimization</Text>
              <View style={{flex: 1}} />
              <View style={styles.detailBadge}>
                <Text style={styles.detailBadgeText}>Bedtime Routine</Text>
              </View>
            </View>
            <Text style={styles.detailDesc}>
              Try to go to bed and wake up at the same time each day for better endocrine recovery.
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
  scroll: { padding: 20 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 25, shadowColor: '#000', shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5, marginBottom: 30 },
  cardSubtitle: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 10 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  scoreLabel: { fontSize: 22, fontWeight: '600', color: '#1D3B5A', marginRight: 10 },
  scoreValue: { fontSize: 40, fontWeight: 'bold', color: '#EF4444', borderBottomWidth: 3, borderBottomColor: '#EF4444' },
  chartArea: { height: 120, justifyContent: 'center', marginBottom: 10 },
  chartLine: { width: '100%', height: 2, backgroundColor: '#EF4444', transform: [{rotate: '-15deg'}] }, // extremely basic mock line
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  chartLabelText: { fontSize: 12, color: '#94A3B8', fontWeight: 'bold' },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#1D3B5A', marginBottom: 20 },
  actionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 18, borderRadius: 16, marginBottom: 15, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  actionIconBox: { width: 36, height: 36, backgroundColor: '#F1F5F9', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  actionText: { flex: 1, fontSize: 15, fontWeight: 'bold', color: '#1D3B5A' },
  actionArrow: { color: '#94A3B8', marginRight: 10 },
  actionScoreLabel: { color: '#94A3B8', fontSize: 14 },
  actionScoreValue: { color: AppColors.primary, fontSize: 18, fontWeight: 'bold' },
  detailCard: { backgroundColor: 'white', padding: 20, borderRadius: 20, marginTop: 10, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  detailTitle: { fontSize: 16, fontWeight: 'bold', color: '#1D3B5A', marginLeft: 10 },
  detailBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  detailBadgeText: { color: AppColors.primary, fontSize: 11, fontWeight: 'bold' },
  detailDesc: { color: 'gray', fontSize: 14, lineHeight: 22 }
});
