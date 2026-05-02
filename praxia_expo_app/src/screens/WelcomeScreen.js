import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';
import AppSidebarWrapper from '../components/AppSidebarWrapper';

export default function WelcomeScreen({ navigation }) {
  const sidebarRef = useRef(null);

  return (
    <AppSidebarWrapper ref={sidebarRef} navigation={navigation}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => sidebarRef.current?.toggleDrawer()}>
            <MaterialIcons name="menu" size={28} color="#1D3B5A" />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/public/welcome_screen/PraxiaOne_logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.logoSubText}>AI-Driven Personalized Wellness</Text>
          </View>
          <View style={{width: 28}} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <ImageBackground 
            source={require('../../assets/public/ai_assistant/woman_background_img.png')} // Fallback image if actual not available
            style={styles.heroBanner}
            imageStyle={{ opacity: 0.8 }}
          >
            <View style={styles.heroOverlay}>
              <Text style={styles.heroTitle}>Your Health,{'\n'}Your Data,{'\n'}Your Way</Text>
              
              <View style={styles.heroButtons}>
                <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Registration')}>
                  <Text style={styles.btnPrimaryText}>Get Started</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.btnSecondaryText}>Log In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>

          <View style={styles.featuresGrid}>
            <View style={[styles.featureBox, styles.borderRight, styles.borderBottom]}>
              <MaterialIcons name="health-and-safety" size={40} color={AppColors.primary} />
              <Text style={styles.featureTitle}>Personalized Wellness{'\n'}Insights</Text>
              <Text style={styles.featureDesc}>Tailored Health{'\n'}Recommendations</Text>
            </View>
            <View style={[styles.featureBox, styles.borderBottom]}>
              <MaterialIcons name="storage" size={40} color={AppColors.accent} />
              <Text style={styles.featureTitle}>Secure Data{'\n'}Integration</Text>
              <Text style={styles.featureDesc}>Self, Labs, Wearables, EHR</Text>
            </View>
            <View style={[styles.featureBox, styles.borderRight]}>
              <MaterialIcons name="lightbulb" size={40} color={AppColors.primary} />
              <Text style={styles.featureTitle}>AI-Assisted Guidance</Text>
              <Text style={styles.featureDesc}>Smart Health{'\n'}Recommendations</Text>
            </View>
            <View style={styles.featureBox}>
              <MaterialIcons name="medical-services" size={40} color={AppColors.primary} />
              <Text style={styles.featureTitle}>Optional Telehealth{'\n'}Access</Text>
              <Text style={styles.featureDesc}>Connect with Providers</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <MaterialIcons name="verified-user" size={16} color={AppColors.primary} />
            <Text style={styles.footerText}>HIPAA Compliant</Text>
          </View>
          <View style={styles.footerItem}>
            <MaterialIcons name="security" size={16} color="#3B82F6" />
            <Text style={styles.footerText}>Secure & Encrypted</Text>
          </View>
        </View>
      </SafeAreaView>
    </AppSidebarWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  logoContainer: { alignItems: 'center' },
  logo: { width: 140, height: 40 },
  logoSubText: { fontSize: 10, color: '#1D3B5A', fontWeight: 'bold' },
  heroBanner: { width: '100%', height: 320, backgroundColor: '#87CEEB' },
  heroOverlay: { flex: 1, padding: 25, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.1)' },
  heroTitle: { fontSize: 34, fontWeight: 'bold', color: 'white', textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 5, marginBottom: 30 },
  heroButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  btnPrimary: { backgroundColor: AppColors.primary, paddingVertical: 14, borderRadius: 10, flex: 1, marginRight: 10, alignItems: 'center' },
  btnPrimaryText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  btnSecondary: { backgroundColor: 'white', paddingVertical: 14, borderRadius: 10, flex: 1, marginLeft: 10, alignItems: 'center' },
  btnSecondaryText: { color: '#1D3B5A', fontWeight: 'bold', fontSize: 16 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: 'white' },
  featureBox: { width: '50%', padding: 25, alignItems: 'center', justifyContent: 'center' },
  borderRight: { borderRightWidth: 1, borderRightColor: '#F0F0F0' },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  featureTitle: { fontSize: 13, fontWeight: 'bold', color: '#1D3B5A', textAlign: 'center', marginTop: 12, marginBottom: 6 },
  featureDesc: { fontSize: 11, color: 'gray', textAlign: 'center' },
  footer: { flexDirection: 'row', backgroundColor: '#1D3B5A', padding: 20, justifyContent: 'space-around' },
  footerItem: { flexDirection: 'row', alignItems: 'center' },
  footerText: { color: 'white', fontSize: 12, fontWeight: 'bold', marginLeft: 8 }
});
