import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Dynamically grab the Macbook's local Wi-Fi IP address that the Expo packager is running on!
const debuggerHost = Constants.expoConfig?.hostUri;
const serverIp = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';
const baseUrl = `http://${serverIp}:8000/api`;

export const ApiService = {
  login: async (username, password) => {
    try {
      const response = await fetch(`${baseUrl}/auth/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem('token', data.access);
        if (data.refresh) {
          await AsyncStorage.setItem('refresh_token', data.refresh);
        }
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

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('username');
    // Clear other caches if necessary
    await AsyncStorage.removeItem('cached_track_data');
    await AsyncStorage.removeItem('cached_track_insights');
    return true;
  },

  refreshToken: async () => {
    try {
      const refresh = await AsyncStorage.getItem('refresh_token');
      if (!refresh) return false;
      const response = await fetch(`${baseUrl}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem('token', data.access);
        return true;
      }
    } catch (e) {}
    return false;
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
      if (response.ok) {
        const data = await response.json();
        if (data.glucose && data.steps) return data;
      }
    } catch (e) {}
    
    // Dynamic generator based on time of day for wearable dummy data
    const hour = new Date().getHours();
    let steps, glucose, sleep_hours;
    
    if (hour < 10) {
      steps = Math.floor(Math.random() * 2000) + 1500;
      glucose = Math.floor(Math.random() * 15) + 85; // Fasting
      sleep_hours = `${Math.floor(Math.random() * 2) + 6}h ${Math.floor(Math.random() * 60)}m`;
    } else if (hour < 17) {
      steps = Math.floor(Math.random() * 4000) + 4000;
      glucose = Math.floor(Math.random() * 30) + 100; // Post-meal
      sleep_hours = `${Math.floor(Math.random() * 2) + 6}h ${Math.floor(Math.random() * 60)}m`;
    } else {
      steps = Math.floor(Math.random() * 3000) + 7000;
      glucose = Math.floor(Math.random() * 20) + 95;
      sleep_hours = `${Math.floor(Math.random() * 2) + 6}h ${Math.floor(Math.random() * 60)}m`;
    }
    
    return { glucose, steps, sleep_hours };
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
          {"id": 4, "icon": "fitness_center", "title": "Strength training 2x per week", "subtext": "Completed 2 of 2 this week", "status": "On Track", "status_color": "success", "color_hex": "#8B5CF6"}
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

  getTrackProgressInsights: async (actions) => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch(`${baseUrl}/track-progress-insights/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ actions }),
      });
      if (response.ok) return await response.json();
    } catch (e) {}
    return {};
  },

  saveAiActions: async (actions) => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch(`${baseUrl}/track-progress/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ actions }),
      });
      if (response.ok) return await response.json();
    } catch (e) {}
    return null;
  },

  updateActionTask: async (taskId, data) => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch(`${baseUrl}/track-progress/task/${taskId}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response.ok;
    } catch (e) {}
    return false;
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
      
      let backendDocType = docType.toLowerCase().replace(/ /g, '_');
      if (backendDocType === 'lab_results') backendDocType = 'lab_result';
      if (backendDocType === 'health_report') backendDocType = 'insurance_policy';
      if (backendDocType === 'ai_chat_upload') backendDocType = 'lab_result';
      
      formData.append('doc_type', backendDocType);
      
      // Need to infer MIME type based on extension in React Native
      const fileType = fileUri.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
      
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: fileType,
      });

      console.log(`Uploading ${fileName} to backend...`);
      let response = await fetch(`${baseUrl}/documents/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 401) {
        const refreshed = await ApiService.refreshToken();
        if (refreshed) {
          token = await AsyncStorage.getItem('token');
          response = await fetch(`${baseUrl}/documents/`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });
        }
      }

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

  getLatestLabResults: async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch(`${baseUrl}/lab-results/latest/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        return data.biomarkers || [];
      }
      return [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  compareLabReport: async (fileUri, fileName = 'follow_up.pdf') => {
    const token = await AsyncStorage.getItem('token');
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: 'application/pdf',
      });
      const response = await fetch(`${baseUrl}/compare-labs/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (response.ok) {
        const resData = await response.json();
        return { success: true, data: resData.data || [] };
      }
      return { success: false };
    } catch (e) {
      // Mock Fallback
      return {
        success: true,
        data: [
          { name: 'Hemoglobin', old_value: '13.5 g/dL', new_value: '11.6 g/dL', delta: '13.8% Drop', improved: true, normal_range: '12.0 - 15.0' },
          { name: 'WBC', old_value: '6.5 x10³/uL', new_value: '6.0 x10³/uL', delta: '7.7% Drop', improved: true, normal_range: '4.5 - 11.0' },
          { name: 'eGFR', old_value: '92.0 mL/min', new_value: '85.4 mL/min', delta: '7.2% Drop', improved: false, normal_range: '>60' },
          { name: 'Creatinine', old_value: '0.9 mg/dL', new_value: '0.8 mg/dL', delta: '6.0% Drop', improved: true, normal_range: '0.6 - 1.2' },
          { name: 'AST (Liver)', old_value: '45.0 U/L', new_value: '39.7 U/L', delta: '11.9% Drop', improved: true, normal_range: '10 - 40' },
          { name: 'ALT (Liver)', old_value: '52.0 U/L', new_value: '47.1 U/L', delta: '9.5% Drop', improved: true, normal_range: '7 - 56' },
          { name: 'Triglycerides', old_value: '220.0 mg/dL', new_value: '203.2 mg/dL', delta: '7.6% Drop', improved: true, normal_range: '<150' },
          { name: 'HDL Cholesterol', old_value: '34.0 mg/dL', new_value: '31.9 mg/dL', delta: '6.3% Drop', improved: false, normal_range: '>40' },
          { name: 'LDL Cholesterol', old_value: '155.0 mg/dL', new_value: '133.0 mg/dL', delta: '14.2% Drop', improved: true, normal_range: '<100' },
          { name: 'HbA1c', old_value: '8.4 %', new_value: '7.8 %', delta: '7.3% Drop', improved: true, normal_range: '4.0 - 5.6' },
          { name: 'Glucose', old_value: '168.0 mg/dL', new_value: '148.5 mg/dL', delta: '11.6% Drop', improved: true, normal_range: '70 - 99' }
        ]
      };
    }
  },

  uploadLabReportPDF: async (fileUri, fileName = 'lab_report.pdf') => {
    let token = await AsyncStorage.getItem('token');
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: 'application/pdf',
      });
      
      let response = await fetch(`${baseUrl}/parse-pdf/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.status === 401) {
        const refreshed = await ApiService.refreshToken();
        if (refreshed) {
          token = await AsyncStorage.getItem('token');
          response = await fetch(`${baseUrl}/parse-pdf/`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });
        }
      }

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
  },

  getOutcomeSimulation: async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch(`${baseUrl}/outcome-simulation/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) return await response.json();
    } catch (e) {}
    // Fallback Mock Data
    return {
      "projections": {
        "two_weeks": {
          "text": "Your glucose levels are projected to stabilize within the next 2 weeks if you continue your current walking habit.",
          "subtext": "Stability: High",
          "biomarkers": [
            { "name": "Glucose", "from_to": "110 -> 98", "improvement": "11%", "trend": "down" },
            { "name": "Sleep Efficiency", "from_to": "78% -> 85%", "improvement": "7%", "trend": "up" }
          ]
        },
        "one_month": {
          "text": "In 30 days, your LDL levels could drop by up to 15% with consistent dietary changes.",
          "subtext": "Confidence: 85%",
          "biomarkers": [
            { "name": "LDL", "from_to": "135 -> 115", "improvement": "15%", "trend": "down" },
            { "name": "Weight", "from_to": "185 -> 180 lbs", "improvement": "5 lbs", "trend": "down" }
          ]
        }
      },
      "causality_analysis": [
        { "rank": 1, "action_name": "Evening Walk", "benefit": "Directly correlates with 12mg/dL reduction in morning glucose." },
        { "rank": 2, "action_name": "Fiber Intake", "benefit": "Correlates with improved digestion and stable energy levels." }
      ],
      "signals": ["Improvement detected in post-prandial glucose", "Sleep latency reduced"]
    };
  }
};
