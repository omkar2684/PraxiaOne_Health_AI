import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { AppColors } from '../constants/theme';
import AppSidebarWrapper from '../components/AppSidebarWrapper';
import { ApiService } from '../services/apiService';

export default function LabResultsScreen({ navigation }) {
  const sidebarRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('May 6, 2024');
  const [results, setResults] = useState([
    { name: 'Glucose', value: '102 mg/dL', status: 'High', color: '#EF4444' },
    { name: 'Hemoglobin A1c', value: '5.8 %', status: 'Normal', color: '#10B981' },
    { name: 'LDL Cholesterol', value: '134 mg/dL', status: 'High', color: '#F59E0B' },
    { name: 'HDL Cholesterol', value: '42 mg/dL', status: 'Normal', color: '#10B981' },
    { name: 'Triglycerides', value: '168 mg/dL', status: 'Normal', color: '#10B981' },
    { name: 'Vitamin D', value: '22 ng/mL', status: 'Low', color: '#F59E0B' },
  ]);

  const handleUpload = async () => {
    try {
      const docRes = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (!docRes.canceled && docRes.assets.length > 0) {
        setLoading(true);
        const fileUri = docRes.assets[0].uri;
        const res = await ApiService.uploadLabReportPDF(fileUri);
        if (res.success && res.biomarkers && res.biomarkers.length > 0) {
          // Map backend response to UI format
          const mapped = res.biomarkers.map(b => ({
            name: b.name,
            value: `${b.value} ${b.unit || ''}`.trim(),
            status: b.status,
            color: b.status === 'High' ? '#EF4444' : b.status === 'Low' ? '#F59E0B' : '#10B981'
          }));
          setResults(mapped);
          
          const now = new Date();
          setLastUpdated(now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
          Alert.alert('Success', 'Lab report parsed successfully!');
        } else {
          Alert.alert('Notice', 'Could not extract valid data. Try a different report.');
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to upload document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppSidebarWrapper ref={sidebarRef} navigation={navigation}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#1D3B5A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lab Results</Text>
          <View style={{width: 24}} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.topInfo}>
            <Text style={styles.dateText}>Last Updated: {lastUpdated}</Text>
            <TouchableOpacity onPress={handleUpload} style={styles.uploadBtn}>
              <MaterialIcons name="upload-file" size={16} color="white" />
              <Text style={styles.uploadBtnText}>Upload PDF</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Key Biomarkers</Text>
          
          {loading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={{ marginTop: 10, color: '#64748B' }}>Extracting data with AI...</Text>
            </View>
          ) : (

          <View style={styles.card}>
            {results.map((item, idx) => (
              <View key={idx} style={[styles.row, idx === results.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={styles.bioName}>{item.name}</Text>
                <View style={styles.valBox}>
                  <Text style={styles.bioVal}>{item.value}</Text>
                  {item.status !== 'Normal' && (
                    <Text style={[styles.bioStatus, { color: item.color }]}>{item.status}</Text>
                  )}
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.viewMoreBtn}>
              <Text style={styles.viewMoreText}>+ {results.length > 5 ? results.length - 5 : 0} more</Text>
            </TouchableOpacity>
          </View>
          )}

          <TouchableOpacity 
            style={[styles.btn, loading && { opacity: 0.5 }]} 
            disabled={loading || results.length === 0}
            onPress={() => navigation.navigate('AiInsights', { biomarkers: results })}
          >
            <Text style={styles.btnText}>View AI Insights</Text>
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
  topInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  dateText: { color: '#64748B', fontSize: 14 },
  providerText: { color: '#2563EB', fontWeight: 'bold', fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1D3B5A', marginBottom: 15 },
  card: { backgroundColor: 'white', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 10, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, marginBottom: 30 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  bioName: { fontSize: 15, color: '#334155' },
  valBox: { flexDirection: 'row', alignItems: 'center' },
  bioVal: { fontSize: 15, fontWeight: 'bold', color: '#1D3B5A', marginRight: 10 },
  bioStatus: { fontSize: 12, fontWeight: 'bold' },
  viewMoreBtn: { paddingVertical: 15, alignItems: 'center' },
  viewMoreText: { color: '#94A3B8', fontWeight: 'bold' },
  btn: { backgroundColor: '#2563EB', padding: 18, borderRadius: 12, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  uploadBtn: { flexDirection: 'row', backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignItems: 'center' },
  uploadBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13, marginLeft: 4 }
});
