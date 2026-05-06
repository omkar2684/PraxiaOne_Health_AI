import 'package:flutter/material.dart';
import '../../api_service.dart';

class EditContactDetailsScreen extends StatefulWidget {
  final Map<String, dynamic>? initialData;
  const EditContactDetailsScreen({Key? key, this.initialData}) : super(key: key);

  @override
  State<EditContactDetailsScreen> createState() => _EditContactDetailsScreenState();
}

class _EditContactDetailsScreenState extends State<EditContactDetailsScreen> {
  late TextEditingController phoneCtrl;
  late TextEditingController addressCtrl;
  late TextEditingController ageCtrl;
  late TextEditingController heightCtrl;
  late TextEditingController weightCtrl;

  @override
  void initState() {
    super.initState();
    phoneCtrl = TextEditingController(text: widget.initialData?['phone_number']?.toString() ?? '');
    addressCtrl = TextEditingController(text: widget.initialData?['address']?.toString() ?? '');
    ageCtrl = TextEditingController(text: widget.initialData?['age']?.toString() ?? '');
    heightCtrl = TextEditingController(text: widget.initialData?['height_cm']?.toString() ?? '');
    weightCtrl = TextEditingController(text: widget.initialData?['weight_kg']?.toString() ?? '');
  }

  Future<void> _save() async {
    await ApiService.updateUserSettings({
      'profile': {
        'phone_number': phoneCtrl.text,
        'address': addressCtrl.text,
        'age': int.tryParse(ageCtrl.text),
        'height_cm': double.tryParse(heightCtrl.text),
        'weight_kg': double.tryParse(weightCtrl.text),
      }
    });
    if (mounted) Navigator.pop(context, true);
  }

  Widget _buildTextField(String label, TextEditingController ctrl, {TextInputType type = TextInputType.text, IconData? icon}) {
    return TextField(
      controller: ctrl,
      keyboardType: type,
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
                    Text('Personal Information', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.blue.shade900)),
                    const SizedBox(height: 16),
                    _buildTextField('Phone Number', phoneCtrl, type: TextInputType.phone, icon: Icons.phone),
                    const SizedBox(height: 16),
                    _buildTextField('Physical Address', addressCtrl, icon: Icons.home),
                  ]
                )
              )
            ),
            const SizedBox(height: 16),
            Card(
              color: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Physical Metrics', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.blue.shade900)),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(child: _buildTextField('Age', ageCtrl, type: TextInputType.number, icon: Icons.cake)),
                        const SizedBox(width: 16),
                        Expanded(child: _buildTextField('Height (cm)', heightCtrl, type: TextInputType.number, icon: Icons.height)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    _buildTextField('Weight (kg)', weightCtrl, type: TextInputType.number, icon: Icons.monitor_weight),
                  ]
                )
              )
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
