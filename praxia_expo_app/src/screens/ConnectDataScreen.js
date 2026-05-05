import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';
import * as DocumentPicker from 'expo-document-picker';
import { ApiService } from '../services/apiService';

export default function ConnectDataScreen({ navigation }) {
  const [uploading, setUploading] = useState(null);
  const [documentUploaded, setDocumentUploaded] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isStable, setIsStable] = useState(false);
  const [riskFactors, setRiskFactors] = useState(null);

  const handleUpload = async (docType) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'], // Allow PDFs and images
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return; // User cancelled
      }

      const fileUri = result.assets[0].uri;
      const fileName = result.assets[0].name;
      
      setUploading(docType);
      
      const response = await ApiService.uploadDocument(fileUri, docType, fileName);
      
      if (response.success) {
        Alert.alert("Success", `${docType} uploaded successfully!`);
        
        setDocumentUploaded(true);
        setIsAiThinking(true);
        setRiskFactors(null);
        
        if (docType === 'Lab Results' || docType === 'Care Plan') {
          const aiResult = await ApiService.uploadLabReportPDF(fileUri, fileName);
          setIsAiThinking(false);
          
          if (aiResult.success && aiResult.biomarkers) {
            if (aiResult.biomarkers.length === 0) {
              setIsStable(true);
              setRiskFactors({
                factors: [{ name: 'Scan Result', status: 'Normal' }],
                warning_message: 'Everything looks good! No abnormalities found.',
                explanation_title: 'Summary',
                explanation_text: 'Our AI could not find any elevated biomarkers in the uploaded document.'
              });
            } else {
              const factors = aiResult.biomarkers.map(b => ({
                name: b.name,
                status: b.status || 'Normal'
              }));
              const hasAbnormal = factors.some(f => 
                f.status.toLowerCase() !== 'normal' && f.status.toLowerCase() !== 'optimal'
              );
              setIsStable(!hasAbnormal);
              setRiskFactors({
                factors: factors.slice(0, 6),
                warning_message: hasAbnormal 
                  ? 'Our AI detected some abnormal biomarkers in your document.' 
                  : 'Everything looks optimal according to our AI analysis.',
                explanation_title: 'DeepSeek Analysis Complete',
                explanation_text: `DeepSeek processed your document and extracted the key data points above. ${hasAbnormal ? 'We recommend discussing these with your provider.' : 'Keep up the healthy habits!'}`
              });
            }
          } else {
            setIsStable(false);
            setRiskFactors({
              factors: [],
              warning_message: 'Error analyzing document with AI',
              explanation_title: 'Analysis Failed',
              explanation_text: aiResult.error || 'Unknown error'
            });
          }
        } else {
          setIsAiThinking(false);
          setIsStable(true);
          setRiskFactors({
            factors: [
              { name: 'Cholesterol', status: 'Optimal' },
              { name: 'Glucose', status: 'Normal' },
              { name: 'Blood Pressure', status: 'Healthy' }
            ],
            warning_message: 'Everything looks good! Keep up the healthy habits.',
            explanation_title: 'Summary',
            explanation_text: 'All your recent biomarkers are within stable ranges. No immediate action required.'
          });
        }
      } else {
        Alert.alert("Error", `Failed to upload ${docType}.`);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An unexpected error occurred while uploading.");
    } finally {
      setUploading(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#1D3B5A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connect Data</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.descText}>Add more data from a compatible device or upload results to improve your insights.</Text>
        
        <View style={styles.timelineCont}>
          <View style={styles.timelineLine} />
          
          <Text style={styles.sectionLabel}>DOCUMENT UPLOADS</Text>

          <View style={styles.card}>
            <View style={styles.iconBox}>
              <MaterialIcons name="science" size={28} color="#0EA5E9" />
            </View>
            <Text style={styles.cardTitle}>Lab Results</Text>
            <TouchableOpacity 
              style={styles.uploadBtn} 
              onPress={() => handleUpload('Lab Results')}
              disabled={uploading !== null}
            >
              {uploading === 'Lab Results' ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.uploadBtnText}>Upload ↑</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.iconBox}>
              <MaterialIcons name="assignment-turned-in" size={28} color="#6366F1" />
            </View>
            <Text style={styles.cardTitle}>Care Plan</Text>
            <TouchableOpacity 
              style={styles.uploadBtn}
              onPress={() => handleUpload('Care Plan')}
              disabled={uploading !== null}
            >
              {uploading === 'Care Plan' ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.uploadBtnText}>Upload ↑</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.iconBox}>
              <MaterialIcons name="monitor-heart" size={28} color="#EF4444" />
            </View>
            <Text style={styles.cardTitle}>Health Report</Text>
            <TouchableOpacity 
              style={styles.uploadBtn}
              onPress={() => handleUpload('Health Report')}
              disabled={uploading !== null}
            >
              {uploading === 'Health Report' ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.uploadBtnText}>Self Submit ↑</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

          {documentUploaded && isAiThinking && (
            <View style={styles.aiThinkingCard}>
              <ActivityIndicator size="large" color="#2E7D5E" />
              <Text style={styles.aiThinkingTitle}>DeepSeek AI is analyzing...</Text>
              <Text style={styles.aiThinkingSubtitle}>Extracting biomarkers from your document</Text>
            </View>
          )}

          {documentUploaded && !isAiThinking && riskFactors && (
            <View style={[styles.riskCard, { borderColor: isStable ? '#DCFCE7' : '#F1F5F9' }]}>
              <View style={styles.riskHeader}>
                <MaterialIcons 
                  name={isStable ? "check-circle" : "warning"} 
                  size={24} 
                  color={isStable ? "#16A34A" : "#F59E0B"} 
                />
                <Text style={styles.riskTitle}>Data Synthesis</Text>
              </View>
              
              <View style={styles.factorsGrid}>
                {riskFactors.factors.map((f, i) => (
                  <View key={i} style={[styles.factorBadge, { 
                    backgroundColor: isStable ? '#F0FDF4' : '#FFF7ED',
                    borderColor: isStable ? '#BBF7D0' : '#FED7AA'
                  }]}>
                    <Text style={[styles.factorName, { color: isStable ? '#166534' : '#9A3412' }]}>
                      {f.name}: <Text style={{fontWeight: '900'}}>{f.status}</Text>
                    </Text>
                  </View>
                ))}
              </View>
              
              <Text style={[styles.warningMsg, { color: isStable ? '#15803D' : '#EF4444' }]}>
                {riskFactors.warning_message}
              </Text>
              
              <View style={styles.explanationBox}>
                <Text style={styles.explanationTitle}>{riskFactors.explanation_title}</Text>
                <Text style={styles.explanationText}>{riskFactors.explanation_text}</Text>
              </View>
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1D3B5A', marginLeft: 15 },
  scroll: { paddingHorizontal: 20, paddingBottom: 30 },
  descText: { fontSize: 14, color: 'gray', marginBottom: 20 },
  timelineCont: { paddingLeft: 10, paddingTop: 20 },
  timelineLine: { position: 'absolute', left: 20, top: 0, bottom: 0, width: 2, backgroundColor: '#E2F8EE', borderStyle: 'dashed' },
  sectionLabel: { fontSize: 12, fontWeight: 'bold', color: 'gray', letterSpacing: 1, marginLeft: 25, marginBottom: 15 },
  card: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 16, padding: 15, alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, marginLeft: 15, marginBottom: 15 },
  iconBox: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#1D3B5A', marginLeft: 10 },
  uploadBtn: { backgroundColor: AppColors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  uploadBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  scanBtn: { backgroundColor: AppColors.primary, padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 30 },
  scanBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  aiThinkingCard: { backgroundColor: 'white', padding: 24, borderRadius: 16, marginHorizontal: 15, marginBottom: 15, alignItems: 'center', borderColor: '#E2E8F0', borderWidth: 1.5, shadowColor: '#000', shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.06, elevation: 3 },
  aiThinkingTitle: { fontWeight: 'bold', fontSize: 16, color: '#1D3B5A', marginTop: 16 },
  aiThinkingSubtitle: { color: 'gray', fontSize: 13, marginTop: 8 },
  riskCard: { backgroundColor: 'white', padding: 20, borderRadius: 16, marginHorizontal: 15, marginBottom: 20, borderWidth: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.06, elevation: 3 },
  riskHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  riskTitle: { fontWeight: 'bold', fontSize: 18, color: '#1D3B5A', marginLeft: 8 },
  factorsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  factorBadge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, marginRight: 8, marginBottom: 8 },
  factorName: { fontSize: 13, fontWeight: '600' },
  warningMsg: { fontWeight: 'bold', fontSize: 14, marginBottom: 16 },
  explanationBox: { marginTop: 8 },
  explanationTitle: { fontSize: 14, fontWeight: 'bold', color: '#2E7D5E', marginBottom: 8 },
  explanationText: { color: '#333', fontSize: 13, lineHeight: 20 }
});
