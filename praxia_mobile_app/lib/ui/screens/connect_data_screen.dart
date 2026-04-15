import 'package:flutter/material.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:permission_handler/permission_handler.dart';
import 'dart:async';
import 'package:file_picker/file_picker.dart';
import '../../api_service.dart';
import '../widgets/app_drawer.dart';

class ConnectDataScreen extends StatefulWidget {
  const ConnectDataScreen({super.key});

  @override
  State<ConnectDataScreen> createState() => _ConnectDataScreenState();
}

class _ConnectDataScreenState extends State<ConnectDataScreen> {
  final List<dynamic> _scannedDevices = [];
  bool _isScanning = false;
  final Map<String, String> _pairStatus = {};

  final List<Map<String, dynamic>> staticItems = [
    {
      'title': 'Lab Results',
      'image': 'public/connect_data/lab_result.png',
      'buttonLabel': 'Upload',
      'buttonIcon': Icons.arrow_upward_rounded,
      'isUpload': true,
    },
    {
      'title': 'Care Plan',
      'image': 'public/connect_data/care_plan_1.png',
      'buttonLabel': 'Upload',
      'buttonIcon': Icons.arrow_upward_rounded,
      'isUpload': true,
    },
    {
      'title': 'Health Report',
      'image': 'public/connect_data/health_report.png',
      'buttonLabel': 'Self Submit',
      'buttonIcon': Icons.arrow_upward_rounded,
      'isUpload': true,
    },
  ];

  @override
  void initState() {
    super.initState();
  }

  Future<void> _startScan() async {
    setState(() {
      _isScanning = true;
      _scannedDevices.clear();
    });

    try {
      if (await Permission.bluetoothScan.request().isGranted &&
          await Permission.bluetoothConnect.request().isGranted &&
          await Permission.location.request().isGranted) {
        
        FlutterBluePlus.startScan(timeout: const Duration(seconds: 5));
        
        FlutterBluePlus.scanResults.listen((results) {
          if (mounted) {
            for (var r in results) {
              String name = r.device.platformName.isEmpty ? 'Generic Bluetooth Device' : r.device.platformName;
              if (!_scannedDevices.any((d) => d['id'] == r.device.remoteId.toString())) {
                setState(() {
                  _scannedDevices.add({'name': name, 'id': r.device.remoteId.toString(), 'type': 'Real'});
                });
              }
            }
          }
        });
      }
    } catch (e) {
      debugPrint("Scan error: $e");
    }

    // Add Simulated for Demo
    await Future.delayed(const Duration(seconds: 1));
    if (mounted) {
      setState(() {
        _scannedDevices.add({'name': 'Praxia Smart Ring v2', 'id': 'PR-0824', 'type': 'Simulated'});
        _scannedDevices.add({'name': 'Oura Ring Gen3', 'id': 'OR-1102', 'type': 'Simulated'});
      });
    }

    await Future.delayed(const Duration(seconds: 4));
    if (mounted) setState(() => _isScanning = false);
  }

  void _pairDevice(String id) async {
    setState(() => _pairStatus[id] = 'Pairing...');
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) setState(() => _pairStatus[id] = 'Connected ✅');
  }

  Future<void> _uploadDocument(String docType) async {
    try {
      FilePickerResult? result = await FilePicker.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'jpg', 'png', 'jpeg'],
      );

      if (result != null && result.files.single.path != null) {
        final filePath = result.files.single.path!;
        final fileName = result.files.single.name;

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Uploading $docType...'), duration: const Duration(seconds: 2)),
          );
        }

        final response = await ApiService.uploadDocument(filePath, fileName, docType);

        if (mounted) {
          if (response.containsKey('id')) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('$docType uploaded successfully!'),
                backgroundColor: Colors.green,
              ),
            );
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Failed to upload $docType: ${response['error'] ?? 'Unknown error'}'),
                backgroundColor: Colors.red,
              ),
            );
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F4F7),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(context),
            _buildDescription(),
            if (_isScanning) const LinearProgressIndicator(color: Color(0xFF2E7D5E), backgroundColor: Colors.white),
            Expanded(
              child: Stack(
                children: [
                   Positioned(
                    left: 44,
                    top: 0,
                    bottom: 0,
                    child: CustomPaint(painter: _DottedLinePainter()),
                  ),
                  ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    children: [
                      // Simulated & Real Bluetooth Devices section
                      if (_scannedDevices.isNotEmpty || _isScanning) ...[
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 16, horizontal: 45),
                          child: Text('AVAILABLE DEVICES', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.2)),
                        ),
                        ..._scannedDevices.map((d) => _buildScannedDeviceCard(d)).toList(),
                      ],

                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 16, horizontal: 45),
                        child: Text('DOCUMENT UPLOADS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.2)),
                      ),
                      ...staticItems.asMap().entries.map((entry) => _buildItemCard(entry.value, entry.key, staticItems.length)).toList(),
                    ],
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isScanning ? null : _startScan,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2E7D5E),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: Text(_isScanning ? 'Scanning...' : 'Scan for Devices', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_back, color: Color(0xFF1D3B5A)),
            onPressed: () => Navigator.pop(context),
          ),
          const Text(
            'Connect Data',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1D3B5A),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDescription() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      child: Text(
        'Add more data from a compatible device or upload results to improve your insights.',
        style: TextStyle(
          fontSize: 13,
          color: Colors.grey.shade600,
          height: 1.5,
        ),
      ),
    );
  }

  Widget _buildScannedDeviceCard(Map<String, dynamic> d) {
    final status = _pairStatus[d['id']] ?? 'Connect';
    bool isPaired = status.contains('Connected');

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Container(
        decoration: BoxDecoration(
          color: isPaired ? const Color(0xFFF0FDF4) : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: isPaired ? const Color(0xFF2E7D5E).withOpacity(0.3) : Colors.white),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 10, offset: const Offset(0, 3))],
        ),
        child: ListTile(
          leading: Container(
            width: 52, height: 52,
            decoration: BoxDecoration(color: const Color(0xFFF5F5F5), borderRadius: BorderRadius.circular(12)),
            child: Icon(d['type'] == 'Real' ? Icons.bluetooth : Icons.watch, color: const Color(0xFF2E7D5E)),
          ),
          title: Text(d['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF1D3B5A))),
          subtitle: Text(d['id'], style: const TextStyle(fontSize: 10, color: Colors.grey)),
          trailing: _buildActionButton(status, isPaired ? Icons.check : Icons.bluetooth, isPaired, () => _pairDevice(d['id'])),
        ),
      ),
    );
  }

  Widget _buildItemCard(Map<String, dynamic> item, int index, int total) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 10, offset: const Offset(0, 3))],
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
          child: Row(
            children: [
              Container(
                width: 52, height: 52,
                decoration: BoxDecoration(color: const Color(0xFFF5F5F5), borderRadius: BorderRadius.circular(12)),
                clipBehavior: Clip.antiAlias,
                child: Image.asset(item['image'] as String, fit: BoxFit.contain, errorBuilder: (c,e,s) => const Icon(Icons.insert_drive_file)),
              ),
              const SizedBox(width: 14),
              Expanded(child: Text(item['title'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF1D3B5A)))),
              _buildActionButton(item['buttonLabel'] as String, item['buttonIcon'] as IconData, false, () => _uploadDocument(item['title'] as String)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActionButton(String label, IconData icon, bool isConnected, VoidCallback onTap) {
    return Container(
      decoration: BoxDecoration(
        gradient: isConnected ? null : const LinearGradient(colors: [Color(0xFF2E7D5E), Color(0xFF4CAF80)], begin: Alignment.centerLeft, end: Alignment.centerRight),
        color: isConnected ? Colors.white : null,
        borderRadius: BorderRadius.circular(10),
        border: isConnected ? Border.all(color: const Color(0xFF2E7D5E)) : null,
        boxShadow: isConnected ? null : [
          BoxShadow(
            color: const Color(0xFF2E7D5E).withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: TextButton.icon(
        onPressed: label == 'Pairing...' ? null : onTap,
        style: TextButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8), minimumSize: Size.zero),
        icon: Text(label, style: TextStyle(color: isConnected ? const Color(0xFF2E7D5E) : Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
        label: Icon(icon, color: isConnected ? const Color(0xFF2E7D5E) : Colors.white, size: 14),
      ),
    );
  }
}

class _DottedLinePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    const dashHeight = 6.0;
    const dashSpace = 5.0;
    const dotRadius = 4.0;
    final paint = Paint()
      ..color = const Color(0xFF4CAF80).withOpacity(0.5)
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;
    final dotPaint = Paint()
      ..color = const Color(0xFF2E7D5E).withOpacity(0.6)
      ..style = PaintingStyle.fill;

    double startY = 0;
    while (startY < size.height) {
      if (startY % 80 < 6) {
        canvas.drawCircle(Offset(0, startY + dotRadius), dotRadius, dotPaint);
        startY += dotRadius * 2 + dashSpace;
        continue;
      }
      canvas.drawLine(Offset(0, startY), Offset(0, startY + dashHeight), paint);
      startY += dashHeight + dashSpace;
    }
  }
  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
