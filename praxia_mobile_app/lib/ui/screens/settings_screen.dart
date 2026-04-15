import 'package:flutter/material.dart';
import '../../api_service.dart';
import '../widgets/app_drawer.dart';
import 'edit_contact_details_screen.dart';
import 'edit_medical_info_screen.dart';
import 'login_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late Future<Map<String, dynamic>> _analyticsFuture;
  late Future<Map<String, dynamic>> _settingsFuture;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  void _fetchData() {
    setState(() {
      _analyticsFuture = ApiService.getCostAnalytics();
      _settingsFuture = ApiService.getUserSettings();
    });
  }

  void _showComingSoon() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('This feature is currently in development.'),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _confirmDelete() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Account', style: TextStyle(color: Colors.red)),
        content: const Text('Are you sure you want to permanently delete your account and all associated health data?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () async {
              Navigator.pop(ctx);
              await ApiService.deleteAccount();
              if (mounted) {
                Navigator.of(context).pushAndRemoveUntil(MaterialPageRoute(builder: (_) => const LoginScreen()), (route) => false);
              }
            },
            child: const Text('Delete'),
          ),
        ],
      )
    );
  }

  void _showSwitchAccount() {
    showModalBottomSheet(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const ListTile(title: Text('Switch Account', style: TextStyle(fontWeight: FontWeight.bold))),
            ListTile(
              leading: const Icon(Icons.add),
              title: const Text('Add Existing Account'),
              onTap: () {
                Navigator.pop(ctx);
                ApiService.clearToken();
                Navigator.of(context).pushAndRemoveUntil(MaterialPageRoute(builder: (_) => const LoginScreen()), (route) => false);
              },
            ),
          ],
        )
      )
    );
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
      body: FutureBuilder(
        future: Future.wait([_analyticsFuture, _settingsFuture]),
        builder: (context, AsyncSnapshot<List<Map<String, dynamic>>> snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(child: Text('Error loading data: ${snapshot.error}'));
          }

          final analyticsData = snapshot.data?[0] ?? {};
          final settingsData = snapshot.data?[1] ?? {};

          return ListView(
            padding: const EdgeInsets.all(16.0),
            children: [
              // 1. Account Info
              _buildSectionTitle('Account'),
              Card(
                color: Colors.white,
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.person),
                      title: const Text('Profile & Personal Information'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () async {
                         final updated = await Navigator.push(context, MaterialPageRoute(builder: (_) => EditContactDetailsScreen(initialData: settingsData['profile'])));
                         if(updated == true) _fetchData();
                      },
                    ),
                    const Divider(height: 1),
                    ExpansionTile(
                      leading: const Icon(Icons.manage_accounts),
                      title: const Text('Account Management'),
                      children: [
                        ListTile(
                          leading: const Icon(Icons.switch_account),
                          title: const Text('Switch Account'),
                          onTap: _showSwitchAccount,
                        ),
                        ListTile(
                          leading: const Icon(Icons.logout, color: Colors.orange),
                          title: const Text('Logout', style: TextStyle(color: Colors.orange)),
                          onTap: () async {
                            await ApiService.logout();
                            if (mounted) Navigator.of(context).pushAndRemoveUntil(MaterialPageRoute(builder: (_) => const LoginScreen()), (route) => false);
                          },
                        ),
                        ListTile(
                          leading: const Icon(Icons.delete_forever, color: Colors.red),
                          title: const Text('Delete Account', style: TextStyle(color: Colors.red)),
                          onTap: _confirmDelete,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // 2. Health Records
              _buildSectionTitle('Health Records'),
              Card(
                color: Colors.white,
                child: ListTile(
                  leading: const Icon(Icons.medical_information, color: Colors.redAccent),
                  title: const Text('Medical Information'),
                  subtitle: const Text('Conditions, Allergies, Medications'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () async {
                    final updated = await Navigator.push(context, MaterialPageRoute(builder: (_) => EditMedicalInfoScreen(medicalData: settingsData['medical'], profileData: settingsData['profile'])));
                    if (updated == true) _fetchData();
                  },
                ),
              ),
              const SizedBox(height: 20),

              // 3. Financial
              _buildSectionTitle('Financial & Limits'),
              Card(
                color: Colors.white,
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.payment),
                      title: const Text('Payment & Insurance'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: _showComingSoon,
                    ),
                    const Divider(height: 1),
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: _buildBudgetUI(analyticsData),
                    )
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // 4. Data & Analytics
              _buildSectionTitle('Data & Usage'),
              Card(
                color: Colors.white,
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.bar_chart),
                      title: const Text('Reports & Data Management'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: _showComingSoon,
                    ),
                    const Divider(height: 1),
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: _buildBreakdownUI(analyticsData['model_breakdown'] ?? []),
                    )
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // 5. Preferences
              _buildSectionTitle('Preferences'),
              Card(
                color: Colors.white,
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.settings_applications),
                      title: const Text('App Preferences'),
                      subtitle: Text('AI Mode: ${settingsData['profile']?['preferred_ai_mode'] ?? 'Fast'}'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: _showComingSoon,
                    ),
                    const Divider(height: 1),
                    ListTile(
                      leading: const Icon(Icons.notifications),
                      title: const Text('Notifications & Reminders'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: _showComingSoon,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // 6. Security & Support
              _buildSectionTitle('Security & Support'),
              Card(
                color: Colors.white,
                child: Column(
                  children: [
                    SwitchListTile(
                      secondary: const Icon(Icons.security),
                      title: const Text('Privacy & Security'),
                      subtitle: const Text('Lock sensitive data'),
                      value: settingsData['profile']?['privacy_lock_enabled'] ?? true,
                      onChanged: (val) async {
                        await ApiService.updateUserSettings({'profile': {'privacy_lock_enabled': val}});
                        _fetchData();
                      },
                    ),
                    const Divider(height: 1),
                    ListTile(
                      leading: const Icon(Icons.help_outline),
                      title: const Text('Help & Support'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: _showComingSoon,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),
            ],
          );
        },
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 8.0, bottom: 8.0),
      child: Text(
        title.toUpperCase(),
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          color: Colors.grey.shade600,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildBudgetUI(Map<String, dynamic> data) {
    final limit = (data['budget_limit'] as num?)?.toDouble() ?? 10.0;
    final usage = (data['total_cost_calculated'] as num?)?.toDouble() ?? 0.0;
    double progress = limit > 0 ? (usage / limit) : 0;
    if (progress > 1.0) progress = 1.0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('AI Budget Limit', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('\$${usage.toStringAsFixed(4)} used', style: TextStyle(color: Colors.blue.shade700, fontWeight: FontWeight.bold)),
            Text('\$${limit.toStringAsFixed(2)} total', style: const TextStyle(color: Colors.grey)),
          ],
        ),
        const SizedBox(height: 8),
        LinearProgressIndicator(
          value: progress,
          backgroundColor: Colors.grey.shade200,
          color: Colors.green.shade400,
          minHeight: 8,
          borderRadius: BorderRadius.circular(4),
        ),
      ],
    );
  }

  Widget _buildBreakdownUI(List<dynamic> breakdown) {
    if (breakdown.isEmpty) {
      return const Text('No usage data yet.', style: TextStyle(color: Colors.grey));
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Target Usage Breakdown', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        ...breakdown.map((item) {
          final modelName = item['model_used'] ?? 'Unknown';
          final cost = (item['total_cost'] as num?)?.toDouble() ?? 0.0;
          return Padding(
            padding: const EdgeInsets.only(bottom: 8.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(modelName),
                Text('\$${cost.toStringAsFixed(4)}', style: const TextStyle(fontWeight: FontWeight.w600)),
              ],
            ),
          );
        }),
      ],
    );
  }
}
