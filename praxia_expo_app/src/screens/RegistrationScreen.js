import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';
import { ApiService } from '../services/apiService';

export default function RegistrationScreen({ navigation }) {
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    username: '',
    password: '',
    age: '',
    gender: 'Other',
    allergies: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.username || !form.password || !form.fullName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    const res = await ApiService.register(form);
    setIsLoading(false);

    if (res.success) {
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => navigation.replace('Login') }
      ]);
    } else {
      Alert.alert('Registration Failed', res.error || 'Please try again later.');
    }
  };

  const updateForm = (key, value) => setForm({ ...form, [key]: value });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={[AppColors.primary + '2A', '#E2F8EE']} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.card}>
              <Image 
                source={require('../../assets/public/welcome_screen/PraxiaOne_logo.png')} 
                style={styles.logo} 
                resizeMode="contain" 
              />
              
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join PraxiaOne and take control of your wellness data.</Text>
              
              <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#9ca3af" value={form.fullName} onChangeText={(t) => updateForm('fullName', t)} />
              <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#9ca3af" keyboardType="phone-pad" value={form.phone} onChangeText={(t) => updateForm('phone', t)} />
              <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#9ca3af" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={(t) => updateForm('email', t)} />
              <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#9ca3af" autoCapitalize="none" value={form.username} onChangeText={(t) => updateForm('username', t)} />
              <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#9ca3af" secureTextEntry value={form.password} onChangeText={(t) => updateForm('password', t)} />

              <View style={styles.row}>
                <TextInput style={[styles.input, {flex: 1, marginRight: 10}]} placeholder="Age" placeholderTextColor="#9ca3af" keyboardType="numeric" value={form.age} onChangeText={(t) => updateForm('age', t)} />
                <View style={[styles.input, {flex: 1, justifyContent: 'center'}]}>
                  <Text style={{fontSize: 12, color: 'gray', position: 'absolute', top: -8, left: 10, backgroundColor: 'white', paddingHorizontal: 4}}>Gender</Text>
                  <Text style={{color: AppColors.accent, fontWeight: 'bold'}}>{form.gender}  ▼</Text>
                </View>
              </View>

              <TextInput style={styles.input} placeholder="Allergies (if any)" placeholderTextColor="#9ca3af" value={form.allergies} onChangeText={(t) => updateForm('allergies', t)} />

              <TouchableOpacity 
                style={[styles.primaryBtn, isLoading && {opacity: 0.7}]} 
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryBtnText}>Sign Up</Text>}
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity style={styles.socialBtn}>
                <FontAwesome5 name="google" size={20} color="#EA4335" style={{marginRight: 10}} />
                <Text style={styles.socialBtnText}>Sign up with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialBtn}>
                <FontAwesome5 name="facebook" size={20} color="#1877F2" style={{marginRight: 10}} />
                <Text style={styles.socialBtnText}>Sign up with Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 20}}>
                <Text style={{color: 'gray', fontWeight: 'bold'}}>Back to Login</Text>
              </TouchableOpacity>

            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 40,
    elevation: 5,
    alignItems: 'center'
  },
  logo: { width: 160, height: 50, marginBottom: 15 },
  title: { fontSize: 26, fontWeight: '900', color: AppColors.accent, marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 25, textAlign: 'center', paddingHorizontal: 10 },
  input: {
    backgroundColor: '#F8FAFC',
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
    color: AppColors.text,
  },
  row: { flexDirection: 'row', width: '100%' },
  primaryBtn: {
    backgroundColor: AppColors.primary,
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  primaryBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 25, width: '100%' },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { color: '#94A3B8', paddingHorizontal: 15, fontSize: 14 },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  socialBtnText: { color: AppColors.text, fontWeight: 'bold', fontSize: 15 }
});
