import 'package:flutter/material.dart';
import 'outcome_signal_screen.dart';
import '../widgets/app_drawer.dart';

import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class OutcomeSimulationScreen extends StatefulWidget {
  final Map<String, dynamic> projection;

  const OutcomeSimulationScreen({Key? key, required this.projection}) : super(key: key);

  @override
  State<OutcomeSimulationScreen> createState() => _OutcomeSimulationScreenState();
}

class _OutcomeSimulationScreenState extends State<OutcomeSimulationScreen> {
  Map<String, dynamic>? _projection;
  bool _isLoadingCache = false;

  @override
  void initState() {
    super.initState();
    if (widget.projection.isEmpty) {
      _loadCache();
    } else {
      _projection = Map.from(widget.projection);
      _saveCache(widget.projection);
    }
  }

  Future<void> _loadCache() async {
    setState(() => _isLoadingCache = true);
    final sp = await SharedPreferences.getInstance();
    final cached = sp.getString('cached_lab_insights');
    if (cached != null) {
      final decoded = jsonDecode(cached);
      setState(() {
        _projection = decoded['projection'];
        _isLoadingCache = false;
      });
    } else {
      setState(() {
        _projection = {};
        _isLoadingCache = false;
      });
    }
  }

  Future<void> _saveCache(Map<String, dynamic> proj) async {
    final sp = await SharedPreferences.getInstance();
    final cached = sp.getString('cached_lab_insights');
    if (cached != null) {
      final decoded = Map<String, dynamic>.from(jsonDecode(cached));
      decoded['projection'] = proj;
      await sp.setString('cached_lab_insights', jsonEncode(decoded));
    } else {
      await sp.setString('cached_lab_insights', jsonEncode({'projection': proj}));
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoadingCache) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    final biomarkers = (_projection?['biomarkers'] as List?) ?? [];

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Outcome Simulation', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu, color: Color(0xFF1D3B5A)),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.black87),
            onPressed: () => Navigator.popUntil(context, (route) => route.isFirst),
          ),
        ],
      ),
      drawer: const AppDrawer(),
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
                  _projection?['subtext'] ?? 'Projections are personalized estimates based on your current data, plan and adherence.',
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
