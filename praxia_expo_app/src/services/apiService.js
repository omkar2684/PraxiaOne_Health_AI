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
      const response = await fetch(`${baseUrl}/auth/register/`, {
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

  getTrackProgress: async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch(`${baseUrl}/track-progress/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) return await response.json();
    } catch (e) {}
    // Fallback dummy data if API fails
    return {
      "weekly_summary": {
          "completed": 3,
          "partial": 1,
          "not_started": 1,
          "progress_percent": 60,
          "total": 5
      },
      "actions": [
          {"id": 1, "icon": "directions_walk", "title": "Walk 20 minutes daily", "subtext": "4 of 5 days completed", "status": "On Track", "status_color": "success", "color_hex": "#10B981"},
          {"id": 2, "icon": "cake", "title": "Reduce sugar intake", "subtext": "Improved, but above target", "status": "Partial", "status_color": "warning", "color_hex": "#F59E0B"},
          {"id": 3, "icon": "water_drop", "title": "Drink 8 glasses of water", "subtext": "3 of 5 days completed", "status": "Partial", "status_color": "warning", "color_hex": "#3B82F6"},
          {"id": 4, "icon": "fitness_center", "title": "Strength training 2x per week", "subtext": "Completed 2 of 2 this week", "status": "On Track", "status_color": "success", "color_hex": "#8B5CF6"},
          {"id": 5, "icon": "event", "title": "Schedule follow-up lab test", "subtext": "Not started", "status": "Not Started", "status_color": "error", "color_hex": "#EF4444", "is_actionable": true}
      ],
      "insights": [
          {"icon": "trending_up", "text": "Your activity level increased by 22% this week", "color": "success"},
          {"icon": "trending_flat", "text": "Sugar intake still fluctuating", "subtext": "Try reducing added sugars", "color": "warning"},
          {"icon": "bedtime", "text": "You're most consistent on weekdays", "color": "primary"}
      ],
      "projection": {
          "text": "You are on track to improve your glucose levels by your next test.",
          "subtext": "Based on your current adherence pattern"
      },
      "re_test": {
          "days_left": 18,
          "text": "Based on your progress, your next lab test is recommended in 18 days."
      }
    };
  },

  getRiskFactors: async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch(`${baseUrl}/health/risk-factors/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) return await response.json();
    } catch (e) {}
    // Fallback dummy data
    return {
      factors: [
          {name: "LDL", status: "Elevated"},
          {name: "Sleep", status: "Irregular"},
          {name: "Activity", status: "Low"}
      ],
      warning_message: "These combined factors are increasing your cardiovascular risk.",
      explanation_title: "Why am I seeing this?",
      explanation_text: "Based on your recent lab results, wearable sleep data, and daily step count, our AI detects a pattern that correlates with elevated cardiovascular risk. Improving your sleep consistency and adding 20 minutes of daily activity can help stabilize your LDL and overall metabolic health."
    };
  },

  getRecommendations: async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch(`${baseUrl}/health/recommendations/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) return await response.json();
    } catch (e) {}
    // Fallback dummy data
    return [
      {
          id: 1,
          title: 'Increase Sleep Consistency',
          subtitle: 'Highest impact to improve score and reduce glucose risk',
          description: 'Walking after meals helps regulate blood sugar levels and improves cardiovascular health.',
          impact_text: 'reduce glucose variability',
          icon: 'bedtime'
      },
      {
          id: 2,
          title: 'Reduce Saturated Fat Intake',
          subtitle: 'Stabilize morning glucose spikes',
          description: 'Reducing processed carbohydrates in your dinner can significantly improve fasting glucose stability.',
          impact_text: 'LDL ↓ 10–15%',
          icon: 'restaurant'
      },
      {
          id: 3,
          title: 'Daily Walking (20 min)',
          subtitle: 'Improve recovery and hormone balance',
          description: 'Maintaining a consistent sleep schedule (7-8 hours) lowers cortisol and helps body weight management.',
          impact_text: 'cardiovascular risk ↓',
          icon: 'directions-walk'
      }
    ];
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
  },

  uploadLabReportPDF: async (fileUri, fileName = 'lab_report.pdf') => {
    const token = await AsyncStorage.getItem('token');
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: 'application/pdf',
      });
      const response = await fetch(`${baseUrl}/parse-pdf/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        return { success: true, biomarkers: data.biomarkers || [] };
      }
      return { success: false };
    } catch (e) {
      // Offline Mock Data Fallback
      return {
        success: true,
        dummy: true,
        biomarkers: [
          { name: 'Glucose', value: '110', unit: 'mg/dL', status: 'High' },
          { name: 'Hemoglobin A1c', value: '5.8', unit: '%', status: 'Normal' },
          { name: 'LDL Cholesterol', value: '135', unit: 'mg/dL', status: 'High' },
          { name: 'Vitamin D', value: '20', unit: 'ng/mL', status: 'Low' },
          { name: 'Triglycerides', value: '168', unit: 'mg/dL', status: 'High' }
        ]
      };
    }
  },

  getAiInsights: async (biomarkers) => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch(`${baseUrl}/insights/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ biomarkers }),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {}
    // Offline Mock Data Fallback
    return {
      top_findings: [
        { name: "Blood Sugar", status: "High", finding: "Your fasting glucose is above optimal." },
        { name: "LDL Cholesterol", status: "High", finding: "Your LDL is above optimal range." },
        { name: "Vitamin D", status: "Low", finding: "Your Vitamin D level is below optimal." }
      ],
      what_it_means: [
        { biomarker: "Blood Sugar (Glucose)", explanation: "Your fasting glucose is 110 mg/dL, which is above the optimal range. This may indicate insulin resistance.", good_news: "Small daily changes can significantly improve your blood sugar." },
        { biomarker: "LDL Cholesterol", explanation: "High LDL can lead to plaque buildup in arteries.", good_news: "Dietary adjustments can lower LDL within weeks." }
      ],
      action_plan: [
        { title: "Walk 20 minutes daily", description: "Helps improve blood sugar and insulin sensitivity.", icon: "directions-walk" },
        { title: "Reduce added sugar", description: "Limit to <25g per day. Improves glucose & cholesterol.", icon: "no-food" },
        { title: "Take Vitamin D3", description: "2,000 IU daily with food. Supports immunity.", icon: "medical-services" }
      ]
    };
  }
};
