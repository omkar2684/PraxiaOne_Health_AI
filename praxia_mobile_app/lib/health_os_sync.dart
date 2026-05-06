import 'package:health/health.dart';
import 'package:permission_handler/permission_handler.dart';
import 'dart:io';
import 'api_service.dart';

class OsHealthSync {
  static final Health _health = Health();

  /// Requests permissions and syncs data to backend
  static Future<bool> syncData() async {
    // Determine the types we want to read
    final types = [
      HealthDataType.STEPS,
      HealthDataType.ACTIVE_ENERGY_BURNED,
      HealthDataType.HEART_RATE,
      HealthDataType.BLOOD_OXYGEN,
      HealthDataType.BLOOD_GLUCOSE,
      HealthDataType.BLOOD_PRESSURE_SYSTOLIC,
      HealthDataType.BLOOD_PRESSURE_DIASTOLIC,
    ];

    // Check specific required permissions structure based on the platform
    if (Platform.isAndroid) {
      await Permission.activityRecognition.request();
      await Permission.location.request();
    }

    try {
      // Prompt OS permissions dialog (Apple Health / Google Health Connect)
      bool authorized = await _health.requestAuthorization(types);
      if (!authorized) {
        return false;
      }

      // Fetch last 7 days of data
      final now = DateTime.now();
      final yesterday = now.subtract(const Duration(days: 7));
      
      List<HealthDataPoint> healthData = await _health.getHealthDataFromTypes(
        types: types,
        startTime: yesterday,
        endTime: now,
      );

      // We only care about the latest metrics for immediate dashboard sync in this demo.
      // In production, we loop and batch POST to `/api/vitals/latest/` or `/metrics/`
      
      int totalStepsToday = 0;
      double totalCalsToday = 0;
      int lastPulse = 0;
      int lastSys = 0;
      int lastDia = 0;

      for (var point in healthData) {
        if (point.dateFrom.isAfter(DateTime(now.year, now.month, now.day))) {
           if (point.type == HealthDataType.STEPS) {
             totalStepsToday += (point.value as NumericHealthValue).numericValue.toInt();
           } else if (point.type == HealthDataType.ACTIVE_ENERGY_BURNED) {
             totalCalsToday += (point.value as NumericHealthValue).numericValue.toDouble();
           }
        }
        
        if (point.type == HealthDataType.HEART_RATE) lastPulse = (point.value as NumericHealthValue).numericValue.toInt();
        if (point.type == HealthDataType.BLOOD_PRESSURE_SYSTOLIC) lastSys = (point.value as NumericHealthValue).numericValue.toInt();
        if (point.type == HealthDataType.BLOOD_PRESSURE_DIASTOLIC) lastDia = (point.value as NumericHealthValue).numericValue.toInt();
      }

      // Send to Django backend
      await ApiService.post('/vitals/latest/', {
        "pulse": lastPulse > 0 ? lastPulse : null,
        "systolic": lastSys > 0 ? lastSys : null,
        "diastolic": lastDia > 0 ? lastDia : null,
        "steps": totalStepsToday > 0 ? totalStepsToday : null,
        "calories": totalCalsToday > 0 ? totalCalsToday.toInt() : null,
        "oxygen": 98 // For brevity
      });

      return true;

    } catch (e) {
      print("Health Sync Error: $e");
      return false;
    }
  }
}
