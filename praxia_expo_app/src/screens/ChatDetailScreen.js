import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, Modal, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';
import AppSidebarWrapper from '../components/AppSidebarWrapper';

export default function ChatDetailScreen({ navigation }) {
  const sidebarRef = useRef(null);
  const [input, setInput] = useState('');
  const [previousUploads, setPreviousUploads] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  React.useEffect(() => {
    loadPreviousUploads();
  }, []);

  const loadPreviousUploads = async () => {
    try {
      const saved = await AsyncStorage.getItem('previous_uploads');
      if (saved) setPreviousUploads(JSON.parse(saved));
    } catch (e) {}
  };

  const handlePreviousSelect = (file) => {
    setShowDropdown(false);
    setSelectedFile(file);
  };

  return (
    <AppSidebarWrapper ref={sidebarRef} navigation={navigation}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <MaterialIcons name="arrow-back" size={24} color="#1D3B5A" />
          </TouchableOpacity>
          <View style={styles.logoCont}>
            <MaterialIcons name="spa" size={24} color={AppColors.primary} />
            <Text style={styles.logoText}>PraxiaOne</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIcon}><MaterialIcons name="videocam" size={24} color="#1D3B5A" /></TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}><MaterialIcons name="call" size={24} color="#1D3B5A" /></TouchableOpacity>
          </View>
        </View>

        <View style={styles.doctorInfoStrip}>
          <Image source={require('../../assets/public/ai_assistant/woman_background_img.png')} style={styles.docImg} />
          <View style={styles.docTextCont}>
            <Text style={styles.docName}>Dr. James Smith</Text>
            <Text style={styles.docStatus}>Online</Text>
          </View>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.messageBubble}>
              <Text style={styles.messageText}>confirmed)</Text>
              
              <Text style={styles.bulletPoint}>
                <Text style={{fontWeight: 'bold'}}>• Key Finding:</Text> No fracture or infection on X-rays; pain likely musculoskeletal but with thrombosis risk
              </Text>

              <Text style={styles.sectionTitle}>Treatment Plan / Advice</Text>
              
              <Text style={styles.bulletPoint}>
                <Text style={{fontWeight: 'bold'}}>• Treatment Approach:</Text>
              </Text>
              <View style={styles.subBulletList}>
                <Text style={styles.subBullet}>• Ayurvedic treatment (anti-inflammatory, pain relief, physiotherapy)</Text>
                <Text style={styles.subBullet}>• Muscle strain/spinal subluxation treatment</Text>
                <Text style={styles.subBullet}>• Ecosporin tablets to prevent blood clotting (due to thrombosis risk)</Text>
              </View>

              <Text style={styles.bulletPoint}>
                <Text style={{fontWeight: 'bold'}}>• Insurer's Stance:</Text> Claim denied due to lack of fracture evidence; insurer considered condition minor
              </Text>

              <Text style={styles.bulletPoint}>
                <Text style={{fontWeight: 'bold'}}>• Recommendation:</Text>
              </Text>
              <View style={styles.subBulletList}>
                <Text style={styles.subBullet}>• Confirm diagnosis with imaging (MRI)</Text>
                <Text style={styles.subBullet}>• Follow Ayurvedic guidelines and prescribed medication</Text>
              </View>

              <Text style={styles.sectionTitle}>30-Day Diet, Workout, and Medication Plan</Text>
              <Text style={styles.bulletPoint}>
                <Text style={{fontWeight: 'bold'}}>• Diet Plan (Vata-Pacifying & Light):</Text>
              </Text>
              <View style={styles.subBulletList}>
                <Text style={styles.subBullet}>• Focus on anti-inflammatory, warm...</Text>
              </View>
            </View>
          </ScrollView>

          {selectedFile && (
            <View style={styles.attachmentStrip}>
              <MaterialIcons name="picture-as-pdf" size={20} color={AppColors.primary} />
              <Text style={styles.attachmentText} numberOfLines={1}>Attached: {selectedFile.name}</Text>
              <TouchableOpacity onPress={() => setSelectedFile(null)}>
                <MaterialIcons name="close" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}

          {previousUploads.length > 0 && !selectedFile && (
            <TouchableOpacity 
              style={styles.dropdownToggle}
              onPress={() => setShowDropdown(true)}
            >
              <MaterialIcons name="history" size={18} color="#64748B" />
              <Text style={styles.dropdownToggleText}>Use previous PDF</Text>
            </TouchableOpacity>
          )}

          <View style={styles.inputArea}>
            <TouchableOpacity style={styles.attachBtn}>
              <MaterialIcons name="add-circle-outline" size={28} color={AppColors.primary} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={input}
              onChangeText={setInput}
            />
            <TouchableOpacity style={styles.sendBtn}>
              <MaterialIcons name="send" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Previous Uploads</Text>
              <TouchableOpacity onPress={() => setShowDropdown(false)}>
                <MaterialIcons name="close" size={24} color="#1D3B5A" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={previousUploads}
              keyExtractor={(item) => item.uri}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.dropdownItem}
                  onPress={() => handlePreviousSelect(item)}
                >
                  <MaterialIcons name="picture-as-pdf" size={24} color="#EF4444" />
                  <Text style={styles.dropdownItemText} numberOfLines={1}>{item.name}</Text>
                  <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </AppSidebarWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 15, backgroundColor: 'white' },
  headerBtn: { padding: 5 },
  logoCont: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 20, fontWeight: 'bold', color: '#1D3B5A', marginLeft: 8 },
  headerActions: { flexDirection: 'row' },
  headerIcon: { padding: 5, marginLeft: 10 },
  doctorInfoStrip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  docImg: { width: 40, height: 40, borderRadius: 20, marginRight: 15 },
  docTextCont: { flex: 1 },
  docName: { fontSize: 16, fontWeight: 'bold', color: '#1D3B5A' },
  docStatus: { fontSize: 12, color: AppColors.primary, fontWeight: '600' },
  scroll: { padding: 15 },
  messageBubble: { backgroundColor: 'white', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, alignSelf: 'flex-start', width: '95%' },
  messageText: { color: '#334155', fontSize: 15, lineHeight: 22, marginBottom: 15 },
  bulletPoint: { color: '#334155', fontSize: 15, lineHeight: 22, marginBottom: 10 },
  subBulletList: { paddingLeft: 20, marginBottom: 15 },
  subBullet: { color: '#334155', fontSize: 15, lineHeight: 22, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E3A8A', marginVertical: 10 },
  inputArea: { flexDirection: 'row', alignItems: 'center', padding: 10, paddingHorizontal: 15, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  attachBtn: { marginRight: 10 },
  input: { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  sendBtn: { backgroundColor: AppColors.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  attachmentStrip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E2F8EE', paddingHorizontal: 15, paddingVertical: 10, marginHorizontal: 15, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  attachmentText: { flex: 1, fontSize: 13, color: '#065F46', marginLeft: 10, fontWeight: 'bold' },
  dropdownToggle: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center', marginHorizontal: 15, marginBottom: 10, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#E2E8F0' },
  dropdownToggleText: { color: '#475569', fontSize: 12, marginLeft: 6, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1D3B5A' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  dropdownItemText: { flex: 1, fontSize: 14, color: '#1D3B5A', marginLeft: 12, fontWeight: '500' }
});
