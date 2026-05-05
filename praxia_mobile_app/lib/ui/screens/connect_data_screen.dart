import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../../api_service.dart';
import '../widgets/app_drawer.dart';

class ConnectDataScreen extends StatefulWidget {
  const ConnectDataScreen({super.key});

  @override
  State<ConnectDataScreen> createState() => _ConnectDataScreenState();
}

class _ConnectDataScreenState extends State<ConnectDataScreen> {
  Map<String, dynamic>? _riskFactors;
  bool _documentUploaded = false;
  bool _isStable = false; 
  bool _isAiThinking = false;

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
    // Do not load risk factors initially
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
          if (response.containsKey('id') || response.containsKey('success')) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('$docType uploaded successfully!'),
                backgroundColor: Colors.green,
              ),
            );
            
            // After successful upload, drop down the data synthesis
            setState(() {
              _documentUploaded = true;
              _isAiThinking = true;
              _riskFactors = null;
            });
            
            // Call AI via the backend which hits DeepSeek
            final aiResult = await ApiService.parseLabPDF(filePath);
            
            if (mounted) {
              setState(() {
                _isAiThinking = false;
              });
              
              if (aiResult.containsKey('biomarkers')) {
                final biomarkers = aiResult['biomarkers'] as List<dynamic>;
                if (biomarkers.isEmpty) {
                  setState(() {
                    _isStable = true;
                    _riskFactors = {
                      'factors': [
                        {'name': 'Scan Result', 'status': 'Normal'}
                      ],
                      'warning_message': 'Everything looks good! No abnormalities found.',
                      'explanation_title': 'Summary',
                      'explanation_text': 'Our AI could not find any elevated biomarkers in the uploaded document.'
                    };
                  });
                } else {
                  final factors = biomarkers.map((b) => {
                    'name': b['name'],
                    'status': b['status'] ?? 'Normal'
                  }).toList();
                  
                  final hasAbnormal = factors.any((f) => 
                    f['status'].toString().toLowerCase() != 'normal' && 
                    f['status'].toString().toLowerCase() != 'optimal'
                  );
                  
                  setState(() {
                    _isStable = !hasAbnormal;
                    _riskFactors = {
                      'factors': factors.take(6).toList(),
                      'warning_message': hasAbnormal 
                          ? 'Our AI detected some abnormal biomarkers in your document.' 
                          : 'Everything looks optimal according to our AI analysis.',
                      'explanation_title': 'DeepSeek Analysis Complete',
                      'explanation_text': 'DeepSeek processed your document and extracted the key data points above. ${hasAbnormal ? 'We recommend discussing these with your provider.' : 'Keep up the healthy habits!'}'
                    };
                  });
                }
              } else {
                 setState(() {
                   _isStable = false;
                   _riskFactors = {
                     'factors': [],
                     'warning_message': 'Error analyzing document with AI',
                     'explanation_title': 'Analysis Failed',
                     'explanation_text': aiResult['error'] ?? 'Unknown error'
                   };
                 });
              }
            }

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
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 16, horizontal: 45),
                        child: Text('DOCUMENT UPLOADS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.2)),
                      ),
                      ...staticItems.asMap().entries.map((entry) => _buildItemCard(entry.value, entry.key, staticItems.length)).toList(),

                      if (_documentUploaded && _isAiThinking) _buildAiThinkingCard(),
                      if (_documentUploaded && !_isAiThinking && _riskFactors != null) _buildRiskFactorsCard(),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAiThinkingCard() {
    return Padding(
      padding: const EdgeInsets.only(top: 24, bottom: 12),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 10, offset: const Offset(0, 3))],
          border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
        ),
        child: Column(
          children: [
            const CircularProgressIndicator(color: Color(0xFF2E7D5E)),
            const SizedBox(height: 16),
            const Text(
              'DeepSeek AI is analyzing...',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF1D3B5A)),
            ),
            const SizedBox(height: 8),
            Text(
              'Extracting biomarkers from your document',
              style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
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

  Widget _buildRiskFactorsCard() {
    final factors = _riskFactors?['factors'] as List<dynamic>? ?? [];
    return Padding(
      padding: const EdgeInsets.only(top: 24, bottom: 12),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 10, offset: const Offset(0, 3))],
          border: Border.all(color: _isStable ? Colors.green.shade100 : const Color(0xFFF1F5F9), width: 2),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        _isStable ? Icons.check_circle : Icons.warning_amber_rounded, 
                        color: _isStable ? Colors.green : Colors.orange
                      ),
                      const SizedBox(width: 8),
                      const Text('Data Synthesis', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF1D3B5A))),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: factors.map((f) => Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: _isStable ? const Color(0xFFF0FDF4) : const Color(0xFFFFF7ED),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: _isStable ? Colors.green.shade200 : Colors.orange.shade200),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('${f['name']}: ', style: TextStyle(fontWeight: FontWeight.w600, color: _isStable ? Colors.green.shade800 : const Color(0xFF9A3412), fontSize: 13)),
                          Text('${f['status']}', style: TextStyle(fontWeight: FontWeight.w900, color: _isStable ? Colors.green.shade800 : const Color(0xFF9A3412), fontSize: 13)),
                        ],
                      ),
                    )).toList(),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _riskFactors?['warning_message'] ?? '',
                    style: TextStyle(fontWeight: FontWeight.bold, color: _isStable ? Colors.green.shade700 : Colors.red, fontSize: 14),
                  ),
                ],
              ),
            ),
            Theme(
              data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
              child: ExpansionTile(
                iconColor: const Color(0xFF2E7D5E),
                collapsedIconColor: Colors.grey,
                title: Text(
                  _riskFactors?['explanation_title'] ?? 'Why am I seeing this?',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF2E7D5E)),
                ),
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                    child: Text(
                      _riskFactors?['explanation_text'] ?? '',
                      style: const TextStyle(color: Colors.black87, height: 1.5, fontSize: 13),
                    ),
                  )
                ],
              ),
            )
          ],
        ),
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
