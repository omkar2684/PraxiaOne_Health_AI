import 'package:flutter/material.dart';
import '../../api_service.dart';
import '../../core/app_theme.dart';
import 'welcome_screen_v2.dart';
import 'health_score_screen.dart';
import 'login_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() { 
    super.initState(); 
    _check(); 
  }
  
  _check() async {
    await Future.delayed(const Duration(seconds: 1));
    final ok = await ApiService.isLoggedIn();
    if (mounted) {
      Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => ok ? HealthScoreScreen() : const WelcomeScreenV2()));
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white, 
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center, 
          children: [
            Image.asset(
              'public/welcome_screen/PraxiaOne_logo.png',
              height: 100,
              fit: BoxFit.contain,
            )
          ]
        )
      )
    );
  }
}
