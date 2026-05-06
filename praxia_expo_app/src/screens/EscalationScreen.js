import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';
import AppSidebarWrapper from '../components/AppSidebarWrapper';

export default function EscalationScreen({ navigation }) {
  const sidebarRef = useRef(null);
  const [selectedProvider, setSelectedProvider] = useState('smith');

  const providers = [
    { id: 'smith', name: 'Dr. James Smith', spec: 'Internal Medicine', img: require('../../assets/public/ai_assistant/woman_background_img.png') }, // using placeholder since real image unavailable
    { id: 'chen', name: 'Dr. Sarah Chen', spec: 'Endocrinology', img: require('../../assets/public/ai_assistant/woman_background_img.png') },
    { id: 'michael', name: 'Dr. Michael', spec: 'Cardiology', img: require('../../assets/public/ai_assistant/woman_background_img.png') },
  ];

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
          <View style={styles.iconCircle}>
            <MaterialIcons name="medical-services" size={40} color={AppColors.primary} />
          </View>
          
          <Text style={styles.title}>Time to Connect</Text>
          <Text style={styles.subtitle}>Choose a provider below to review your latest health trends and vitals.</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.providerScroll}>
            {providers.map(p => {
              const isSelected = selectedProvider === p.id;
              return (
                <TouchableOpacity 
                  key={p.id} 
                  style={[styles.providerCard, isSelected && styles.providerCardSelected]}
                  onPress={() => setSelectedProvider(p.id)}
                >
                  <Image source={p.img} style={styles.providerImg} />
                  <Text style={styles.providerName} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.providerSpec} numberOfLines={1}>{p.spec}</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>

          <TouchableOpacity style={styles.btnPrimary}>
            <Text style={styles.btnPrimaryText}>Book Visit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('MessagePortal')}>
            <Text style={styles.btnSecondaryText}>Message Specialist</Text>
          </TouchableOpacity>

          <View style={styles.selectedInfo}>
            <Text style={styles.selectedInfoTitle}>Selected: {providers.find(p=>p.id===selectedProvider)?.name}</Text>
            <Text style={styles.selectedInfoDesc}>Typically responds within 2 hours</Text>
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
  scroll: { padding: 20, alignItems: 'center' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1D3B5A', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', paddingHorizontal: 20, marginBottom: 30, lineHeight: 20 },
  providerScroll: { paddingVertical: 10, paddingLeft: 10, paddingRight: 20, marginBottom: 30 },
  providerCard: { width: 140, backgroundColor: 'white', borderRadius: 20, padding: 20, alignItems: 'center', marginRight: 15, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, borderWidth: 2, borderColor: 'transparent' },
  providerCardSelected: { borderColor: AppColors.primary, shadowOpacity: 0.1 },
  providerImg: { width: 60, height: 60, borderRadius: 30, marginBottom: 15 },
  providerName: { fontSize: 14, fontWeight: 'bold', color: '#1D3B5A', marginBottom: 5, textAlign: 'center' },
  providerSpec: { fontSize: 12, color: '#94A3B8', textAlign: 'center' },
  btnPrimary: { backgroundColor: AppColors.primary, width: '100%', paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginBottom: 15, shadowColor: AppColors.primary, shadowOffset: {width:0, height:4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  btnPrimaryText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  btnSecondary: { backgroundColor: 'white', width: '100%', paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginBottom: 30, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  btnSecondaryText: { color: '#1D3B5A', fontSize: 16, fontWeight: 'bold' },
  selectedInfo: { alignItems: 'center' },
  selectedInfoTitle: { color: AppColors.primary, fontWeight: 'bold', fontSize: 14, marginBottom: 5 },
  selectedInfoDesc: { color: '#94A3B8', fontSize: 12, fontStyle: 'italic' }
});
