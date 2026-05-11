import 'package:flutter/material.dart';
import 're_test_trigger_screen.dart';
import '../widgets/app_drawer.dart';

class OutcomeSignalScreen extends StatelessWidget {
  const OutcomeSignalScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Outcome Signal', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFA7F3D0))),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                      child: const Icon(Icons.check, color: Color(0xFF059669), size: 28),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text("You're on track!", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF065F46))),
                          SizedBox(height: 4),
                          Text("Your actions are driving positive changes.", style: TextStyle(color: Color(0xFF065F46), fontSize: 13)),
                        ],
                      ),
                    )
                  ],
                ),
              ),
              const SizedBox(height: 32),
              const Text('Improvement So Far', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF1E293B))),
              const SizedBox(height: 4),
              const Text('(Compared to last week)', style: TextStyle(fontSize: 13, color: Color(0xFF64748B))),
              const SizedBox(height: 24),

              _buildSignalRow('Hemoglobin', '-5.2%', Colors.red.shade600, '13.5 - 17.5 g/dL'),
              const Padding(padding: EdgeInsets.symmetric(vertical: 12), child: Divider()),
              _buildSignalRow('HbA1c', '-0.4%', Colors.green.shade600, '4.0 - 5.6 %'),
              const Padding(padding: EdgeInsets.symmetric(vertical: 12), child: Divider()),
              _buildSignalRow('LDL Cholesterol', '-12%', Colors.green.shade600, '< 100 mg/dL'),

              const Spacer(),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(12)),
                child: const Text(
                  'Great job! Your biomarkers are moving towards normal ranges.',
                  style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const ReTestTriggerScreen()));
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1E3A8A), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                  child: const Text('Keep It Up!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSignalRow(String label, String value, Color valueColor, String normalRange) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
            Text(value, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: valueColor)),
          ],
        ),
        const SizedBox(height: 4),
        Text('Normal Range: $normalRange', style: const TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.w500)),
      ],
    );
  }
}
