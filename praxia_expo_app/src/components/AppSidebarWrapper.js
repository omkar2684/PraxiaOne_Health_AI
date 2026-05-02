import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';
import { ApiService } from '../services/apiService';

const { width } = Dimensions.get('window');

const AppSidebarWrapper = forwardRef(({ navigation, children }, ref) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width * 0.75)).current;

  useImperativeHandle(ref, () => ({
    toggleDrawer: () => toggleDrawer()
  }));

  const toggleDrawer = () => {
    const toValue = isDrawerOpen ? -width * 0.75 : 0;
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsDrawerOpen(!isDrawerOpen);
    });
  };

  const handleLogout = async () => {
    await ApiService.logout();
    navigation.replace('Login');
  };

  const navigateTo = (screen) => {
    toggleDrawer();
    navigation.navigate(screen);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Main Content */}
      <View style={{ flex: 1 }}>
        {children}
      </View>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <TouchableWithoutFeedback onPress={toggleDrawer}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}
      
      {/* Drawer Component */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F2F4F7' }}>
          <View style={styles.drawerHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>R</Text>
            </View>
            <View style={{ marginLeft: 16 }}>
              <Text style={styles.username}>Ravi Kumar (Offline)</Text>
              <Text style={styles.email}>ravi@dummy.com</Text>
            </View>
          </View>

          <ScrollView style={{paddingTop: 10}}>
            <Text style={styles.sectionTitle}>YOUR JOURNEY</Text>
            
            <TouchableOpacity style={styles.drawerItem} onPress={() => navigateTo('Welcome')}>
              <MaterialIcons name="door-front" size={22} color="#1D3B5A" style={{width: 30}} />
              <Text style={styles.itemText}>1. Entry Welcome</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.drawerItem} onPress={() => navigateTo('DataSources')}>
              <MaterialIcons name="sensors" size={22} color="#1D3B5A" style={{width: 30}} />
              <Text style={styles.itemText}>2. Data Sources</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.drawerItem} onPress={() => navigateTo('Dashboard')}>
              <MaterialIcons name="insights" size={22} color="#1D3B5A" style={{width: 30}} />
              <Text style={styles.itemText}>3. Health Intelligence</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.drawerItem} onPress={() => navigateTo('Assistant')}>
              <MaterialIcons name="chat-bubble-outline" size={22} color="#1D3B5A" style={{width: 30}} />
              <Text style={styles.itemText}>4. AI Assistance</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.drawerItem} onPress={() => navigateTo('Prediction')}>
              <MaterialIcons name="auto-awesome" size={22} color="#1D3B5A" style={{width: 30}} />
              <Text style={styles.itemText}>5. Prediction</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.drawerItem} onPress={() => navigateTo('Recommendation')}>
              <MaterialIcons name="check-circle-outline" size={22} color="#1D3B5A" style={{width: 30}} />
              <Text style={styles.itemText}>6. Recommendation</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.drawerItem} onPress={() => navigateTo('Escalation')}>
              <MaterialIcons name="medical-services" size={22} color="#1D3B5A" style={{width: 30}} />
              <Text style={styles.itemText}>7. Escalation</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.drawerItem} onPress={() => navigateTo('JourneyFlow')}>
              <MaterialIcons name="map" size={22} color="#1D3B5A" style={{width: 30}} />
              <Text style={styles.itemText}>8. Journey Flow</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.drawerItem} onPress={() => navigateTo('MessagePortal')}>
              <MaterialIcons name="forum" size={22} color="#1D3B5A" style={{width: 30}} />
              <Text style={styles.itemText}>Message Portal</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>ACCOUNT</Text>
            
            <TouchableOpacity style={styles.drawerItem} onPress={() => navigateTo('Settings')}>
              <MaterialIcons name="settings" size={22} color="#1D3B5A" style={{width: 30}} />
              <Text style={styles.itemText}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.drawerItem} onPress={handleLogout}>
              <MaterialIcons name="logout" size={22} color="#EF4444" style={{width: 30}} />
              <Text style={[styles.itemText, {color: '#EF4444'}]}>Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 10,
  },
  drawer: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0,
    width: width * 0.75,
    backgroundColor: '#F2F4F7',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  drawerHeader: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: 'bold', color: AppColors.primary },
  username: { fontWeight: 'bold', fontSize: 16, color: '#1D3B5A' },
  email: { fontSize: 12, color: 'gray', marginTop: 2 },
  sectionTitle: {
    fontSize: 10, fontWeight: 'bold', color: 'gray', letterSpacing: 1.2,
    marginLeft: 24, marginBottom: 8, marginTop: 8,
  },
  drawerItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 24, marginBottom: 4,
  },
  itemText: { fontWeight: '600', color: '#1D3B5A', fontSize: 14 },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 16 }
});

export default AppSidebarWrapper;
