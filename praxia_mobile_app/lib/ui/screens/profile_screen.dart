import 'package:flutter/material.dart';
import '../../api_service.dart';
import '../../core/app_theme.dart';
import '../widgets/app_drawer.dart';
import '../components/praxia_button.dart';
import 'settings_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);
  @override State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isLoading = true;
  String _fullName = '';
  String _age = '';
  String _height = '';
  String _weight = '';
  String _phone = '';
  String _allergies = '';
  String _diet = 'Vegetarian';
  String _notes = '';
  String _photoUrl = '';

  @override void initState() { super.initState(); _fetchData(); }

  Future<void> _fetchData() async {
    final data = await ApiService.getProfile();
    if (mounted && data != null) {
      setState(() {
        _fullName = data['full_name'] ?? '';
        _age = data['age']?.toString() ?? '';
        _height = data['height_cm']?.toString() ?? '';
        _weight = data['weight_kg']?.toString() ?? '';
        _phone = data['phone_number'] ?? '';
        _allergies = data['allergies'] ?? '';
        _diet = data['diet_preference'] ?? 'Vegetarian';
        _notes = data['notes'] ?? '';
        _photoUrl = data['profile_picture'] ?? '';
        _isLoading = false;
      });
    } else if (mounted) {
      setState(() => _isLoading = false);
    }
  }
  
  double get _bmi {
    final h = double.tryParse(_height);
    final w = double.tryParse(_weight);
    if (h == null || w == null || h <= 0) return 0.0;
    return w / ((h / 100) * (h / 100));
  }

  String get _bmiLabel {
    final b = _bmi;
    if (b <= 0) return "--";
    if (b < 18.5) return "Underweight";
    if (b < 25) return "Normal";
    if (b < 30) return "Overweight";
    return "Obese";
  }
  
  int get _completeness {
    int score = 0;
    if (_fullName.isNotEmpty) score += 20;
    if (_age.isNotEmpty) score += 10;
    if (_height.isNotEmpty) score += 10;
    if (_weight.isNotEmpty) score += 10;
    if (_phone.isNotEmpty) score += 20;
    if (_allergies.isNotEmpty) score += 10;
    if (_notes.isNotEmpty) score += 20;
    return score;
  }

  Widget _buildRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          Text(value.isEmpty ? '--' : value, style: const TextStyle(color: Colors.grey, fontSize: 13, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F4F7),
      drawer: const AppDrawer(),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Color(0xFF1D3B5A)),
        title: Image.asset(
          'public/data_sources_screen/PraxiaOne_logo_data_sources.png',
          height: 36,
          fit: BoxFit.contain,
        ),
        centerTitle: false,
      ),
      body: _isLoading ? const Center(child: CircularProgressIndicator()) : SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // Header Card
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.withOpacity(0.2)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: Colors.blue.shade50, borderRadius: BorderRadius.circular(8)), child: const Row(children: [Icon(Icons.bolt, size: 14, color: Colors.blue), SizedBox(width: 4), Text('AI-ready profile', style: TextStyle(fontSize: 10, color: Colors.blue, fontWeight: FontWeight.bold))])),
                      const SizedBox(width: 8),
                      Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: Colors.purple.shade50, borderRadius: BorderRadius.circular(8)), child: const Row(children: [Icon(Icons.verified_user, size: 14, color: Colors.purple), SizedBox(width: 4), Text('Server-backed', style: TextStyle(fontSize: 10, color: Colors.purple, fontWeight: FontWeight.bold))])),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text('Saved to server so other modules can use it with consent.', style: TextStyle(color: Colors.grey, fontSize: 12)),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      const Text('Completeness', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      const Spacer(),
                      Text('$_completeness%', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  LinearProgressIndicator(value: _completeness / 100, backgroundColor: Colors.grey.shade200, color: AppColors.primary),
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Basic Details List
            Container(
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.withOpacity(0.2))),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.05), borderRadius: const BorderRadius.vertical(top: Radius.circular(16)), border: Border(bottom: BorderSide(color: Colors.grey.withOpacity(0.2)))),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Basic details', style: TextStyle(fontWeight: FontWeight.bold)),
                        Text('Tip: More details → better insights', style: TextStyle(fontSize: 10, color: Colors.grey)),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        Center(
                          child: Stack(
                            children: [
                              CircleAvatar(radius: 40, backgroundImage: _photoUrl.isNotEmpty ? NetworkImage(_photoUrl) : null, backgroundColor: Colors.grey.shade200, child: _photoUrl.isEmpty ? const Icon(Icons.person, size: 40, color: Colors.grey) : null),
                              Positioned(bottom: 0, right: 0, child: CircleAvatar(radius: 14, backgroundColor: AppColors.primary, child: const Icon(Icons.camera_alt, size: 14, color: Colors.white))),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),
                        _buildRow('Full Name', _fullName),
                        _buildRow('Age', _age),
                        _buildRow('Height (cm)', _height),
                        _buildRow('Weight (kg)', _weight),
                        _buildRow('Phone', _phone),
                        _buildRow('Allergies', _allergies),
                        
                        const SizedBox(height: 16),
                        const Align(alignment: Alignment.centerLeft, child: Text('Diet preference', style: TextStyle(fontSize: 12, color: Colors.grey))),
                        const SizedBox(height: 8),
                        Align(
                          alignment: Alignment.centerLeft,
                          child: Wrap(
                            spacing: 8,
                            children: ['Vegetarian', 'Non-Veg', 'Vegan'].map((d) => 
                              Chip(
                                label: Text(d, style: TextStyle(color: _diet == d ? Colors.white : Colors.black, fontSize: 12, fontWeight: FontWeight.bold)), 
                                backgroundColor: _diet == d ? AppColors.primary : Colors.grey.shade100,
                                padding: EdgeInsets.zero,
                              )
                            ).toList(),
                          ),
                        ),
                        const SizedBox(height: 16),
                        const Align(alignment: Alignment.centerLeft, child: Text('Notes / Preferences', style: TextStyle(fontSize: 12, color: Colors.grey))),
                        const SizedBox(height: 4),
                        Align(alignment: Alignment.centerLeft, child: Text(_notes.isEmpty ? '--' : _notes, style: const TextStyle(fontSize: 13))),
                        
                        const Padding(padding: EdgeInsets.symmetric(vertical: 16), child: Divider()),
                        
                        PraxiaButton(text: 'Edit Profile in Settings', onPressed: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const SettingsScreen())), outline: true),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            
            // BMI Card
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.withOpacity(0.2))),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Your profile preview', style: TextStyle(fontWeight: FontWeight.bold)),
                  const Text('BMI + diet summary', style: TextStyle(fontSize: 12, color: Colors.grey)),
                  const Divider(height: 32),
                  _buildRow('Name', _fullName),
                  _buildRow('Diet', _diet),
                  _buildRow('BMI', _bmi > 0 ? _bmi.toStringAsFixed(1) : '--'),
                  _buildRow('BMI Category', _bmiLabel),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), border: Border.all(color: AppColors.primary.withOpacity(0.2))),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Insight hint:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                        Text(_bmi > 0 && _bmi < 25 ? 'Great baseline — maintain consistency.' : 'Small changes = big wins.', style: const TextStyle(fontSize: 11)),
                      ],
                    ),
                  )
                ],
              ),
            ),
            
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
