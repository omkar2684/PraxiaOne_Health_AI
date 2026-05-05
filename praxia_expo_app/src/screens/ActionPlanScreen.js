import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Modal, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';
import AppSidebarWrapper from '../components/AppSidebarWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ActionPlanScreen({ route, navigation }) {
  const sidebarRef = useRef(null);
  
  // Read insights data passed from previous screen
  const insightsData = route?.params?.insightsData;
  const initialActions = insightsData?.action_plan?.map((a, i) => ({
    id: a.id?.toString() || i.toString(),
    title: a.title,
    subtitle: a.description,
    icon: a.icon || 'check-circle',
    isActive: a.isActive || false
  })) || [];

  const [actions, setActions] = useState(initialActions);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const colors = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444'];

  const getMaterialIconName = (name) => {
    if (!name) return 'check-circle';
    return name.replace(/_/g, '-');
  };

  const openEditModal = (action = null) => {
    if (action) {
      setEditingId(action.id);
      setEditTitle(action.title);
      setEditDesc(action.subtitle);
    } else {
      setEditingId(null);
      setEditTitle('');
      setEditDesc('');
    }
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!editTitle.trim()) return;
    if (editingId) {
      setActions(actions.map(a => a.id === editingId ? { ...a, title: editTitle, subtitle: editDesc } : a));
    } else {
      setActions([...actions, { id: Date.now().toString(), title: editTitle, subtitle: editDesc, icon: 'star' }]);
    }
    setModalVisible(false);
  };

  const toggleActive = async (action) => {
    const willBeActive = !action.isActive;
    if (willBeActive) {
      await AsyncStorage.setItem(`plan_active_${action.id}`, 'true');
    } else {
      await AsyncStorage.removeItem(`plan_active_${action.id}`);
    }
    setActions(actions.map(a => a.id === action.id ? { ...a, isActive: willBeActive } : a));
  };

  const handleActionOptions = (action) => {
    Alert.alert(
      'Manage Action',
      action.title,
      [
        { text: action.isActive ? 'Deactivate' : 'Activate Plan', onPress: () => toggleActive(action) },
        { text: 'Edit', onPress: () => openEditModal(action) },
        { text: 'Delete', onPress: () => setActions(actions.filter(a => a.id !== action.id)), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' }
      ],
      { cancelable: true }
    );
  };

  return (
    <AppSidebarWrapper ref={sidebarRef} navigation={navigation}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#1D3B5A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Action Plan</Text>
          <View style={{width: 24}} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.sectionTitle}>Your Top Actions</Text>

          {actions.map((action, idx) => {
            const color = colors[idx % colors.length];
            return (
              <View key={action.id} style={styles.card}>
                <TouchableOpacity style={{flex: 1, flexDirection: 'row', alignItems: 'center'}} onPress={() => Alert.alert(action.title, action.subtitle)}>
                  <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
                    <MaterialIcons name={getMaterialIconName(action.icon)} size={24} color={color} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.cardTitle}>{action.title}</Text>
                    <Text style={styles.cardSub} numberOfLines={1}>{action.subtitle}</Text>
                  </View>
                </TouchableOpacity>
                <View style={{alignItems: 'center'}}>
                  <View style={[styles.badge, { backgroundColor: action.isActive ? '#D1FAE5' : '#F1F5F9' }]}>
                    <Text style={[styles.badgeText, { color: action.isActive ? '#059669' : '#64748B' }]}>
                      {action.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleActionOptions(action)} style={{padding: 5, marginTop: 5}}>
                    <MaterialIcons name="more-vert" size={24} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {actions.length === 0 && (
            <Text style={{textAlign: 'center', color: '#64748B', marginVertical: 20}}>No actions found. Add some below.</Text>
          )}

          <TouchableOpacity style={styles.addMoreBtn} onPress={() => openEditModal()}>
            <Text style={styles.addMoreText}>+ Add more actions</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('TrackProgress', { actions: actions.filter(a => a.isActive) })}>
            <Text style={styles.btnText}>Start Tracking</Text>
          </TouchableOpacity>
        </ScrollView>

        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit Action' : 'New Action'}</Text>
              
              <TextInput 
                style={styles.input} 
                placeholder="Action Title" 
                value={editTitle} 
                onChangeText={setEditTitle} 
              />
              <TextInput 
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
                placeholder="Description" 
                value={editDesc} 
                onChangeText={setEditDesc} 
                multiline
              />
              
              <View style={styles.modalBtns}>
                <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#E2E8F0'}]} onPress={() => setModalVisible(false)}>
                  <Text style={{color: '#475569', fontWeight: 'bold'}}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#2563EB'}]} onPress={handleSave}>
                  <Text style={{color: '#fff', fontWeight: 'bold'}}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </AppSidebarWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'white' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1D3B5A' },
  scroll: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1D3B5A', marginBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 16, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textContainer: { flex: 1, paddingRight: 10 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1D3B5A', marginBottom: 4 },
  cardSub: { fontSize: 13, color: '#64748B', lineHeight: 18 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  addMoreBtn: { paddingVertical: 20, alignItems: 'center' },
  addMoreText: { color: '#2563EB', fontWeight: 'bold', fontSize: 15 },
  btn: { backgroundColor: '#2563EB', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#1D3B5A' },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  modalBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 }
});
