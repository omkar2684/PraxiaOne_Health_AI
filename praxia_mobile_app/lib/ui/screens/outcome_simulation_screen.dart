import 'package:flutter/material.dart';
import 'outcome_signal_screen.dart';

class OutcomeSimulationScreen extends StatelessWidget {
  final Map<String, dynamic> projection;

  const OutcomeSimulationScreen({Key? key, required this.projection}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final biomarkers = projection['biomarkers'] as List? ?? [];

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Outcome Simulation', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('If you stay on track', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF1E293B))),
              const SizedBox(height: 8),
              const Text('Projected Improvement by Next Test (in ~18 days)', style: TextStyle(fontSize: 14, color: Color(0xFF64748B))),
              const SizedBox(height: 24),

              Expanded(
                child: ListView.builder(
                  itemCount: biomarkers.length,
                  itemBuilder: (context, index) {
                    final b = biomarkers[index];
                    final isUp = b['trend'] == 'up';
                    final color = isUp ? Colors.green.shade600 : Colors.blue.shade600;
                    
                    return Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 4))],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Icon(isUp ? Icons.arrow_upward : Icons.arrow_downward, color: color, size: 20),
                                  const SizedBox(width: 8),
                                  Text(b['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                ],
                              ),
                              Text(b['improvement'], style: TextStyle(fontWeight: FontWeight.bold, color: color, fontSize: 16)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text('(${b['from_to']})', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                          const SizedBox(height: 12),
                          Stack(
                            children: [
                              Container(height: 6, decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(3))),
                              Container(height: 6, width: 200, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(3))),
                            ],
                          )
                        ],
                      ),
                    );
                  },
                ),
              ),

              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(12)),
                child: Text(
                  projection['subtext'] ?? 'Projections are personalized estimates based on your current data, plan and adherence.',
                  style: const TextStyle(fontSize: 12, color: Color(0xFF475569)),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const OutcomeSignalScreen()));
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1E3A8A), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                  child: const Text('Next: Outcome Signal', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
