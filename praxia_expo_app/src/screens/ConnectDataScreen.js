import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';
import * as DocumentPicker from 'expo-document-picker';
import { ApiService } from '../services/apiService';

export default function ConnectDataScreen({ navigation }) {
  const [uploading, setUploading] = useState(null);

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

        <TouchableOpacity style={styles.scanBtn}>
          <Text style={styles.scanBtnText}>Scan for Devices</Text>
        </TouchableOpacity>
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
  scanBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
