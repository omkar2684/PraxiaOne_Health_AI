import 'package:flutter/material.dart';
import '../widgets/app_drawer.dart';
import 'welcome_screen.dart';
import '../../core/app_theme.dart';

import '../../api_service.dart';

class JourneyFlowScreen extends StatefulWidget {
  const JourneyFlowScreen({super.key});
  @override
  State<JourneyFlowScreen> createState() => _JourneyFlowScreenState();
}

class _JourneyFlowScreenState extends State<JourneyFlowScreen> {
  List<dynamic> _steps = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadJourney();
  }

  Future<void> _loadJourney() async {
    final steps = await ApiService.getJourneySteps();
    if (mounted) {
      setState(() {
        _steps = steps;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const AppDrawer(),
      appBar: AppBar(title: const Text('Your Journey', style: TextStyle(color: AppColors.accent, fontWeight: FontWeight.w900)), iconTheme: const IconThemeData(color: AppColors.accent), backgroundColor: Colors.white, elevation: 0),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(padding: const EdgeInsets.all(24), child: Column(children: [
              for (var step in _steps)
                _JourneyStep(step['step'], step['title'], step['status'], step['completed']),
              const SizedBox(height: 40),
              _Btn('Restart Journey', () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const WelcomeScreen()))),
            ])),
    );
  }

  Widget _JourneyStep(int num, String t, String s, bool ok) => Container(margin: const EdgeInsets.only(bottom: 20), child: Row(children: [
    CircleAvatar(backgroundColor: ok ? AppColors.primary : Colors.grey.shade200, child: Text('$num', style: TextStyle(color: ok ? Colors.white : Colors.grey))),
    const SizedBox(width: 16),
    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(t, style: const TextStyle(fontWeight: FontWeight.bold)), Text(s, style: TextStyle(color: ok ? AppColors.primary : Colors.grey, fontSize: 12))])),
    if (ok) const Icon(Icons.check_circle, color: AppColors.primary),
  ]));

  Widget _Btn(String t, VoidCallback o, {bool outline = false, EdgeInsets? margin}) => Container(margin: margin, width: double.infinity, child: ElevatedButton(onPressed: o, style: ElevatedButton.styleFrom(backgroundColor: outline ? Colors.white : AppColors.primary, side: outline ? BorderSide(color: Colors.grey.shade300) : null, elevation: 0, padding: const EdgeInsets.symmetric(vertical: 18), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))), child: Text(t, style: TextStyle(color: outline ? Colors.black : Colors.white, fontWeight: FontWeight.bold))));
}
