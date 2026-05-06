import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';
import AppSidebarWrapper from '../components/AppSidebarWrapper';

export default function JourneyFlowScreen({ navigation }) {
  const sidebarRef = useRef(null);

  const flowSteps = [
    { id: 1, title: 'Entry Welcome', status: 'Started', completed: true },
    { id: 2, title: 'Data Sources', status: 'Connected', completed: true },
    { id: 3, title: 'Health Intelligence', status: 'Analyzed', completed: true },
    { id: 4, title: 'AI Assistant', status: 'Informed', completed: true },
    { id: 5, title: 'Prediction', status: 'Projected', completed: true },
    { id: 6, title: 'Recommendation', status: 'Prescribed', completed: false },
    { id: 7, title: 'Escalation', status: 'Optional', completed: false },
    { id: 8, title: 'Future Health', status: 'Unlocked', completed: false },
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
          
          <View style={styles.timelineCont}>
            {flowSteps.map((step, index) => {
              const isLast = index === flowSteps.length - 1;
              return (
                <View key={step.id} style={styles.stepRow}>
                  {/* Left Column - Number Circle & Vertical Line */}
                  <View style={styles.leftCol}>
                    <View style={[styles.circle, step.completed ? styles.circleActive : styles.circleInactive]}>
                      <Text style={[styles.circleText, !step.completed && {color: '#94A3B8'}]}>{step.id}</Text>
                    </View>
                    {!isLast && <View style={styles.verticalLine} />}
                  </View>
                  
                  {/* Right Column - Text Info & Checkmark */}
                  <View style={styles.rightCol}>
                    <View style={styles.textCont}>
                      <Text style={[styles.stepTitle, !step.completed && {color: '#64748B'}]}>{step.title}</Text>
                      <Text style={[styles.stepStatus, step.completed ? {color: AppColors.primary} : {color: '#94A3B8'}]}>{step.status}</Text>
                    </View>
                    {step.completed && (
                      <View style={styles.checkCircle}>
                        <MaterialIcons name="check" size={16} color="white" />
                      </View>
                    )}
                  </View>
                </View>
              )
            })}
          </View>

          <TouchableOpacity style={styles.restartBtn} onPress={() => navigation.navigate('Welcome')}>
            <Text style={styles.restartBtnText}>Restart Journey</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </AppSidebarWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'white' },
  logoCont: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 20, fontWeight: 'bold', color: '#1D3B5A', marginLeft: 8 },
  scroll: { padding: 30 },
  timelineCont: { marginBottom: 40 },
  stepRow: { flexDirection: 'row', minHeight: 80 },
  leftCol: { alignItems: 'center', width: 50, marginRight: 15 },
  circle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  circleActive: { backgroundColor: AppColors.primary },
  circleInactive: { backgroundColor: '#F1F5F9' },
  circleText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  verticalLine: { width: 2, flex: 1, backgroundColor: '#E2E8F0', marginVertical: -5, zIndex: 1 },
  rightCol: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10 },
  textCont: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: 'bold', color: '#1D3B5A', marginBottom: 5 },
  stepStatus: { fontSize: 12 },
  checkCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: AppColors.primary, justifyContent: 'center', alignItems: 'center' },
  restartBtn: { backgroundColor: AppColors.primary, width: '100%', paddingVertical: 18, borderRadius: 12, alignItems: 'center', shadowColor: AppColors.primary, shadowOffset: {width:0, height:4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  restartBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
