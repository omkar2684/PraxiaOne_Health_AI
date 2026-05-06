import 'package:flutter/material.dart';
import '../../api_service.dart';
import '../../core/app_theme.dart';
import '../components/praxia_button.dart';
import 'login_screen.dart';

class RegistrationScreen extends StatefulWidget {
  const RegistrationScreen({Key? key}) : super(key: key);
  @override State<RegistrationScreen> createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends State<RegistrationScreen> {
  final _fn = TextEditingController(text: '');
  final _ph = TextEditingController(text: '');
  final _em = TextEditingController(text: '');
  final _u = TextEditingController(text: '');
  final _p = TextEditingController(text: '');
  final _age = TextEditingController(text: '');
  final _al = TextEditingController(text: '');
  String _gender = 'Other';
  
  bool _l = false;
  String _err = '';

  _register() async {
    if (_u.text.trim().isEmpty || _p.text.trim().isEmpty || _em.text.trim().isEmpty) {
      setState(() => _err = 'Username, email and password are required');
      return;
    }

    setState(() { _l = true; _err = ''; });
    
    final userData = {
      'username': _u.text.trim(),
      'email': _em.text.trim(),
      'password': _p.text.trim(),
      'full_name': _fn.text.trim(),
      'phone_number': _ph.text.trim(),
      'allergies': _al.text.trim(),
      'age': _age.text.trim().isNotEmpty ? int.tryParse(_age.text.trim()) : null,
      'gender': _gender,
    };
    
    final r = await ApiService.register(userData);
    if (mounted) {
      if (r['success']) {
        // Auto-login after successful registration (optional, but matching web flow)
        final rl = await ApiService.login(_u.text.trim(), _p.text.trim());
        if (rl['success'] && mounted) {
          // Go to success screen, skip to login for now
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
        } else {
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
        }
      } else {
        setState(() { _l = false; _err = r['error'] ?? 'Registration failed'; });
      }
    }
  }

  Widget _buildField(String label, TextEditingController controller, {bool obscure = false, TextInputType? type}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: TextField(
        controller: controller, 
        obscureText: obscure,
        keyboardType: type,
        decoration: InputDecoration(
          labelText: label,
          filled: true,
          fillColor: const Color(0xFFF8FAFC),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
        )
      ),
    );
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
            colors: [ AppColors.primary.withOpacity(0.1), Colors.white ],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Container(
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [ BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 40, offset: const Offset(0, 10)) ],
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
                    const Text('Create Account', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.accent)),
                    const SizedBox(height: 8),
                    const Text('Join PraxiaOne and take control of your wellness data.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
                    const SizedBox(height: 24),
                    
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
                      
                    _buildField('Full Name', _fn),
                    _buildField('Phone Number', _ph, type: TextInputType.phone),
                    _buildField('Email', _em, type: TextInputType.emailAddress),
                    _buildField('Username', _u),
                    _buildField('Password', _p, obscure: true),
                    
                    Row(
                      children: [
                        Expanded(child: _buildField('Age', _age, type: TextInputType.number)),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.only(bottom: 16),
                            child: DropdownButtonFormField<String>(
                              value: _gender,
                              isExpanded: true,
                              decoration: InputDecoration(
                                labelText: 'Gender',
                                filled: true,
                                fillColor: const Color(0xFFF8FAFC),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                              ),
                              items: ['Male', 'Female', 'Other', 'Prefer not to say'].map((String value) {
                                return DropdownMenuItem<String>(value: value, child: Text(value));
                              }).toList(),
                              onChanged: (val) {
                                if (val != null) setState(() => _gender = val);
                              },
                            ),
                          ),
                        ),
                      ],
                    ),
                    
                    _buildField('Allergies (if any)', _al),
                    
                    const SizedBox(height: 8),
                    PraxiaButton(text: 'Sign Up', onPressed: _register, isLoading: _l),
                    
                    const SizedBox(height: 24),
                    const Row(children: [ Expanded(child: Divider()), Padding(padding: EdgeInsets.symmetric(horizontal: 16), child: Text('or continue with', style: TextStyle(color: Colors.grey))), Expanded(child: Divider()), ]),
                    const SizedBox(height: 24),
                    
                    OutlinedButton.icon(
                      onPressed: () {}, 
                      icon: const Icon(Icons.g_mobiledata, size: 28, color: Colors.red), 
                      label: const Text('Continue with Google', style: TextStyle(color: AppColors.text, fontWeight: FontWeight.bold)),
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
                        const Text("Already have an account?", style: TextStyle(color: Colors.grey)),
                        TextButton(
                          onPressed: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen())), 
                          child: const Text('Log in', style: TextStyle(color: Colors.lightBlue, fontWeight: FontWeight.bold))
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
