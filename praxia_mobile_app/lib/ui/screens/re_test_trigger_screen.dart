import 'package:flutter/material.dart';
import '../widgets/app_drawer.dart';

class ReTestTriggerScreen extends StatelessWidget {
  const ReTestTriggerScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Re-Test Trigger', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu, color: Color(0xFF1D3B5A)),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
      ),
      drawer: const AppDrawer(),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 20),
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(color: const Color(0xFFEFF6FF), shape: BoxShape.circle),
                child: const Icon(Icons.edit_calendar_rounded, size: 50, color: Color(0xFF2563EB)),
              ),
              const SizedBox(height: 24),
              const Text('Next test recommended', style: TextStyle(fontSize: 16, color: Color(0xFF475569))),
              const SizedBox(height: 8),
              const Text('in 18 days', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Color(0xFF1E3A8A))),
              const SizedBox(height: 8),
              const Text('June 2, 2024', style: TextStyle(fontSize: 14, color: Color(0xFF64748B), fontWeight: FontWeight.w600)),
              const SizedBox(height: 40),

              _buildInfoCard(Icons.trending_up, 'Why retest?', 'To measure your progress and adjust your plan'),
              const SizedBox(height: 16),
              _buildInfoCard(Icons.science, "What we'll check", 'Track key biomarkers to see improvement'),

              const Spacer(),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Test booked successfully!')));
                    Navigator.popUntil(context, (route) => route.isFirst);
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1E3A8A), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                  child: const Text('Book Follow-Up Test', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoCard(IconData icon, String title, String subtitle) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF2563EB), size: 28),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF1E293B))),
                const SizedBox(height: 4),
                Text(subtitle, style: const TextStyle(fontSize: 13, color: Color(0xFF64748B))),
              ],
            ),
          )
        ],
      ),
    );
  }
}
