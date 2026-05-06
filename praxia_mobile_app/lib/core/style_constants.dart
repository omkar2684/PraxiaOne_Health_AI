import 'package:flutter/material.dart';

class StyleConstants {
  static const double borderRadius = 24.0;
  static const double paddingUnit = 16.0;
  
  static const Color primaryGreenStart = Color(0xFF0F766E);
  static const Color textMain = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF64748B);
  
  static const LinearGradient bgGradient = LinearGradient(colors: [Colors.white, Color(0xFFF8FAFC)]);

  static List<BoxShadow> softShadow = [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, 5))];

  static BoxDecoration boxDecoration = BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(16),
    border: Border.all(color: const Color(0xFFE2E8F0)),
  );
  
  static BoxDecoration cardShadowDecoration = BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(24),
    boxShadow: [
      BoxShadow(
        color: Colors.black.withOpacity(0.05), 
        blurRadius: 20, 
        offset: const Offset(0, 10)
      )
    ],
    border: Border.all(color: const Color(0xFFF1F5F9))
  );
}
