import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../constants/theme';
import { ApiService } from '../services/apiService';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('ravi9');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter username and password');
      return;
    }
    
    setErrorMsg('');
    setIsLoading(true);
    const res = await ApiService.login(username, password);
    setIsLoading(false);
    
    if (res.success) {
      navigation.replace('DataSources');
    } else {
      setErrorMsg(res.error || 'Login failed');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient
        colors={[AppColors.primary + '1A', '#FFFFFF']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.card}>
              <Image 
                source={require('../../assets/public/welcome_screen/PraxiaOne_logo.png')} 
                style={styles.logo} 
                resizeMode="contain" 
              />
              
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Log in to your PraxiaOne account</Text>
              
              {!!errorMsg && (
                <View style={styles.errorBox}>
                  <MaterialIcons name="error-outline" size={20} color="red" />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              )}

              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#9ca3af"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]} 
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.primaryBtnText}>Log In</Text>
                )}
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity style={styles.socialBtn}>
                <FontAwesome5 name="google" size={20} color="#EA4335" style={{marginRight: 10}} />
                <Text style={styles.socialBtnText}>Log in with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialBtn}>
                <FontAwesome5 name="facebook" size={20} color="#1877F2" style={{marginRight: 10}} />
                <Text style={styles.socialBtnText}>Log in with Facebook</Text>
              </TouchableOpacity>

              <View style={styles.signupRow}>
                <Text style={styles.signupText}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
                  <Text style={styles.signupLink}> Sign up</Text>
                </TouchableOpacity>
              </View>

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
    borderColor: 'rgba(0,0,0,0.05)',
    borderWidth: 1,
    alignItems: 'center'
  },
  logo: { width: 180, height: 60, marginBottom: 15 },
  title: { fontSize: 26, fontWeight: '900', color: AppColors.accent, marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#64748b', marginBottom: 30, textAlign: 'center' },
  errorBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center'
  },
  errorText: { color: 'red', fontSize: 13, marginLeft: 8, flex: 1 },
  input: {
    backgroundColor: '#F8FAFC',
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
    color: AppColors.text,
  },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { color: AppColors.text, fontWeight: 'bold', fontSize: 14 },
  primaryBtn: {
    backgroundColor: AppColors.primary,
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: { opacity: 0.7 },
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
  socialBtnText: { color: AppColors.text, fontWeight: 'bold', fontSize: 15 },
  signupRow: { flexDirection: 'row', marginTop: 25 },
  signupText: { color: '#64748B', fontSize: 14 },
  signupLink: { color: AppColors.primary, fontWeight: 'bold', fontSize: 14 }
});
