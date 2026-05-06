import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../components/praxia_card.dart';
import '../components/metrics_widgets.dart';
import '../components/praxia_button.dart';

import '../../api_service.dart';

class VitalsDetailScreen extends StatelessWidget {
  final String title;
  final String value;
  
  const VitalsDetailScreen({Key? key, required this.title, required this.value}) : super(key: key);

  Future<void> _exportPDF(BuildContext context) async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Generating PDF report...')),
    );
    final success = await ApiService.exportVitalsPDF();
    if (context.mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('PDF report exported successfully!')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to export PDF.'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('$title Analysis'), 
        backgroundColor: Colors.white, 
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.picture_as_pdf, color: AppColors.primary),
            onPressed: () => _exportPDF(context),
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(32),
              width: double.infinity,
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20)]),
              child: Column(children: [
                Text(title, style: const TextStyle(color: Colors.grey, fontSize: 18)),
                const SizedBox(height: 12),
                Text(value, style: const TextStyle(fontSize: 48, fontWeight: FontWeight.w900, color: AppColors.accent)),
                const SizedBox(height: 12),
                const Text('🟢 Within Normal Range', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
              ]),
            ),
            const SizedBox(height: 32),
            const Align(alignment: Alignment.centerLeft, child: Text('24-Hour Log', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold))),
            const SizedBox(height: 16),
            PraxiaCard(
              padding: EdgeInsets.zero,
              child: Column(children: const [
                PraxiaRow('🕒', 'Morning Reading', '110 mg/dL'),
                PraxiaRow('🕒', 'Afternoon Reading', '125 mg/dL'),
                PraxiaRow('🕒', 'Evening Reading', '118 mg/dL', last: true),
              ]),
            ),
            const SizedBox(height: 40),
            PraxiaButton(
              text: 'Export PDF Report', 
              onPressed: () => _exportPDF(context),
            ),
          ],
        ),
      ),
    );
  }
}
