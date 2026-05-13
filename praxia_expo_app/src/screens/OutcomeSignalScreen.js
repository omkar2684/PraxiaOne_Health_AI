import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';
import * as DocumentPicker from 'expo-document-picker';
import { ApiService } from '../services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppSidebarWrapper from '../components/AppSidebarWrapper';

export default function OutcomeSignalScreen({ route, navigation }) {
  const sidebarRef = React.useRef(null);
  const [uploading, setUploading] = useState(false);
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    loadCache();
  }, []);

  const loadCache = async () => {
    try {
      const cached = await AsyncStorage.getItem('cached_outcome_comparison');
      if (cached) {
        setComparison(JSON.parse(cached));
      }
    } catch (e) {}
  };

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const fileUri = result.assets[0].uri;
      const fileName = result.assets[0].name;
      
      setUploading(true);
      
      // Upload document
      const uploadRes = await ApiService.uploadDocument(fileUri, 'Lab Result', fileName);
      if (uploadRes.success) {
        // Fetch comparison (mocking this endpoint logic in frontend for now since we just need the output, or call an endpoint)
        // We'll call ApiService.compareLabReport
        const compRes = await ApiService.compareLabReport(fileUri, fileName);
        if (compRes.success) {
          setComparison(compRes.data);
          await AsyncStorage.setItem('cached_outcome_comparison', JSON.stringify(compRes.data));
          Alert.alert("Analysis Complete", "We have compared your new results with your previous baseline.");
        } else {
          Alert.alert("Comparison Failed", "Could not analyze the document.");
        }
      } else {
        Alert.alert("Upload Failed", "Could not upload document.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppSidebarWrapper ref={sidebarRef} navigation={navigation}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => sidebarRef.current?.toggleDrawer()} style={styles.backButton}>
            <MaterialIcons name="menu" size={24} color="#1D3B5A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Outcome Signal</Text>
          <View style={{ width: 28 }} />
        </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Track Your Progress</Text>
        <Text style={styles.subtitle}>Upload a follow-up lab report to see how your biomarkers have improved since your last test.</Text>

        <View style={{ flex: 1, minHeight: 20 }} />

        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <MaterialIcons name="upload-file" size={20} color="white" style={{marginRight: 8}} />
              <Text style={styles.uploadButtonText}>Upload Follow-up Lab Report</Text>
            </>
          )}
        </TouchableOpacity>

        {comparison && (
          <View style={styles.comparisonBox}>
            <Text style={styles.comparisonTitle}>Latest Results Comparison</Text>
            {comparison.map((item, idx) => (
              <View key={idx} style={styles.comparisonRow}>
                <Text style={styles.compLabel}>{item.name}{item.normal_range ? `\n(${item.normal_range})` : ''}</Text>
                <View style={styles.compValues}>
                  <Text style={styles.compOld}>{item.old_value}</Text>
                  <MaterialIcons name="arrow-right-alt" size={16} color="#94A3B8" style={{marginHorizontal: 4}} />
                  <Text style={styles.compNew}>{item.new_value}</Text>
                </View>
                <View style={styles.compBadgeRow}>
                  <View style={[styles.compBadge, { backgroundColor: item.improved ? '#ECFDF5' : '#FEF2F2' }]}>
                    <Text style={[styles.compBadgeText, { color: item.improved ? '#059669' : '#DC2626' }]}>
                      {item.delta}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('ReTestTrigger')}
        >
          <Text style={styles.primaryButtonText}>Keep It Up!</Text>
        </TouchableOpacity>
      </ScrollView>
      </SafeAreaView>
    </AppSidebarWrapper>
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
  uploadButton: { flexDirection: 'row', backgroundColor: '#3B82F6', borderRadius: 14, height: 54, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  uploadButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  primaryButton: { backgroundColor: '#1E3A8A', borderRadius: 14, height: 54, justifyContent: 'center', alignItems: 'center', marginTop: 'auto' },
  primaryButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  comparisonBox: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  comparisonTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 16 },
  comparisonRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  compLabel: { fontSize: 13, fontWeight: '600', color: '#334155', width: 120 },
  compValues: { flexDirection: 'row', alignItems: 'center', flex: 1, flexWrap: 'wrap', marginHorizontal: 8 },
  compOld: { fontSize: 12, color: '#94A3B8', textDecorationLine: 'line-through' },
  compNew: { fontSize: 13, fontWeight: 'bold', color: '#1E293B' },
  compBadge: { paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6 },
  compBadgeText: { fontSize: 12, fontWeight: 'bold' },
  compBadgeRow: { flexDirection: 'row', alignItems: 'center' },
  normalRangeBox: { paddingHorizontal: 6, paddingVertical: 2, backgroundColor: '#F1F5F9', borderRadius: 4, marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  normalRangeText: { fontSize: 10, color: '#475569', fontWeight: 'bold' },
});
