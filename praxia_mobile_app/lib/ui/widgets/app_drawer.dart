import 'package:flutter/material.dart';
import '../../api_service.dart';
import '../../core/app_theme.dart';
import '../screens/data_sources_screen.dart';
import '../screens/health_score_screen.dart';
import '../screens/prediction_screen.dart';
import '../screens/recommendations_screen.dart';
import '../screens/doctor_screen.dart';
import '../screens/journey_flow_screen.dart';
import '../screens/login_screen.dart';
import '../screens/profile_screen.dart';
import '../screens/settings_screen.dart';
import '../screens/welcome_screen_v2.dart';
import '../screens/assistant_screen_v2.dart';
import '../screens/chat_list_screen.dart';

class AppDrawer extends StatefulWidget {
  const AppDrawer({Key? key}) : super(key: key);
  @override State<AppDrawer> createState() => _AppDrawerState();
}

class _AppDrawerState extends State<AppDrawer> {
  String _username = 'User';
  String _email = '';
  String _photoUrl = '';
  bool _loading = true;

  @override void initState() { super.initState(); _fetchData(); }

  String _sanitizeName(String? name) {
    if (name == null || name.isEmpty) return 'User';
    String n = name;
    if (n.contains('@')) {
      n = n.split('@')[0];
    }
    // Capitalize first letter
    return n[0].toUpperCase() + n.substring(1);
  }

  Future<void> _fetchData() async {
    final uname = await ApiService.getUsername();
    final profile = await ApiService.getProfile();
    
    if (mounted) {
      setState(() {
        String? fn = profile?['full_name'];
        String? un = profile?['username'];
        
        String rawName = (fn != null && fn.isNotEmpty) ? fn : 
                         (un != null && un.isNotEmpty) ? un : 
                         (uname != null && uname.isNotEmpty) ? uname : 'User';
        
        _username = _sanitizeName(rawName);
        _email = profile?['email'] ?? (uname != null ? (uname.contains('@') ? uname : '$uname@praxiaone.com') : 'No email');
        _photoUrl = profile?['profile_picture'] ?? '';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: const Color(0xFFF2F4F7),
      child: SafeArea(
        child: Column(
          children: [
            // Modern Profile Header
            GestureDetector(
              onTap: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => ProfileScreen())),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  border: Border(bottom: BorderSide(color: Color(0xFFE0E0E0))),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 26,
                      backgroundColor: const Color(0xFFECFDF5), // Light emerald
                      backgroundImage: _photoUrl.isNotEmpty ? NetworkImage(_photoUrl) : null,
                      child: _photoUrl.isEmpty ? Text(_username.isNotEmpty ? _username[0].toUpperCase() : 'U', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.primary)) : null,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(_loading ? 'Loading...' : _username, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF1D3B5A))),
                          const SizedBox(height: 2),
                          Text(_loading ? '...' : _email, style: const TextStyle(fontSize: 12, color: Colors.grey), overflow: TextOverflow.ellipsis),
                        ],
                      ),
                    ),
                    const Icon(Icons.chevron_right, color: Colors.grey, size: 20),
                  ],
                ),
              ),
            ),
            
            // Drawer Items List
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
                children: [
                  const Padding(padding: EdgeInsets.only(left: 12, bottom: 8, top: 8), child: Text('YOUR JOURNEY', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.2))),
                  
                  _DrawerItem(Icons.door_front_door_outlined, '1. Entry Welcome', () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => WelcomeScreenV2()))),
                  _DrawerItem(Icons.sensors_outlined, '2. Data Sources', () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => DataSourcesScreen()))),
                  _DrawerItem(Icons.insights_outlined, '3. Health Intelligence', () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => HealthScoreScreen()))),
                  _DrawerItem(Icons.chat_bubble_outline, '4. AI Assistance', () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => AssistantScreenV2()))),
                  _DrawerItem(Icons.auto_graph_outlined, '5. Prediction', () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => ForecastScreen()))),
                  _DrawerItem(Icons.check_circle_outline, '6. Recommendation', () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => RecommendationScreen()))),
                  _DrawerItem(Icons.healing_outlined, '7. Escalation', () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => DoctorScreen()))),
                  _DrawerItem(Icons.map_outlined, '8. Journey Flow', () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const JourneyFlowScreen()))),
                  _DrawerItem(Icons.message_outlined, 'Message Portal', () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const ChatListScreen()))),
                  
                  const Padding(padding: EdgeInsets.symmetric(vertical: 16), child: Divider(height: 1)),
                  const Padding(padding: EdgeInsets.only(left: 12, bottom: 8), child: Text('ACCOUNT', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.2))),
                  
                  _DrawerItem(Icons.settings_outlined, 'Settings', () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => SettingsScreen()))),                  
                  
                  if (_email == 'No email' || _email.isEmpty) // Guest mode
                    _DrawerItem(Icons.login, 'Login / Sign Up', () {
                      Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const LoginScreen()), (r) => false);
                    })
                  else
                    _DrawerItem(Icons.logout, 'Logout', () async { 
                      await ApiService.clearToken(); 
                      Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const LoginScreen()), (r) => false); 
                    }, isRed: true),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DrawerItem extends StatelessWidget {
  final IconData icon; 
  final String label; 
  final VoidCallback onTap; 
  final bool isRed;
  
  const _DrawerItem(this.icon, this.label, this.onTap, {this.isRed = false});
  
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      child: ListTile(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        leading: Icon(icon, color: isRed ? Colors.red.shade400 : const Color(0xFF1D3B5A), size: 22),
        title: Text(label, style: TextStyle(fontWeight: FontWeight.w600, color: isRed ? Colors.red.shade600 : const Color(0xFF1D3B5A), fontSize: 14)),
        dense: true,
        horizontalTitleGap: 8,
        onTap: onTap,
        hoverColor: const Color(0xFFE8F5E9),
      ),
    );
  }
}
