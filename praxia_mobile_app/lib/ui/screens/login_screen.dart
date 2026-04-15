import 'package:flutter/material.dart';
import '../../api_service.dart';
import '../../core/app_theme.dart';
import 'data_sources_screen.dart';
import 'registration_screen.dart';
import '../components/praxia_button.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);
  @override State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _u = TextEditingController(text: '');
  final _p = TextEditingController(text: '');
  bool _l = false;
  String _err = '';

  _login() async {
    if (_u.text.trim().isEmpty || _p.text.trim().isEmpty) {
      setState(() => _err = 'Please enter username and password');
      return;
    }

    setState(() { _l = true; _err = ''; });
    final r = await ApiService.login(_u.text.trim(), _p.text.trim());
    if (mounted) {
      if (r['success']) {
        Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const DataSourcesScreen()));
      } else {
        setState(() { _l = false; _err = r['error'] ?? 'Login failed'; });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              AppColors.primary.withOpacity(0.1),
              Colors.white,
            ],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(32),
              child: Container(
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 40, offset: const Offset(0, 10))
                  ],
                  border: Border.all(color: Colors.grey.withOpacity(0.2)),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Image.asset(
                      'public/welcome_screen/PraxiaOne_logo.png',
                      height: 60,
                      fit: BoxFit.contain,
                    ),
                    const SizedBox(height: 10),
                    const Text('Welcome Back', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.accent)),
                    const SizedBox(height: 8),
                    const Text('Log in to your PraxiaOne account', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
                    const SizedBox(height: 32),
                    
                    if (_err.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.all(12),
                        margin: const EdgeInsets.only(bottom: 20),
                        decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(8)),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline, color: Colors.red, size: 20),
                            const SizedBox(width: 8),
                            Expanded(child: Text(_err, style: const TextStyle(color: Colors.red, fontSize: 13))),
                          ],
                        ),
                      ),
                      
                    TextField(
                      controller: _u, 
                      decoration: InputDecoration(
                        labelText: 'Username',
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      )
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _p, 
                      obscureText: true, 
                      decoration: InputDecoration(
                        labelText: 'Password',
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      )
                    ),
                    const SizedBox(height: 8),
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton(
                        onPressed: () {}, 
                        child: const Text('Forgot password?', style: TextStyle(color: AppColors.text, fontWeight: FontWeight.bold))
                      ),
                    ),
                    const SizedBox(height: 20),
                    PraxiaButton(text: 'Log In', onPressed: _login, isLoading: _l),
                    
                    const SizedBox(height: 24),
                    const Row(children: [ Expanded(child: Divider()), Padding(padding: EdgeInsets.symmetric(horizontal: 16), child: Text('or continue with', style: TextStyle(color: Colors.grey))), Expanded(child: Divider()), ]),
                    const SizedBox(height: 24),
                    
                    OutlinedButton.icon(
                      onPressed: () {}, 
                      icon: const Icon(Icons.g_mobiledata, size: 28, color: Colors.red), 
                      label: const Text('Log in with Google', style: TextStyle(color: AppColors.text, fontWeight: FontWeight.bold)),
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        side: BorderSide(color: Colors.grey.shade300)
                      ),
                    ),
                    const SizedBox(height: 12),
                    OutlinedButton.icon(
                      onPressed: () {}, 
                      icon: const Icon(Icons.facebook, size: 24, color: Colors.blue), 
                      label: const Text('Log in with Facebook', style: TextStyle(color: AppColors.text, fontWeight: FontWeight.bold)),
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        side: BorderSide(color: Colors.grey.shade300)
                      ),
                    ),
                    
                    const SizedBox(height: 32),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text("Don't have an account?", style: TextStyle(color: Colors.grey)),
                        TextButton(
                          onPressed: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const RegistrationScreen())), 
                          child: const Text('Sign up', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold))
                        )
                      ],
                    )
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
