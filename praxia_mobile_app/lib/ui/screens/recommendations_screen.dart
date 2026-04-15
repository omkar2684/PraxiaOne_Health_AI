import 'package:flutter/material.dart';
import '../../api_service.dart';
import '../../core/app_theme.dart';
import '../widgets/app_drawer.dart';
import 'health_score_screen.dart';
import 'journey_flow_screen.dart';

class RecommendationScreen extends StatefulWidget {
  const RecommendationScreen({Key? key}) : super(key: key);
  @override 
  State<RecommendationScreen> createState() => _RecommendationScreenState();
}

class _RecommendationScreenState extends State<RecommendationScreen> {
  List<dynamic> _recs = [];
  int _currentIndex = 0;
  bool _loading = true;
  bool _isStarting = false;
  Map<int, bool> _activePlans = {};

  final PageController _pageController = PageController();

  @override void initState() { super.initState(); _fetch(); }

  Future<void> _fetch() async {
    final recs = await ApiService.getRecommendations();
    if (mounted) {
      setState(() {
        _recs = recs ?? [];
        _loading = false;
      });
    }
  }

  void _startPlan(int id) async {
    setState(() => _isStarting = true);
    await ApiService.startRecommendation(id);
    if (mounted) setState(() { _isStarting = false; _activePlans[id] = true; });
  }

  IconData _getIcon(String? icon) {
    switch (icon) {
      case 'walk': return Icons.directions_run;
      case 'food': return Icons.restaurant;
      case 'sleep': return Icons.nightlight_round;
      default: return Icons.auto_awesome;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(backgroundColor: const Color(0xFFF2F4F7), drawer: const AppDrawer(), appBar: AppBar(backgroundColor: Colors.white, elevation: 0, iconTheme: const IconThemeData(color: Color(0xFF1D3B5A)), title: Image.asset('public/data_sources_screen/PraxiaOne_logo_data_sources.png', height: 36, fit: BoxFit.contain,), centerTitle: false,), body: const Center(child: CircularProgressIndicator()));
    }
    if (_recs.isEmpty) {
      return Scaffold(backgroundColor: const Color(0xFFF2F4F7), drawer: const AppDrawer(), appBar: AppBar(backgroundColor: Colors.white, elevation: 0, iconTheme: const IconThemeData(color: Color(0xFF1D3B5A)), title: Image.asset('public/data_sources_screen/PraxiaOne_logo_data_sources.png', height: 36, fit: BoxFit.contain,), centerTitle: false,), body: const Center(child: Text("No recommendations found.", style: TextStyle(color: Colors.grey))));
    }

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
      body: Column(
        children: [
          Expanded(
            child: PageView.builder(
              controller: _pageController,
              onPageChanged: (i) => setState(() => _currentIndex = i),
              itemCount: _recs.length,
              itemBuilder: (context, index) => _buildPlanCard(_recs[index]),
            ),
          ),
          _buildPagination(),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildPagination() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(_recs.length, (i) => Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        width: _currentIndex == i ? 24 : 8,
        height: 8,
        decoration: BoxDecoration(color: _currentIndex == i ? AppColors.primary : Colors.grey.shade300, borderRadius: BorderRadius.circular(10)),
      )),
    );
  }

  Widget _buildPlanCard(Map<String, dynamic> rec) {
    bool isActive = _activePlans[rec['id']] ?? false;
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Stack(
            alignment: Alignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: const Color(0xFFE8F5EF), width: 8)),
                child: Icon(_getIcon(rec['icon']), color: AppColors.primary, size: 48),
              ),
              if (isActive) 
                Positioned(bottom: 0, right: 0, child: const CircleAvatar(backgroundColor: Colors.green, radius: 14, child: Icon(Icons.check, color: Colors.white, size: 16))),
            ],
          ),
          const SizedBox(height: 32),
          Text(rec['title'] ?? '', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF1A2E35)), textAlign: TextAlign.center),
          const SizedBox(height: 12),
          Text(rec['subtitle'] ?? '', style: const TextStyle(fontSize: 16, color: Colors.grey, height: 1.4), textAlign: TextAlign.center),
          const SizedBox(height: 32),
          
          // Impact Card
          Container(
            decoration: BoxDecoration(color: const Color(0xFFFAFBFB), borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFF0F1F2))),
            child: Column(
              children: [
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  decoration: const BoxDecoration(color: Color(0xFFF8F9FA), border: Border(bottom: BorderSide(color: Color(0xFFF0F1F2)))),
                  child: Text('Impact in ${rec['impact_weeks']} weeks', textAlign: TextAlign.center, style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.bold, fontSize: 12)),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      Row(children: [
                        const Icon(Icons.arrow_upward, color: AppColors.primary, size: 20),
                        const SizedBox(width: 8),
                        Text('+${rec['impact_pts']} pts', style: const TextStyle(color: AppColors.primary, fontSize: 20, fontWeight: FontWeight.bold)),
                      ]),
                      Container(width: 1, height: 30, color: const Color(0xFFE2E8F0)),
                      Row(children: [
                        Text('${rec['impact_glucose']}% ', style: const TextStyle(color: AppColors.primary, fontSize: 20, fontWeight: FontWeight.bold)),
                        const Text('Glucose', style: TextStyle(color: Colors.grey, fontSize: 12)),
                      ]),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 32),
          
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: isActive ? () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const HealthScoreScreen())) : (_isStarting ? null : () => _startPlan(rec['id'])),
              style: ElevatedButton.styleFrom(
                backgroundColor: isActive ? const Color(0xFF047857) : AppColors.primary,
                padding: const EdgeInsets.symmetric(vertical: 18),
                elevation: 5,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: _isStarting ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : Text(isActive ? 'Active Plan - Check Home' : 'Start My Journey', style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            ),
          ),
          
          const SizedBox(height: 24),
          
          TextButton(
            onPressed: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const JourneyFlowScreen())), 
            child: const Text('Explore Other Actions', style: TextStyle(color: Colors.grey, decoration: TextDecoration.underline, fontWeight: FontWeight.bold))
          ),
          
          const SizedBox(height: 32),
          
          Container(
            padding: const EdgeInsets.all(24),
            width: double.infinity,
            decoration: BoxDecoration(color: const Color(0xFFF0F9F4), borderRadius: BorderRadius.circular(18)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Health Insight', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF047857))),
                const SizedBox(height: 8),
                Text(rec['description'] ?? '', style: const TextStyle(color: AppColors.primary, height: 1.5, fontSize: 14)),
              ],
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }
}
