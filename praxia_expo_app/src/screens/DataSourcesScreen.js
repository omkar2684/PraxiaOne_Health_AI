import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';
import AppSidebarWrapper from '../components/AppSidebarWrapper';

export default function DataSourcesScreen({ navigation }) {
  const sidebarRef = useRef(null);

  return (
    <AppSidebarWrapper ref={sidebarRef} navigation={navigation}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => sidebarRef.current?.toggleDrawer()}>
            <MaterialIcons name="menu" size={28} color="#1D3B5A" />
          </TouchableOpacity>
          <Image source={require('../../assets/public/welcome_screen/PraxiaOne_logo.png')} style={styles.logo} resizeMode="contain" />
          <View style={{width: 28}} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Data Sources</Text>
            
            <View style={styles.listItem}>
              <View style={[styles.iconBox, {backgroundColor: '#10B981'}]}>
                <MaterialIcons name="local-hospital" size={28} color="white" />
              </View>
              <View style={styles.itemTextCont}>
                <Text style={styles.itemTitle}>Amazon One Medical</Text>
                <Text style={styles.itemStatus}><MaterialIcons name="check-circle" size={12} color={AppColors.primary} /> Connected</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
            </View>

            <View style={styles.divider} />

            <View style={styles.listItem}>
              <View style={[styles.iconBox, {backgroundColor: '#F43F5E'}]}>
                <MaterialIcons name="favorite" size={28} color="white" />
              </View>
              <View style={styles.itemTextCont}>
                <Text style={styles.itemTitle}>Apple Health / Google Fit</Text>
                <Text style={styles.itemStatus}><MaterialIcons name="check-circle" size={12} color={AppColors.primary} /> Connected</Text>
              </View>
              <TouchableOpacity style={styles.syncBtn}>
                <Text style={styles.syncBtnText}>Sync</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.listItem}>
              <View style={[styles.iconBox, {backgroundColor: '#0EA5E9'}]}>
                <MaterialIcons name="watch" size={28} color="white" />
              </View>
              <View style={styles.itemTextCont}>
                <Text style={styles.itemTitle}>Fitbit</Text>
                <Text style={styles.itemStatus}><MaterialIcons name="check-circle" size={12} color={AppColors.primary} /> Connected</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
            </View>

            <View style={styles.divider} />

            <View style={styles.listItem}>
              <View style={[styles.iconBox, {backgroundColor: '#6366F1'}]}>
                <MaterialIcons name="devices" size={28} color="white" />
              </View>
              <View style={styles.itemTextCont}>
                <Text style={styles.itemTitle}>5G Device</Text>
                <Text style={styles.itemStatus}><MaterialIcons name="check-circle" size={12} color={AppColors.primary} /> Connected</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
            </View>
          </View>

          <TouchableOpacity style={styles.connectBtn} onPress={() => navigation.navigate('ConnectData')}>
            <MaterialIcons name="add" size={20} color="#1D3B5A" />
            <Text style={styles.connectBtnText}>Connect More</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.continueBtn} onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </AppSidebarWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'white' },
  logo: { width: 140, height: 40 },
  scroll: { padding: 20 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1D3B5A', marginBottom: 20 },
  listItem: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  itemTextCont: { flex: 1, marginLeft: 15 },
  itemTitle: { fontSize: 15, fontWeight: 'bold', color: '#1D3B5A', marginBottom: 4 },
  itemStatus: { fontSize: 13, color: AppColors.primary, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 15 },
  syncBtn: { backgroundColor: AppColors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  syncBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  connectBtn: { flexDirection: 'row', backgroundColor: 'white', padding: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  connectBtnText: { color: '#1D3B5A', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  continueBtn: { backgroundColor: AppColors.primary, padding: 18, borderRadius: 16, alignItems: 'center' },
  continueBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
