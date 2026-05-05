import 'package:flutter/material.dart';
import '../widgets/app_drawer.dart';
import '../../health_os_sync.dart';
import 'connect_data_screen.dart';
import 'health_score_screen.dart';

class DataSourcesScreen extends StatefulWidget {
  const DataSourcesScreen({super.key});

  @override
  State<DataSourcesScreen> createState() => _DataSourcesScreenState();
}

class _DataSourcesScreenState extends State<DataSourcesScreen> {
  int _selectedNavIndex = 0;

  final List<Map<String, String>> _dataSources = [
    {
      'name': 'Amazon One Medical',
      'image': 'public/data_sources_screen/amazon_one_medical_logo.png',
    },
    {
      'name': 'Apple Health / Google Fit',
      'image': 'public/data_sources_screen/apple_heart_logo.png',
    },
    {
      'name': 'Fitbit',
      'image': 'public/data_sources_screen/fitbit_logo.png',
    },
    {
      'name': '5G Device',
      'image': 'public/data_sources_screen/5G_device_logo.png',
    },
    {
      'name': 'Bluetooth Device',
      'image': 'public/data_sources_screen/5G_device_logo.png', // Fallback to 5G logo or similar
    },
  ];

  bool _isScanning = false;
  bool _showScanned = false;
  final List<Map<String, dynamic>> _scannedDevices = [];
  final Map<String, String> _pairStatus = {};

  Future<void> _startScan() async {
    setState(() {
      _isScanning = true;
      _showScanned = true;
      _scannedDevices.clear();
    });

    await Future.delayed(const Duration(seconds: 1));
    if (mounted) {
      setState(() {
        _scannedDevices.add({'name': 'Praxia Smart Ring v2', 'id': 'PR-0824', 'type': 'Simulated'});
        _scannedDevices.add({'name': 'Oura Ring Gen3', 'id': 'OR-1102', 'type': 'Simulated'});
      });
    }

    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      setState(() {
        _isScanning = false;
      });
    }
  }

  void _pairDevice(String id) async {
    setState(() => _pairStatus[id] = 'Pairing...');
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) setState(() => _pairStatus[id] = 'Connected');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F4F7),
      drawer: const AppDrawer(),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Color(0xFF1D3B5A)), // Hamburger menu on the left!
        title: Image.asset(
          'public/data_sources_screen/PraxiaOne_logo_data_sources.png',
          height: 36,
          fit: BoxFit.contain,
        ),
        centerTitle: false,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Column(
                  children: [
                    _buildDataSourceCard(),
                    const SizedBox(height: 16),
                    _buildConnectMoreButton(),
                    const SizedBox(height: 16),
                    _buildContinueButton(context),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDataSourceCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.07),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.fromLTRB(16, 18, 16, 8),
            child: Text(
              'Your Data Sources',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1D3B5A),
              ),
            ),
          ),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _dataSources.length,
            separatorBuilder: (ctx, _) => const Divider(
              height: 1,
              indent: 16,
              endIndent: 16,
              color: Color(0xFFEEEEEE),
            ),
            itemBuilder: (ctx, index) => _buildDataSourceItem(_dataSources[index]),
          ),
        ],
      ),
    );
  }

  Widget _buildDataSourceItem(Map<String, String> source) {
    bool isAppleHealth = source['name']!.contains('Apple Health');
    bool isBluetooth = source['name']!.contains('Bluetooth');
    
    return Column(
      children: [
        Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
            ),
            clipBehavior: Clip.antiAlias,
            child: Image.asset(
              source['image']!,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => const Icon(Icons.broken_image),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  source['name']!,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    color: Color(0xFF1D3B5A),
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.check_circle_outline, size: 15, color: Colors.green.shade600),
                    const SizedBox(width: 4),
                    Text(
                      'Connected',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.green.shade600,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          if (isAppleHealth) 
            ElevatedButton(
              onPressed: () async {
                bool success = await OsHealthSync.syncData();
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(success ? "Health Data Synced to Backend!" : "Health Sync Failed/Denied"))
                  );
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2E7D5E), 
                padding: const EdgeInsets.symmetric(horizontal: 12),
                minimumSize: const Size(0, 32),
              ),
              child: const Text('Sync', style: TextStyle(color: Colors.white, fontSize: 12)),
            )
          else if (isBluetooth)
            ElevatedButton(
              onPressed: _isScanning ? null : _startScan,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2E7D5E), 
                padding: const EdgeInsets.symmetric(horizontal: 12),
                minimumSize: const Size(0, 32),
              ),
              child: Text(_isScanning ? 'Scanning...' : 'Scan', style: const TextStyle(color: Colors.white, fontSize: 12)),
            )
          else
            Icon(Icons.chevron_right, color: Colors.grey.shade400, size: 22),
        ],
      ),
    ),
    if (isBluetooth && _showScanned) ..._scannedDevices.map((d) {
      final status = _pairStatus[d['id']] ?? 'Connect';
      bool isPaired = status.contains('Connected');
      return Container(
        color: const Color(0xFFF9FAFB),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
        child: Row(
          children: [
            Icon(Icons.bluetooth, color: isPaired ? Colors.green : Colors.grey, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(d['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1D3B5A))),
                  Text(d['id'], style: const TextStyle(fontSize: 10, color: Colors.grey)),
                ],
              ),
            ),
            TextButton(
              onPressed: status == 'Connect' ? () => _pairDevice(d['id']) : null,
              child: Text(status, style: TextStyle(color: isPaired ? Colors.green : const Color(0xFF2E7D5E), fontSize: 12, fontWeight: FontWeight.bold)),
            )
          ],
        ),
      );
    }).toList(),
    ],
    );
  }

  Widget _buildConnectMoreButton() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE0E0E0), width: 1.5),
      ),
      child: TextButton.icon(
        onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ConnectDataScreen())),
        style: TextButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
        icon: const Icon(Icons.add, color: Color(0xFF1D3B5A), size: 22),
        label: const Text(
          'Connect More',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Color(0xFF1D3B5A),
          ),
        ),
      ),
    );
  }

  Widget _buildContinueButton(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        gradient: const LinearGradient(
          colors: [Color(0xFF2E7D5E), Color(0xFF3DAA7D)],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF2E7D5E).withOpacity(0.35),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: TextButton(
        onPressed: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const HealthScoreScreen())),
        style: TextButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
        child: const Text(
          'Continue',
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.bold,
            color: Colors.white,
            letterSpacing: 0.3,
          ),
        ),
      ),
    );
  }
}
