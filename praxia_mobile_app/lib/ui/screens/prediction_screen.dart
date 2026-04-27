import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../widgets/app_drawer.dart';
import '../components/praxia_button.dart';
import '../components/gauge_painter.dart';
import '../components/praxia_teammate_widgets.dart';
import 'recommendations_screen.dart';

import '../../api_service.dart';

class ForecastScreen extends StatefulWidget {
  const ForecastScreen({Key? key}) : super(key: key);
  @override
  State<ForecastScreen> createState() => _ForecastScreenState();
}

class _ForecastScreenState extends State<ForecastScreen> {
  Map<String, dynamic>? _forecastData;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadForecast();
  }

  Future<void> _loadForecast() async {
    final data = await ApiService.getForecast();
    if (mounted) {
      setState(() {
        _forecastData = data;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        drawer: const AppDrawer(),
        appBar: AppBar(title: const Text('Health Projection', style: TextStyle(color: AppColors.accent))),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final scoreStr = _forecastData?['forecast_score']?.toString() ?? '72';
    final recommendations = _forecastData?['recommendations'] as List<dynamic>? ?? [];
    final detailCard = _forecastData?['detail_card'] ?? {};

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      drawer: const AppDrawer(),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppColors.accent),
        title: Image.asset(
          'public/data_sources_screen/PraxiaOne_logo_data_sources.png',
          height: 36,
          fit: BoxFit.contain,
        ),
        centerTitle: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // PROJECTION CARDS
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 4))],
                      border: Border.all(color: Colors.red.shade100, width: 2),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Current Trend', style: TextStyle(fontSize: 14, color: Colors.grey, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Text(
                          _forecastData?['projection_current_trend'] ?? '+32% metabolic risk (9 months)',
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.red),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 4))],
                      border: Border.all(color: Colors.green.shade100, width: 2),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('With Changes', style: TextStyle(fontSize: 14, color: Colors.grey, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Text(
                          _forecastData?['projection_with_changes'] ?? 'Reduced to +12%',
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.green),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 32),
            const Text('What if you...', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.accent)),
            const SizedBox(height: 16),
            
            for (var rec in recommendations)
              PraxiaWhatIfCard(
                label: rec['label'] ?? '',
                score: rec['score']?.toString() ?? '',
                assetPath: rec['assetPath'] ?? '',
              ),
            
            const SizedBox(height: 12),
            
            // SLEEP DETAIL CARD
            if (detailCard.isNotEmpty)
              _buildDetailCard(
                icon: Icons.bedtime_outlined, // Using static icon for mapped simplicity
                title: detailCard['title'] ?? '',
                tag: detailCard['tag'] ?? '',
                description: detailCard['description'] ?? '',
              ),

            const SizedBox(height: 32),
            PraxiaButton(
              text: 'View Action Plan', 
              onPressed: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const RecommendationScreen()))
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailCard({required IconData icon, required String title, required String tag, required String description}) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.black.withOpacity(0.05)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: AppColors.primary, size: 24),
              const SizedBox(width: 12),
              Expanded(child: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.accent))),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: const Color(0xFFE6F4F1), borderRadius: BorderRadius.circular(12)),
                child: Text(tag, style: const TextStyle(color: Color(0xFF134E4A), fontSize: 11, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            description,
            style: const TextStyle(color: Colors.black54, fontSize: 13, height: 1.4),
          ),
        ],
      ),
    );
  }
}
