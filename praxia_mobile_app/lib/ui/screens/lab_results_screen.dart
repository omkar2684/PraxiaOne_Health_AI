// lib/ui/screens/lab_results_screen.dart
// Screen 1 — Lab Results
// Displays biomarkers and calls the backend on "View AI Insights".

import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../lab_ai/lab_models.dart';
import '../../lab_ai/lab_api_service.dart';
import 'ai_insights_screen.dart';
import '../widgets/app_drawer.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:file_picker/file_picker.dart';

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
  List<Map<String, String>> _previousUploads = [];
  LabInsightsResponse? _cachedResponse;

  @override
  void initState() {
    super.initState();
    _loadCache();
    _loadPreviousUploads();
  }

  Future<void> _loadCache() async {
    final sp = await SharedPreferences.getInstance();
    final cached = sp.getString('cached_lab_insights');
    if (cached != null) {
      setState(() {
        _cachedResponse = LabInsightsResponse.fromJson(jsonDecode(cached));
      });
    }
  }

  Future<void> _loadPreviousUploads() async {
    final sp = await SharedPreferences.getInstance();
    final List<String> saved = sp.getStringList('previous_uploads') ?? [];
    setState(() {
      _previousUploads = saved.map((s) {
        final parts = s.split('|');
        return {'name': parts[0], 'path': parts[1]};
      }).toList();
    });
  }

  Future<void> _saveCache(LabInsightsResponse response) async {
    final sp = await SharedPreferences.getInstance();
    await sp.setString('cached_lab_insights', jsonEncode(response.toJson()));
    setState(() => _cachedResponse = response);
  }

  Future<void> _onViewInsights({bool force = false}) async {
    if (!force && _cachedResponse != null) {
      Navigator.push(context, MaterialPageRoute(builder: (_) => AIInsightsScreen(response: _cachedResponse!)));
      return;
    }

    setState(() => _isLoading = true);
    try {
      final response = await LabApiService.getInsights(_defaultBiomarkers);
      if (!mounted) return;
      await _saveCache(response);
      Navigator.push(context, MaterialPageRoute(builder: (_) => AIInsightsScreen(response: response)));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('AI Error: $e'), backgroundColor: Colors.red.shade700));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _uploadNewPDF() async {
    FilePickerResult? result = await FilePicker.pickFiles(type: FileType.custom, allowedExtensions: ['pdf']);
    if (result != null && result.files.single.path != null) {
      final path = result.files.single.path!;
      final name = result.files.single.name;
      final sp = await SharedPreferences.getInstance();
      List<String> saved = sp.getStringList('previous_uploads') ?? [];
      final entry = '$name|$path';
      if (!saved.contains(entry)) {
        saved.add(entry);
        await sp.setStringList('previous_uploads', saved);
        _loadPreviousUploads();
      }
      _onViewInsights(force: true); // Trigger AI analysis for new file
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F4F7),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu, color: Color(0xFF1D3B5A)),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
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
        actions: [
          if (_cachedResponse != null)
            IconButton(
              icon: const Icon(Icons.refresh_rounded, color: Color(0xFF1D3B5A)),
              tooltip: 'Refresh AI Insights',
              onPressed: () => _onViewInsights(force: true),
            ),
        ],
      ),
      drawer: const AppDrawer(),
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

            // ── Previous PDF Dropdown ──────────────────────────────────
            if (_previousUploads.isNotEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey.shade200)),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<Map<String, String>>(
                      isExpanded: true,
                      hint: const Text("Choose previous lab PDF", style: TextStyle(fontSize: 13)),
                      items: _previousUploads.map((file) => DropdownMenuItem(
                        value: file,
                        child: Text(file['name']!, style: const TextStyle(fontSize: 13, overflow: TextOverflow.ellipsis)),
                      )).toList(),
                      onChanged: (val) {
                        if (val != null) _onViewInsights(force: true); // Trigger re-analysis
                      },
                    ),
                  ),
                ),
              ),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: OutlinedButton.icon(
                onPressed: _uploadNewPDF,
                icon: const Icon(Icons.upload_file_rounded, size: 18),
                label: const Text("Upload New Lab PDF"),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 44),
                  side: BorderSide(color: Colors.blue.shade200),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ),
            const SizedBox(height: 8),
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
