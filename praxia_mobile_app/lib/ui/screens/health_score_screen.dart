import 'package:flutter/material.dart';
import '../../api_service.dart';
import '../../core/app_theme.dart';
import '../widgets/app_drawer.dart';
import '../components/painters.dart';
import '../components/praxia_card.dart';
import '../components/metrics_widgets.dart';
import '../components/praxia_button.dart';
import 'vitals_detail_screen.dart';

class HealthScoreScreen extends StatefulWidget {
  const HealthScoreScreen({Key? key}) : super(key: key);
  @override State<HealthScoreScreen> createState() => _HealthScoreScreenState();
}

class _HealthScoreScreenState extends State<HealthScoreScreen> with SingleTickerProviderStateMixin {
  bool _isLoading = true;
  int _score = 0;
  String _level = '';
  Map<String, dynamic> _vitals = {};
  List<dynamic> _glucoseTrend = [];
  List<dynamic> _activityTrend = [];
  List<dynamic> _carePlan = [];
  int _currentIndex = 0;
  
  late AnimationController _anim;
  late Animation<double> _scoreAnim;
  
  @override
  void initState() {
    super.initState();
    _anim = AnimationController(vsync: this, duration: const Duration(milliseconds: 1500));
    _scoreAnim = Tween<double>(begin: 0, end: 0).animate(CurvedAnimation(parent: _anim, curve: Curves.easeOutCubic));
    _loadData();
  }
  
  @override
  void dispose() {
    _anim.dispose();
    super.dispose();
  }
  
  Future<void> _loadData() async {
    final sData = await ApiService.getHealthScore();
    final vData = await ApiService.getVitals();
    
    if (mounted) {
      setState(() {
        _score = sData['score'] ?? 0;
        _level = sData['level'] ?? 'Unknown';
        _glucoseTrend = sData['glucose_trend'] ?? [110, 115, 128, 120, 118, 114, 118];
        _activityTrend = sData['activity_trend'] ?? [4000, 5200, 4800, 6100, 6500, 5900, 6240];
        _carePlan = sData['care_plan'] ?? [];
        _vitals = vData;
        _isLoading = false;
        _scoreAnim = Tween<double>(begin: 0, end: _score / 100.0).animate(CurvedAnimation(parent: _anim, curve: Curves.easeOutCubic));
      });
      _anim.forward();
    }
  }

  void _showScoreBreakdown(BuildContext context) {
    bool isGoodSleep = (_vitals['sleep_hours']?.toString().contains('7') ?? false) || (_vitals['sleep_hours']?.toString().contains('8') ?? false);
    bool isGoodActivity = (_vitals['steps'] != null && _vitals['steps'] > 5000);
    bool isGoodVitals = (_vitals['glucose'] != null && _vitals['glucose'] < 140);

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Score Breakdown', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.accent)),
            const SizedBox(height: 16),
            const Text('Your Health Intelligence Score is calculated based on clinical stability and daily adherence.', style: TextStyle(color: Colors.grey, fontSize: 13)),
            const SizedBox(height: 24),
            _breakdownRow(isGoodSleep ? Icons.check_circle : Icons.warning, isGoodSleep ? Colors.green : Colors.orange, 'Sleep Consistency', isGoodSleep ? '+15 pts' : '-5 pts'),
            _breakdownRow(isGoodActivity ? Icons.check_circle : Icons.warning, isGoodActivity ? Colors.green : Colors.orange, 'Activity Levels', isGoodActivity ? '+10 pts' : '-10 pts'),
            _breakdownRow(isGoodVitals ? Icons.check_circle : Icons.warning, isGoodVitals ? Colors.green : Colors.orange, 'Vitals Stability', isGoodVitals ? '+15 pts' : '-10 pts'),
            const SizedBox(height: 20),
            PraxiaButton(text: 'Got it', onPressed: () => Navigator.pop(context)),
          ],
        ),
      ),
    );
  }

  Widget _breakdownRow(IconData icon, Color color, String title, String points) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(width: 12),
          Expanded(child: Text(title, style: const TextStyle(fontWeight: FontWeight.w600))),
          Text(points, style: TextStyle(color: color, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  void _scrollToFactor(String factor) {
    Navigator.push(context, MaterialPageRoute(builder: (_) => VitalsDetailScreen(title: factor, value: '${_vitals[factor.toLowerCase()] ?? '--'}')));
  }

  String _getInsight() {
    if (_score > 80) return "You're doing excellent! Maintain your consistent sleep for optimal recovery.";
    if (_vitals['glucose'] != null && _vitals['glucose'] > 130) return "Your glucose is slightly high. A short walk might help stabilize it.";
    return "Stable day! Keep tracking your activity to reach your weekly goal.";
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
      drawer: const AppDrawer(),
      body: SafeArea(
        child: IndexedStack(
          index: _currentIndex,
          children: [
            RefreshIndicator(onRefresh: _loadData, child: _buildOverview()),
            RefreshIndicator(onRefresh: _loadData, child: _buildTrends()),
            RefreshIndicator(onRefresh: _loadData, child: _buildCare()),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        elevation: 10,
        backgroundColor: Colors.white,
        selectedItemColor: const Color(0xFF2E7D5E),
        unselectedItemColor: Colors.grey,
        selectedFontSize: 12,
        unselectedFontSize: 12,
        type: BottomNavigationBarType.fixed,
        currentIndex: _currentIndex,
        onTap: (i) => setState(() => _currentIndex = i),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_filled), label: 'Dashboard'),
          BottomNavigationBarItem(icon: Icon(Icons.bar_chart_rounded), label: 'Trends'),
          BottomNavigationBarItem(icon: Icon(Icons.calendar_today_rounded), label: 'Care'),
        ],
      ),
    );
  }

  Widget _buildOverview() {
    if (_isLoading) return const Center(child: CircularProgressIndicator(color: AppColors.primary));
    
    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      child: Column(
        children: [
          const SizedBox(height: 50),
          const Text('Your Health Score', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
          const SizedBox(height: 20),
          // MAIN GAUGE CARD
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 24),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, 10))],
              border: Border.all(color: const Color(0xFFF1F5F9))
            ),
            child: Column(
              children: [
                Stack(
                  alignment: Alignment.center,
                  children: [
                    SizedBox(width: 220, height: 220, child: AnimatedBuilder(
                      animation: _scoreAnim,
                      builder: (context, child) => CustomPaint(painter: GaugePainter(_scoreAnim.value)),
                    )),
                    Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('${(_scoreAnim.value * 100).toInt()}', style: const TextStyle(fontSize: 72, fontWeight: FontWeight.w900, color: Color(0xFF1E293B))),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text('/100', style: TextStyle(fontSize: 20, color: Colors.grey, fontWeight: FontWeight.w600)),
                            IconButton(onPressed: () => _showScoreBreakdown(context), icon: const Icon(Icons.info_outline, size: 20, color: AppColors.primary)),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 8),
                  decoration: BoxDecoration(color: const Color(0xFF10B981), borderRadius: BorderRadius.circular(100)),
                  child: Text(_level, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          // DYNAMIC INSIGHT CARD
          Container(
             margin: const EdgeInsets.symmetric(horizontal: 24),
             padding: const EdgeInsets.all(16),
             decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(16)),
             child: Row(children: [
               const Icon(Icons.auto_awesome, color: Color(0xFF059669), size: 20),
               const SizedBox(width: 12),
               Expanded(child: Text(_getInsight(), style: const TextStyle(color: Color(0xFF065F46), fontWeight: FontWeight.w600, fontSize: 13))),
             ]),
          ),
          const SizedBox(height: 32),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Key Factors', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                const SizedBox(height: 16),
                PraxiaBox(children: [
                  PraxiaMetric(Icons.circle_outlined, Colors.orange, 'Glucose', '${_vitals['glucose'] ?? '--'} mg/dL', statusWidget: const Icon(Icons.circle, color: Colors.orange, size: 12), onTap: () => _scrollToFactor('Glucose')),
                  PraxiaMetric(Icons.directions_run, Colors.green, 'Activity', '${_vitals['steps'] ?? '--'} /100', statusWidget: const Icon(Icons.arrow_upward, color: Colors.green, size: 16), onTap: () => _scrollToFactor('Activity')),
                  PraxiaMetric(Icons.nightlight_round, Colors.blue, 'Sleep', '${_vitals['sleep_hours'] ?? '--'}', statusWidget: const Icon(Icons.check_circle, color: Colors.green, size: 16), last: true, onTap: () => _scrollToFactor('Sleep')),
                ]),
              ],
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildTrends() {
    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 20),
          const Text('Health Trends', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const Text('Last 7 Days Analysis', style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 30),
          const Text('Glucose Stability', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 16),
          PraxiaBox(padding: 20, children: [
            SizedBox(height: 180, width: double.infinity, child: CustomPaint(painter: LineChartPainter(_glucoseTrend.map((e) => (e as num).toDouble()).toList(), Colors.orange))),
          ]),
          const SizedBox(height: 30),
          const Text('Activity Progression', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 16),
          PraxiaBox(padding: 20, children: [
            SizedBox(height: 180, width: double.infinity, child: CustomPaint(painter: LineChartPainter(_activityTrend.map((e) => (e as num).toDouble()).toList(), Colors.green))),
          ]),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildCare() {
    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          const SizedBox(height: 20),
          const Icon(Icons.favorite, color: Colors.red, size: 60),
          const SizedBox(height: 20),
          const Text('Care Plan', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const Text('Your personalized clinical roadmap', style: TextStyle(color: Colors.grey), textAlign: TextAlign.center),
          const SizedBox(height: 30),
          PraxiaBox(padding: 20, children: [
            const Text('Action Required', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            const SizedBox(height: 12),
            const Text('Your glucose trend is slightly elevated compared to last month. Consider a consultation with Dr. Smith.', style: TextStyle(height: 1.4)),
            const SizedBox(height: 20),
            PraxiaButton(text: 'Message My Provider', onPressed: () {}),
          ]),
          const SizedBox(height: 20),
          PraxiaBox(padding: 20, children: [
            const Text('Active Goals', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            const SizedBox(height: 12),
            if (_carePlan.isEmpty)
              const Text('No active goals currently.', style: TextStyle(color: Colors.grey)),
            for (var i = 0; i < _carePlan.length; i++)
              PraxiaJourneyStep(i + 1, _carePlan[i]['title'] ?? '', _carePlan[i]['description'] ?? '', _carePlan[i]['completed'] == true),
          ]),
        ],
      ),
    );
  }
}
