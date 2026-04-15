import 'package:flutter/material.dart';
import '../widgets/app_drawer.dart';
import 'login_screen.dart';
import '../../core/app_theme.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const AppDrawer(),
      appBar: AppBar(
        backgroundColor: Colors.white, 
        elevation: 0, 
        iconTheme: const IconThemeData(color: AppColors.accent),
      ),
      body: SafeArea(
        child: Column(
          children: [
            const Spacer(),
            // Refined Branding Header
            const Icon(Icons.monitor_heart_outlined, size: 64, color: AppColors.primary),
            const SizedBox(height: 12),
            const Text(
              'PraxiaOne', 
              style: TextStyle(
                fontSize: 34, 
                fontWeight: FontWeight.w900, 
                color: AppColors.accent,
                letterSpacing: -1.0,
              ),
            ),
            const SizedBox(height: 48),
            // Minimalist Slogan
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 40),
              child: Text(
                'Your health,\ncontinuously\nunderstood', 
                textAlign: TextAlign.center, 
                style: TextStyle(
                  fontSize: 28, 
                  fontWeight: FontWeight.w800, 
                  color: AppColors.accent, 
                  height: 1.2,
                ),
              ),
            ),
            const SizedBox(height: 60),
            // Primary Action
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 40),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.push(
                    context, 
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary, 
                    elevation: 4,
                    shadowColor: AppColors.primary.withOpacity(0.3),
                    padding: const EdgeInsets.symmetric(vertical: 20), 
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text(
                    'Get Started', 
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ),
              ),
            ),
            const Spacer(),
            // Trust Badges
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.shield_outlined, size: 14, color: Colors.grey.shade400),
                const SizedBox(width: 6),
                Text(
                  'Secure • Private • Connected', 
                  style: TextStyle(
                    color: Colors.grey.shade500, 
                    fontSize: 11, 
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}