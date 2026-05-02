import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';
import AppSidebarWrapper from '../components/AppSidebarWrapper';

export default function SettingsScreen({ navigation }) {
  const sidebarRef = useRef(null);

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const ListItem = ({ icon, title, subtitle, rightElement, isLast }) => (
    <View style={styles.listItemWrapper}>
      <TouchableOpacity style={[styles.listItem, !isLast && styles.borderBottom]}>
        <View style={styles.iconBox}>
          <MaterialIcons name={icon.name} size={24} color={icon.color || '#64748B'} />
        </View>
        <View style={styles.listTextCont}>
          <Text style={styles.listTitle}>{title}</Text>
          {subtitle && <Text style={styles.listSubtitle}>{subtitle}</Text>}
        </View>
        {rightElement || <MaterialIcons name="chevron-right" size={24} color="#94A3B8" />}
      </TouchableOpacity>
    </View>
  );

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
          
          <SectionHeader title="ACCOUNT" />
          <View style={styles.cardGroup}>
            <ListItem 
              icon={{name: 'person'}} 
              title="Profile & Personal Information" 
            />
            <ListItem 
              icon={{name: 'manage-accounts'}} 
              title="Account Management" 
              rightElement={<MaterialIcons name="expand-more" size={24} color="#94A3B8" />}
              isLast 
            />
          </View>

          <SectionHeader title="HEALTH RECORDS" />
          <View style={styles.cardGroup}>
            <ListItem 
              icon={{name: 'medical-services', color: '#EF4444'}} 
              title="Medical Information" 
              subtitle="Conditions, Allergies, Medications"
              isLast 
            />
          </View>

          <SectionHeader title="FINANCIAL & LIMITS" />
          <View style={styles.cardGroup}>
            <ListItem 
              icon={{name: 'credit-card'}} 
              title="Payment & Insurance" 
            />
            <View style={styles.budgetCard}>
              <Text style={styles.budgetTitle}>AI Budget Limit</Text>
              <View style={styles.budgetRow}>
                <Text style={styles.budgetUsed}>$0.0000 used</Text>
                <Text style={styles.budgetTotal}>$10.00 total</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={styles.progressBarFill} />
              </View>
            </View>
          </View>

          <SectionHeader title="DATA & USAGE" />
          <View style={styles.cardGroup}>
            <ListItem 
              icon={{name: 'bar-chart'}} 
              title="Reports & Data Management" 
            />
            <View style={styles.emptyUsage}>
              <Text style={styles.emptyUsageText}>No usage data yet.</Text>
            </View>
          </View>

          <SectionHeader title="PREFERENCES" />
          <View style={styles.cardGroup}>
            <ListItem 
              icon={{name: 'settings'}} 
              title="App Preferences" 
              subtitle="AI Mode: Fast (Med42)"
            />
            <ListItem 
              icon={{name: 'notifications'}} 
              title="Notifications & Reminders" 
              isLast
            />
          </View>

          <SectionHeader title="SECURITY & SUPPORT" />
          <View style={styles.cardGroup}>
            <ListItem 
              icon={{name: 'security'}} 
              title="Privacy & Security" 
              subtitle="Lock sensitive data"
              rightElement={<Switch value={true} trackColor={{false: '#E2E8F0', true: '#8B5CF6'}} />}
            />
            <ListItem 
              icon={{name: 'help-outline'}} 
              title="Help & Support" 
              isLast
            />
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
  sectionHeader: { fontSize: 11, fontWeight: 'bold', color: '#94A3B8', letterSpacing: 1.2, marginTop: 15, marginBottom: 8, marginLeft: 5 },
  cardGroup: { backgroundColor: 'white', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, marginBottom: 15, borderWidth: 1, borderColor: '#F1F5F9' },
  listItemWrapper: { paddingHorizontal: 15 },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  iconBox: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  listTextCont: { flex: 1, justifyContent: 'center' },
  listTitle: { fontSize: 16, color: '#1D3B5A', fontWeight: '500' },
  listSubtitle: { fontSize: 13, color: '#64748B', marginTop: 4 },
  budgetCard: { padding: 20, backgroundColor: 'white' },
  budgetTitle: { fontSize: 15, fontWeight: 'bold', color: '#1D3B5A', marginBottom: 10 },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  budgetUsed: { color: '#3B82F6', fontWeight: 'bold', fontSize: 14 },
  budgetTotal: { color: '#94A3B8', fontSize: 14 },
  progressBarBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, width: '100%' },
  progressBarFill: { height: 6, backgroundColor: '#3B82F6', borderRadius: 3, width: '0%' }, // 0% used
  emptyUsage: { paddingVertical: 20, alignItems: 'center', backgroundColor: '#FAFAF9', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  emptyUsageText: { color: '#94A3B8', fontSize: 14 }
});
