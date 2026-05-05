// lib/lab_ai/lab_api_service.dart
// Calls POST /api/insights/ on the existing Django backend (port 8000).
// Pattern mirrors ApiService in lib/api_service.dart.

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../api_service.dart'; // reuses serverIp constant
import 'lab_models.dart';

class LabApiService {
  // Same host/port as all other API calls — the existing Django server.
  static String get _baseUrl => 'http://${ApiService.serverIp}:8000/api';

  /// Sends biomarkers to DeepSeek via the Django backend and returns insights.
  static Future<LabInsightsResponse> getInsights(
      List<Biomarker> biomarkers) async {
    final uri = Uri.parse('$_baseUrl/insights/');

    final response = await http
        .post(
          uri,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'biomarkers': biomarkers.map((b) => b.toJson()).toList(),
          }),
        )
        .timeout(
          const Duration(seconds: 120), // DeepSeek inference can take time
          onTimeout: () =>
              throw Exception('Request timed out — Ollama may still be loading the model.'),
        );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      return LabInsightsResponse.fromJson(data);
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Server error ${response.statusCode}');
    }
  }
}
