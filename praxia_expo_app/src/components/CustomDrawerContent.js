import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';
import { ApiService } from '../services/apiService';

export default function CustomDrawerContent(props) {
  const handleLogout = async () => {
    await ApiService.logout();
    props.navigation.replace('Login');
  };

  const DrawerItem = ({ icon, label, route, isRed = false }) => (
    <TouchableOpacity 
      style={styles.drawerItem} 
      onPress={() => props.navigation.navigate(route)}
    >
      <MaterialIcons name={icon} size={22} color={isRed ? '#EF4444' : '#1D3B5A'} style={{width: 30}} />
      <Text style={[styles.itemText, isRed && {color: '#EF4444'}]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F2F4F7' }}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>R</Text>
        </View>
        <View style={{ marginLeft: 16 }}>
          <Text style={styles.username}>Ravi9</Text>
          <Text style={styles.email}>ravi9@praxiaone.com</Text>
        </View>
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={{paddingTop: 10}}>
        <Text style={styles.sectionTitle}>YOUR JOURNEY</Text>
        
        <DrawerItem icon="insights" label="3. Health Intelligence" route="Dashboard" />
        <DrawerItem icon="chat-bubble-outline" label="4. AI Assistance" route="Assistant" />
        <DrawerItem icon="trending-up" label="5. Track Progress" route="TrackProgress" />
        
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        
        <TouchableOpacity style={styles.drawerItem} onPress={handleLogout}>
          <MaterialIcons name="logout" size={22} color="#EF4444" style={{width: 30}} />
          <Text style={[styles.itemText, {color: '#EF4444'}]}>Logout</Text>
        </TouchableOpacity>
      </DrawerContentScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1D3B5A',
  },
  email: {
    fontSize: 12,
    color: 'gray',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'gray',
    letterSpacing: 1.2,
    marginLeft: 24,
    marginBottom: 8,
    marginTop: 8,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 4,
  },
  itemText: {
    fontWeight: '600',
    color: '#1D3B5A',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  }
});
