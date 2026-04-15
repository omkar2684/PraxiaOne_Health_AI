import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFF10B981); // Emerald Green
  static const Color accent = Color(0xFF1E3A8A); // Navy Blue
  static const Color background = Color(0xFFFFFFFF);
  static const Color text = Color(0xFF0F172A);
  static const Color textMuted = Color(0xFF64748B);
  static const Color border = Color(0xFFF1F5F9);
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData.light().copyWith(
      scaffoldBackgroundColor: Colors.white,
      cardColor: Colors.white,
      primaryColor: AppColors.primary,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: AppColors.accent,
        elevation: 0,
      ),
      textTheme: const TextTheme(
        bodyLarge: TextStyle(fontSize: 18, color: AppColors.text),
        bodyMedium: TextStyle(fontSize: 16, color: AppColors.text),
        bodySmall: TextStyle(fontSize: 14, color: AppColors.textMuted),
        displayLarge: TextStyle(fontSize: 34, fontWeight: FontWeight.w900, color: AppColors.accent),
        displayMedium: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.accent),
        displaySmall: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: AppColors.accent),
        titleLarge: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: AppColors.accent),
        titleMedium: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.accent),
        labelLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.accent),
        labelSmall: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.accent),
      ),
    );
  }
}
