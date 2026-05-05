// lib/ui/screens/lab_results_screen.dart
// Screen 1 — Lab Results
// Displays biomarkers and calls the backend on "View AI Insights".

import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../lab_ai/lab_models.dart';
import '../../lab_ai/lab_api_service.dart';
import 'ai_insights_screen.dart';

// Default biomarker panel — matches the backend test payload.
const _defaultBiomarkers = [
  Biomarker(name: 'Glucose', value: 102, unit: 'mg/dL'),
  Biomarker(name: 'Hemoglobin A1c', value: 5.8, unit: '%'),
  Biomarker(name: 'LDL Cholesterol', value: 134, unit: 'mg/dL'),
  Biomarker(name: 'HDL Cholesterol', value: 42, unit: 'mg/dL'),
  Biomarker(name: 'Triglycerides', value: 168, unit: 'mg/dL'),
  Biomarker(name: 'Vitamin D', value: 22, unit: 'ng/mL'),
];

// Reference ranges used only for the UI chip colour on Screen 1.
Map<String, String> _refStatus(Biomarker b) {
  switch (b.name) {
    case 'Glucose':
      return b.value > 99 ? {'s': 'High', 'c': 'high'} : {'s': 'Normal', 'c': 'normal'};
    case 'Hemoglobin A1c':
      return b.value >= 5.7 ? {'s': 'High', 'c': 'high'} : {'s': 'Normal', 'c': 'normal'};
    case 'LDL Cholesterol':
      return b.value > 129 ? {'s': 'High', 'c': 'high'} : {'s': 'Normal', 'c': 'normal'};
    case 'HDL Cholesterol':
      return b.value < 40 ? {'s': 'Low', 'c': 'low'} : {'s': 'Normal', 'c': 'normal'};
    case 'Triglycerides':
      return b.value > 149 ? {'s': 'High', 'c': 'high'} : {'s': 'Normal', 'c': 'normal'};
    case 'Vitamin D':
      return b.value < 30 ? {'s': 'Low', 'c': 'low'} : {'s': 'Normal', 'c': 'normal'};
    default:
      return {'s': 'Normal', 'c': 'normal'};
  }
}

class LabResultsScreen extends StatefulWidget {
  const LabResultsScreen({Key? key}) : super(key: key);

  @override
  State<LabResultsScreen> createState() => _LabResultsScreenState();
}

class _LabResultsScreenState extends State<LabResultsScreen> {
  bool _isLoading = false;

  Future<void> _onViewInsights() async {
    setState(() => _isLoading = true);
    try {
      final response = await LabApiService.getInsights(_defaultBiomarkers);
      if (!mounted) return;
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => AIInsightsScreen(response: response),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('AI Error: $e'),
          backgroundColor: Colors.red.shade700,
        ),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F4F7),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              color: Color(0xFF1D3B5A), size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Lab Results',
          style: TextStyle(
            color: Color(0xFF1D3B5A),
            fontWeight: FontWeight.w800,
            fontSize: 20,
          ),
        ),
        centerTitle: false,
      ),
      body: SafeArea(
        child: Column(
          children: [
            // ── Header card ─────────────────────────────────────────────
            Container(
              margin: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1E3A8A), Color(0xFF2563EB)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.18),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.science_rounded,
                        color: Colors.white, size: 24),
                  ),
                  const SizedBox(width: 14),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Annual Blood Panel',
                            style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w800,
                                fontSize: 16)),
                        SizedBox(height: 2),
                        Text('6 biomarkers · May 2026',
                            style: TextStyle(
                                color: Colors.white70, fontSize: 12)),
                      ],
                    ),
                  ),
                  const Icon(Icons.verified_rounded,
                      color: Color(0xFF86EFAC), size: 22),
                ],
              ),
            ),

            // ── Biomarker list ──────────────────────────────────────────
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                itemCount: _defaultBiomarkers.length,
                itemBuilder: (_, i) {
                  final b = _defaultBiomarkers[i];
                  final info = _refStatus(b);
                  return _BiomarkerCard(biomarker: b, statusInfo: info);
                },
              ),
            ),

            // ── Bottom button ───────────────────────────────────────────
            Container(
              color: Colors.white,
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
              child: SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _onViewInsights,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1E3A8A),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                  child: _isLoading
                      ? const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                  color: Colors.white, strokeWidth: 2),
                            ),
                            SizedBox(width: 12),
                            Text('Analysing with AI…',
                                style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w700)),
                          ],
                        )
                      : const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.auto_awesome_rounded,
                                color: Colors.white, size: 18),
                            SizedBox(width: 8),
                            Text('View AI Insights',
                                style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 16)),
                          ],
                        ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Biomarker card widget ─────────────────────────────────────────────────

class _BiomarkerCard extends StatelessWidget {
  final Biomarker biomarker;
  final Map<String, String> statusInfo;

  const _BiomarkerCard(
      {required this.biomarker, required this.statusInfo});

  Color get _badgeColor {
    switch (statusInfo['c']) {
      case 'high':
        return const Color(0xFFEF4444);
      case 'low':
        return const Color(0xFFF97316);
      default:
        return const Color(0xFF10B981);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 8,
              offset: const Offset(0, 3))
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  biomarker.name,
                  style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 14,
                      color: Color(0xFF1E293B)),
                ),
                const SizedBox(height: 2),
                Text(
                  '${biomarker.value} ${biomarker.unit}',
                  style: const TextStyle(
                      fontSize: 13, color: Color(0xFF64748B)),
                ),
              ],
            ),
          ),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
            decoration: BoxDecoration(
              color: _badgeColor.withOpacity(0.12),
              borderRadius: BorderRadius.circular(100),
            ),
            child: Text(
              statusInfo['s']!,
              style: TextStyle(
                  color: _badgeColor,
                  fontWeight: FontWeight.w700,
                  fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }
}
