import 'package:flutter/material.dart';
import '../../api_service.dart';
import 'package:url_launcher/url_launcher.dart';

class EditMedicalInfoScreen extends StatefulWidget {
  final Map<String, dynamic>? medicalData;
  final Map<String, dynamic>? profileData;

  const EditMedicalInfoScreen({Key? key, this.medicalData, this.profileData}) : super(key: key);

  @override
  State<EditMedicalInfoScreen> createState() => _EditMedicalInfoScreenState();
}

class _EditMedicalInfoScreenState extends State<EditMedicalInfoScreen> {
  late TextEditingController conditionsCtrl;
  late TextEditingController medsCtrl;
  late TextEditingController allergiesCtrl;
  String? dietPreference;

  @override
  void initState() {
    super.initState();
    conditionsCtrl = TextEditingController(text: widget.medicalData?['conditions'] ?? '');
    medsCtrl = TextEditingController(text: widget.medicalData?['medications_list'] ?? '');
    
    final pAllergies = widget.profileData?['allergies'];
    final mAllergies = widget.medicalData?['allergies_list'];
    final finalAllergies = (pAllergies != null && pAllergies.toString().isNotEmpty) 
        ? pAllergies 
        : (mAllergies ?? '');
    allergiesCtrl = TextEditingController(text: finalAllergies.toString());
    
    dietPreference = widget.profileData?['diet_preference']?.toString();
    if (dietPreference == null || dietPreference!.isEmpty) {
       dietPreference = 'Vegetarian';
    }
  }

  Future<void> _save() async {
    await ApiService.updateUserSettings({
      'profile': {
        'allergies': allergiesCtrl.text,
        'diet_preference': dietPreference,
      },
      'medical': {
        'conditions': conditionsCtrl.text,
        'medications_list': medsCtrl.text,
        'allergies_list': allergiesCtrl.text,
      }
    });
    if (mounted) Navigator.pop(context, true);
  }

  Future<void> _downloadPDF() async {
    final url = Uri.parse('http://192.168.29.189:8000/api/generate-pdf/?type=medical');
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    }
  }

  Widget _buildTextField(String label, TextEditingController ctrl, {int maxLines = 1, IconData? icon}) {
    return TextField(
      controller: ctrl,
      maxLines: maxLines,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: icon != null ? Icon(icon, color: Colors.blue.shade900) : null,
        filled: true,
        fillColor: Colors.grey.shade50,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade300)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade300)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.blue.shade900, width: 2)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F4F7),
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Card(
              color: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Health Profile', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.blue.shade900)),
                    const SizedBox(height: 16),
                    _buildTextField('Allergies (e.g., Peanuts, Dust)', allergiesCtrl, icon: Icons.warning_amber_rounded),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      value: ['Vegetarian', 'Non-Veg', 'Vegan', 'Keto'].contains(dietPreference) ? dietPreference : 'Vegetarian',
                      decoration: InputDecoration(
                        labelText: 'Dietary Preference',
                        prefixIcon: Icon(Icons.restaurant, color: Colors.blue.shade900),
                        filled: true,
                        fillColor: Colors.grey.shade50,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      items: ['Vegetarian', 'Non-Veg', 'Vegan', 'Keto'].map((String val) {
                        return DropdownMenuItem(value: val, child: Text(val));
                      }).toList(),
                      onChanged: (val) {
                        setState(() { dietPreference = val; });
                      },
                    ),
                    const SizedBox(height: 16),
                    _buildTextField('Pre-existing Conditions', conditionsCtrl, maxLines: 3, icon: Icons.healing),
                    const SizedBox(height: 16),
                    _buildTextField('Current Medications', medsCtrl, maxLines: 3, icon: Icons.medication),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _downloadPDF,
                icon: const Icon(Icons.picture_as_pdf, color: Colors.white),
                label: const Text('Download Medical PDF', style: TextStyle(color: Colors.white)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red.shade400,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
            const SizedBox(height: 32),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Cancel'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _save,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green.shade600,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Save Changes', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            )
          ],
        )
      )
    );
  }
}
