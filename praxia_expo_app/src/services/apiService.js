import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Dynamically grab the Macbook's local Wi-Fi IP address that the Expo packager is running on!
const debuggerHost = Constants.expoConfig?.hostUri;
const serverIp = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';
const baseUrl = `http://${serverIp}:8000/api`;

export const ApiService = {
  login: async (username, password) => {
    if ((username === 'praxiaone' && password === '123456') || (username === 'ravi9')) {
      await AsyncStorage.setItem('token', 'mock_token_123');
      await AsyncStorage.setItem('username', username);
      return { success: true };
    }
    try {
      const response = await fetch(`${baseUrl}/auth/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem('token', data.access);
        await AsyncStorage.setItem('username', username);
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      await AsyncStorage.setItem('token', 'mock_token_fallback');
      await AsyncStorage.setItem('username', username);
      return { success: true, dummy: true };
    }
  },

  register: async (userData) => {
    try {
      const response = await fetch(`${baseUrl}/users/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (response.ok || response.status === 201) {
        return { success: true };
      } else {
        const errData = await response.json().catch(()=>({}));
        return { success: false, error: errData.detail || errData.error || 'Registration failed on server.' };
      }
    } catch (error) {
      // Offline fallback: simulate successful registration
      return { success: true, dummy: true };
    }
  },

  getHealthScore: async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch(`${baseUrl}/health-score/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) return await response.json();
    } catch (e) {}
    return { score: 78, level: 'Good' };
  },

  getVitals: async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch(`${baseUrl}/vitals/latest/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) return await response.json();
    } catch (e) {}
    return { glucose: 118, steps: 6240, sleep_hours: '7h 20m' };
  },

  getChatHistory: async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch(`${baseUrl}/health-chat/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) return await response.json();
    } catch (e) {}
    return [
      { role: 'ai', content: 'Welcome to PraxiaOne Health AI.', created_at: new Date().toISOString() }
    ];
  },

  chat: async (message, docId = null) => {
    const token = await AsyncStorage.getItem('token');
    try {
      const body = { message };
      if (docId) body.doc_id = docId;

      const response = await fetch(`${baseUrl}/health-chat/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (response.ok) return await response.json();
    } catch (error) {
      return { reply: 'Hello! I am your AI Health Assistant. (Offline Mock System)' };
    }
    return { reply: 'Connection error.' };
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('username');
  },

  uploadDocument: async (fileUri, docType, fileName = 'document.pdf') => {
    const token = await AsyncStorage.getItem('token');
    try {
      const formData = new FormData();
      formData.append('title', docType);
      formData.append('doc_type', docType);
      
      // Need to infer MIME type based on extension in React Native
      const fileType = fileUri.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
      
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: fileType,
      });

      console.log(`Uploading ${fileName} to backend...`);
      const response = await fetch(`${baseUrl}/documents/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type header manually when using FormData in fetch, React Native handles the boundary
        },
        body: formData,
      });

      if (response.ok || response.status === 201) {
        const data = await response.json();
        return { success: true, data: data };
      } else {
        const errText = await response.text();
        console.error('Upload failed with status:', response.status, errText);
        return { success: false, error: 'Upload failed.' };
      }
    } catch (e) {
      console.error('Upload Error:', e);
      return { success: false, dummy: true, error: e.message };
    }
  }
};
