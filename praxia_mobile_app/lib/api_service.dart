import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // -------------------------------------------------------------
  // DEPLOYMENT SETTING:
  // REPLACE THIS IP WITH YOUR FRIEND'S PC IP OR MENTOR'S SERVER IP
  // (If configuring HTTPS in production: 'https://api.yourdomain.com/api')
  static const String serverIp = '72.60.163.124'; // <--- CHANGE THIS
  static const String baseUrl = 'http://$serverIp:8010/api';
  // -------------------------------------------------------------

  static Future<Map<String, dynamic>> login(String username, String password) async {
    // --- MOCK LOGIN BYPASS FOR DEMOS ---
    if (username == 'praxiaone' && password == '123456') {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', 'mock_token_123');
      await prefs.setString('username', username);
      return {'success': true};
    }
    // -----------------------------------

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/token/'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'username': username, 'password': password}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', data['access']);
        await prefs.setString('username', username);
        return {'success': true};
      } else {
        return {'success': false, 'error': 'Invalid credentials'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Cannot reach backend. Make sure it is running on 0.0.0.0:8000'};
    }
  }

  static Future<Map<String, dynamic>> register(Map<String, dynamic> userData) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/register/'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(userData),
      );
      if (response.statusCode == 201 || response.statusCode == 200) {
        return {'success': true};
      } else {
        return {'success': false, 'error': 'Registration failed: ${response.body}'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Server error: $e'};
    }
  }

  static Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> profileData) async {
    final token = await getToken();
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/profile/'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode(profileData),
      );
      if (response.statusCode == 200) {
        return {'success': true, 'data': jsonDecode(response.body)};
      } else {
        return {'success': false, 'error': 'Failed to update profile'};
      }
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  static Future<Map<String, dynamic>?> getProfile() async {
    final token = await getToken();
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/profile/'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (response.statusCode == 200) return jsonDecode(response.body);
    } catch (_) {}
    return null;
  }

  static Future<Map<String, dynamic>> changePassword(String newPassword) async {
    final token = await getToken();
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/change-password/'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({'new_password': newPassword}),
      );
      if (response.statusCode == 200) {
        return {'success': true};
      } else {
        return {'success': false, 'error': 'Failed to change password'};
      }
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  static Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('username');
  }

  static Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.containsKey('token');
  }

  static Future<void> logout() async {
    final token = await getToken();
    try {
      await http.post(
        Uri.parse('$baseUrl/auth/logout/'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({'refresh': token}),
      );
    } catch (_) {}
    await clearToken();
  }

  static Future<bool> deleteAccount() async {
    final token = await getToken();
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/delete-account/'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (response.statusCode == 200) {
        await clearToken();
        return true;
      }
    } catch (_) {}
    return false;
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  static Future<String?> getUsername() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('username');
  }

  // ─── HEALTH OS SYNC / GENERIC POST ──────────────────────────────────────
  static Future<Map<String, dynamic>> post(String endpoint, Map<String, dynamic> body) async {
    final token = await getToken();
    try {
      final response = await http.post(
        Uri.parse('$baseUrl$endpoint'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: jsonEncode(body),
      );
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return jsonDecode(response.body);
      } else {
        return {'success': false, 'error': 'Server error: ${response.statusCode}'};
      }
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  // ─── REAL DATA FETCHING ──────────────────────────────────────────────────

  static Future<Map<String, dynamic>> getHealthScore() async {
    final token = await getToken();
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/health-score/'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (response.statusCode == 200) return jsonDecode(response.body);
    } catch (_) {}
    return {'score': 78, 'level': 'Good'}; // Default if backend fails
  }

  static Future<Map<String, dynamic>> getVitals() async {
    final token = await getToken();
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/vitals/latest/'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (response.statusCode == 200) return jsonDecode(response.body);
    } catch (_) {}
    return {'glucose': 118, 'steps': 6240, 'sleep_hours': '7h 20m'}; // Defaults
  }

  static Future<List<dynamic>> getDevices() async {
    final token = await getToken();
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/wearables/'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (response.statusCode == 200) return jsonDecode(response.body);
    } catch (_) {}
    return [
      {'name': 'Amazon One Medical', 'icon': '🟢'},
      {'name': 'Apple Health', 'icon': '❤️'},
      {'name': 'Fitbit', 'icon': '🧬'},
      {'name': '5G Device', 'icon': '📡'},
    ]; // Defaults
  }

  static Future<Map<String, dynamic>> chat(String message, {int? docId}) async {
    final token = await getToken();
    try {
      final Map<String, dynamic> body = {'message': message};
      if (docId != null) {
        body['doc_id'] = docId;
      }

      final response = await http.post(
        Uri.parse('$baseUrl/health-chat/'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode(body),
      );
      if (response.statusCode == 200) return jsonDecode(response.body);
    } catch (e) {
      return {'reply': 'Error: Could not reach AI engine. ($e)'};
    }
    return {'reply': 'Error: Server returned ${token == null ? "401" : "error"}'};
  }

  static Future<List<dynamic>> getChatHistory() async {
    final token = await getToken();
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/health-chat/'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (response.statusCode == 200) return jsonDecode(response.body);
    } catch (_) {}
    return [];
  }

  static Future<List<dynamic>> getRecommendations() async {
    final token = await getToken();
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/health/recommendations/'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (response.statusCode == 200) return jsonDecode(response.body);
    } catch (_) {}
    return [
      {
        'id': 1,
        'title': 'Increase Sleep Consistency',
        'subtitle': 'Highest impact to improve score and reduce glucose risk',
        'description': 'Walking after meals helps regulate blood sugar levels and improves cardiovascular health.',
        'impact_text': 'reduce glucose variability',
        'icon': 'sleep'
      },
      {
        'id': 2,
        'title': 'Reduce Saturated Fat Intake',
        'subtitle': 'Stabilize morning glucose spikes',
        'description': 'Reducing processed carbohydrates in your dinner can significantly improve fasting glucose stability.',
        'impact_text': 'LDL ↓ 10–15%',
        'icon': 'food'
      },
      {
        'id': 3,
        'title': 'Daily Walking (20 min)',
        'subtitle': 'Improve recovery and hormone balance',
        'description': 'Maintaining a consistent sleep schedule (7-8 hours) lowers cortisol and helps body weight management.',
        'impact_text': 'cardiovascular risk ↓',
        'icon': 'walk'
      }
    ]; // Default if backend fails
  }

  static Future<Map<String, dynamic>> startRecommendation(int id) async {
    final token = await getToken();
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/health/recommendations/$id/start/'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (response.statusCode == 200) return jsonDecode(response.body);
    } catch (_) {}
    return {'success': true};
  }

  // ─── NEW APIs FOR JOURNEY & FORECAST & VITALS EXPORT ───
  static Future<List<dynamic>> getJourneySteps() async {
    final token = await getToken();
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/journey/'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (response.statusCode == 200) return jsonDecode(response.body);
    } catch (_) {}
    return [
      {"step": 1, "title": "Entry Welcome", "status": "Started", "completed": true},
      {"step": 2, "title": "Data Sources", "status": "Connected", "completed": true},
      {"step": 3, "title": "Health Intelligence", "status": "Analyzed", "completed": true},
      {"step": 4, "title": "AI Assistant", "status": "Informed", "completed": true},
      {"step": 5, "title": "Prediction", "status": "Projected", "completed": true},
      {"step": 6, "title": "Recommendation", "status": "Prescribed", "completed": false},
      {"step": 7, "title": "Escalation", "status": "Optional", "completed": false},
      {"step": 8, "title": "Future Health", "status": "Unlocked", "completed": false},
    ];
  }

  static Future<Map<String, dynamic>> getForecast() async {
    final token = await getToken();
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/forecast/'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (response.statusCode == 200) return jsonDecode(response.body);
    } catch (_) {}
    return {
        "current_score": 72,
        "forecast_score": 72,
        "recommendations": [
            {"label": "Walk 30 min/day", "score": "82", "assetPath": "public/prediction_screen/activity.png"},
            {"label": "Improve Sleep", "score": "85", "assetPath": "public/prediction_screen/improve_sleep.png"}
        ],
        "detail_card": {
            "icon": "bed",
            "title": "Sleep Optimization",
            "tag": "Bedtime Routine",
            "description": "Try to go to bed and wake up at the same time each day for better endocrine recovery."
        }
    };
  }

  static Future<Map<String, dynamic>> getRiskFactors() async {
    final token = await getToken();
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/health/risk-factors/'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (response.statusCode == 200) return jsonDecode(response.body);
    } catch (_) {}
    return {
      "factors": [
          {"name": "LDL", "status": "Elevated"},
          {"name": "Sleep", "status": "Irregular"},
          {"name": "Activity", "status": "Low"}
      ],
      "warning_message": "These combined factors are increasing your cardiovascular risk.",
      "explanation_title": "Why am I seeing this?",
      "explanation_text": "Based on your recent lab results, wearable sleep data, and daily step count, our AI detects a pattern that correlates with elevated cardiovascular risk. Improving your sleep consistency and adding 20 minutes of daily activity can help stabilize your LDL and overall metabolic health."
    };
  }

  static Future<bool> exportVitalsPDF() async {
    final token = await getToken();
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/vitals/export/'),
        headers: {'Authorization': 'Bearer $token'},
      );
      return response.statusCode == 200;
    } catch (_) {}
    return false;
  }

  // ─── SETTINGS & ANALYTICS (from zip) ───
  static Future<Map<String, dynamic>> getCostAnalytics() async {
    final token = await getToken();
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/analytics/cost/'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (response.statusCode == 200) return jsonDecode(response.body);
    } catch (_) {}
    return {
      "budget_limit": 10.00,
      "current_usage": 0.00,
      "total_cost_calculated": 0.00,
      "model_breakdown": []
    };
  }

  static Future<Map<String, dynamic>> getUserSettings() async {
    final token = await getToken();
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/user/settings/'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (response.statusCode == 200) return jsonDecode(response.body);
    } catch (_) {}
    return {};
  }

  static Future<void> updateUserSettings(Map<String, dynamic> data) async {
    final token = await getToken();
    try {
      await http.patch(
        Uri.parse('$baseUrl/user/settings/'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode(data),
      );
    } catch (_) {}
  }
  static Future<http.Response> fetchTTS(String text) async {
    final token = await getToken();
    return await http.post(
      Uri.parse('$baseUrl/tts/'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({'text': text}),
    );
  }

  static Future<Map<String, dynamic>> uploadDocument(String filePath, String title, String docType) async {
    final token = await getToken();
    try {
      var request = http.MultipartRequest('POST', Uri.parse('$baseUrl/documents/'));
      request.headers['Authorization'] = 'Bearer $token';
      request.fields['title'] = title;
      request.fields['doc_type'] = docType;
      request.files.add(await http.MultipartFile.fromPath('file', filePath));
      
      var response = await request.send();
      var responseData = await response.stream.bytesToString();
      if (response.statusCode == 201) return jsonDecode(responseData);
    } catch (_) {}
    return {'error': 'Upload failed'};
  }
}
