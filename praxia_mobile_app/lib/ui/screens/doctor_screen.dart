import 'package:flutter/material.dart';
import '../widgets/app_drawer.dart';
import '../../core/app_theme.dart';
import 'assistant_screen_v2.dart';
import 'message_screen.dart';

class DoctorScreen extends StatefulWidget {
  const DoctorScreen({super.key});

  @override
  State<DoctorScreen> createState() => _DoctorScreenState();
}

class _DoctorScreenState extends State<DoctorScreen> {
  final List<Map<String, String>> _doctors = [
    {
      'name': 'Dr. James Smith',
      'specialty': 'Internal Medicine',
      'image': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
    },
    {
      'name': 'Dr. Sarah Chen',
      'specialty': 'Endocrinology',
      'image': 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200',
    },
    {
      'name': 'Dr. Michael Ross',
      'specialty': 'Cardiology',
      'image': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
    },
    {
      'name': 'Dr. Elena Rodriguez',
      'specialty': 'Neurology',
      'image': 'https://images.unsplash.com/photo-1559839734-2b71f1536bcd?auto=format&fit=crop&q=80&w=200',
    },
  ];

  int _selectedIndex = 0;

  void _bookVisit() {
    final doctor = _doctors[_selectedIndex]['name'];
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Visit requested! $doctor will confirm shortly.'),
        backgroundColor: AppColors.primary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  void _messageDoctor() {
    final doc = _doctors[_selectedIndex];
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => MessageScreen(
          doctorName: doc['name']!,
          doctorImage: doc['image']!,
        ),
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(vertical: 20),
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.emergency_outlined, color: AppColors.primary, size: 40),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'Time to Connect', 
                    style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: Color(0xFF1E293B), letterSpacing: -0.5),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Choose a provider below to review your latest health trends and vitals.', 
                    textAlign: TextAlign.center, 
                    style: TextStyle(color: Color(0xFF64748B), fontSize: 14, height: 1.5),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            SizedBox(
              height: 180,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 24),
                itemCount: _doctors.length,
                itemBuilder: (context, index) => _buildDoctorItem(index),
              ),
            ),
            const SizedBox(height: 32),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Column(
                children: [
                  _Btn('Book Visit', _bookVisit),
                  const SizedBox(height: 12),
                  _Btn('Message Specialist', _messageDoctor, outline: true),
                  const SizedBox(height: 20),
                  Text(
                    "Selected: ${_doctors[_selectedIndex]['name']}",
                    style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "Typically responds within 2 hours",
                    style: TextStyle(color: Colors.grey.shade500, fontSize: 11, fontStyle: FontStyle.italic),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDoctorItem(int index) {
    final doc = _doctors[index];
    bool isSelected = _selectedIndex == index;

    return GestureDetector(
      onTap: () => setState(() => _selectedIndex = index),
      child: Container(
        width: 160,
        margin: const EdgeInsets.only(right: 16, bottom: 8),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isSelected ? AppColors.primary : const Color(0xFFE2E8F0),
            width: isSelected ? 2 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: isSelected ? AppColors.primary.withOpacity(0.1) : Colors.black.withOpacity(0.04),
              blurRadius: 15,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          children: [
            Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: isSelected ? AppColors.primary : Colors.transparent, width: 2),
              ),
              child: CircleAvatar(
                radius: 30,
                backgroundImage: NetworkImage(doc['image']!),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              doc['name']!,
              textAlign: TextAlign.center,
              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: Color(0xFF1E293B)),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),
            Text(
              doc['specialty']!,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
            ),
          ],
        ),
      ),
    );
  }

  Widget _Btn(String t, VoidCallback o, {bool outline = false}) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: o,
        style: ElevatedButton.styleFrom(
          backgroundColor: outline ? Colors.white : AppColors.primary,
          foregroundColor: outline ? const Color(0xFF1E293B) : Colors.white,
          side: outline ? BorderSide(color: Colors.grey.shade200, width: 2) : null,
          elevation: outline ? 0 : 4,
          shadowColor: AppColors.primary.withOpacity(0.3),
          padding: const EdgeInsets.symmetric(vertical: 18),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        child: Text(t, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800)),
      ),
    );
  }
}
