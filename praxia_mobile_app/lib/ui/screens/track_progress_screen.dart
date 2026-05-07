import 'package:flutter/material.dart';
import '../../api_service.dart';
import '../../core/app_theme.dart';
import '../widgets/app_drawer.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'outcome_simulation_screen.dart';

class TrackProgressScreen extends StatefulWidget {
  const TrackProgressScreen({Key? key}) : super(key: key);

  @override
  _TrackProgressScreenState createState() => _TrackProgressScreenState();
}

class _TrackProgressScreenState extends State<TrackProgressScreen> {
  bool _isLoading = true;
  bool _isGeneratingInsights = false;
  String _error = '';
  Map<String, dynamic>? _data;
  Map<String, dynamic>? _dynamicInsights;
  Map<int, List<bool>> _actionDaysCompleted = {};

  @override
  void initState() {
    super.initState();
    _fetchProgressData();
  }

  Future<void> _fetchProgressData() async {
    try {
      final response = await ApiService.getTrackProgress();

      if (mounted) {
        setState(() {
          _data = response;
          
          if (_data != null && _data!['actions'] != null) {
            for (int i = 0; i < _data!['actions'].length; i++) {
               final action = _data!['actions'][i];
               final List<dynamic>? backendDays = action['days_completed'];
               if (backendDays != null && backendDays.length == 7) {
                 _actionDaysCompleted[i] = backendDays.map((e) => e == true).toList();
               } else {
                 _actionDaysCompleted[i] = List.filled(7, false);
               }
            }
          }
          _isLoading = false;
        });
        _generateDynamicInsights();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Failed to load progress data';
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _generateDynamicInsights() async {
    if (_data == null || _data!['actions'] == null || _data!['actions'].isEmpty) return;
    
    setState(() => _isGeneratingInsights = true);
    final insightsData = await ApiService.getTrackProgressInsights(_data!['actions']);
    if (mounted) {
      setState(() {
        if (insightsData.isNotEmpty) {
          _dynamicInsights = insightsData;
        }
        _isGeneratingInsights = false;
      });
    }
  }

  void _toggleDay(int actionIndex, int dayIndex) async {
    setState(() {
      _actionDaysCompleted[actionIndex]![dayIndex] = !_actionDaysCompleted[actionIndex]![dayIndex];
      
      int totalDays = _actionDaysCompleted[actionIndex]!.where((d) => d).length;
      String status = "Not Started";
      String statusColor = "error";
      if (totalDays > 4) {
        status = "On Track";
        statusColor = "success";
      } else if (totalDays > 0) {
        status = "Partial";
        statusColor = "warning";
      }
      
      _data!['actions'][actionIndex]['status'] = status;
      _data!['actions'][actionIndex]['status_color'] = statusColor;
      
      int completed = 0, partial = 0, notStarted = 0;
      for (var action in _data!['actions']) {
        if (action['status'] == "On Track") completed++;
        else if (action['status'] == "Partial") partial++;
        else if (action['status'] == "Not Started") notStarted++;
      }
      int total = _data!['actions'].length;
      int progress = total > 0 ? ((completed / total) * 100).round() : 0;
      
      _data!['weekly_summary'] = {
        'completed': completed,
        'partial': partial,
        'not_started': notStarted,
        'total': total,
        'progress_percent': progress
      };
    });

    // Sync to backend
    try {
      final actionId = _data!['actions'][actionIndex]['id'];
      if (actionId != null) {
        await ApiService.updateActionTask(actionId, {
          'days_completed': _actionDaysCompleted[actionIndex],
          'status': _data!['actions'][actionIndex]['status'],
        });
      }
    } catch (e) {
      debugPrint("Failed to sync action toggle: $e");
    }
  }

  Color _hexToColor(String code) {
    return Color(int.parse(code.substring(1, 7), radix: 16) + 0xFF000000);
  }

  Color _getStatusColor(String statusColor) {
    switch (statusColor) {
      case 'success': return Colors.green.shade600;
      case 'warning': return Colors.orange.shade600;
      case 'error': return Colors.red.shade600;
      case 'primary': return AppColors.primary;
      default: return Colors.grey;
    }
  }

  IconData _getIconData(String iconName) {
    switch (iconName) {
      case 'directions_walk': return Icons.directions_walk;
      case 'cake': return Icons.cake;
      case 'water_drop': return Icons.water_drop;
      case 'fitness_center': return Icons.fitness_center;
      case 'trending_up': return Icons.trending_up;
      case 'trending_flat': return Icons.trending_flat;
      case 'bedtime': return Icons.bedtime;
      case 'event': default: return Icons.event;
    }
  }

  Widget _buildActionCard(Map<String, dynamic> action, int index, bool isLast) {
    final statusColor = _getStatusColor(action['status_color']);
    final iconColor = _hexToColor(action['color_hex']);
    final days = _actionDaysCompleted[index] ?? List.filled(7, false);
    
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        border: isLast ? null : Border(bottom: BorderSide(color: Colors.grey.shade200)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: iconColor.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(_getIconData(action['icon']), color: iconColor, size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(child: Text(action['title'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF1E293B)))),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                          child: Text(action['status'], style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(action['subtext'], style: const TextStyle(color: Color(0xFF64748B), fontSize: 13, height: 1.4)),
                  ],
                ),
              ),
            ],
          ),
          if (action['is_actionable'] == true)
            Padding(
              padding: const EdgeInsets.only(top: 16, left: 56),
              child: ElevatedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.event, size: 18, color: AppColors.primary),
                label: const Text("Schedule Now"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: AppColors.primary,
                  side: const BorderSide(color: AppColors.primary),
                  elevation: 0,
                  minimumSize: const Size(double.infinity, 40),
                ),
              ),
            )
          else
            Padding(
              padding: const EdgeInsets.only(top: 16, left: 56),
              child: Row(
                children: ['M', 'T', 'W', 'T', 'F', 'S', 'S'].asMap().entries.map((entry) {
                  int idx = entry.key;
                  bool isCompleted = days[idx];
                  return GestureDetector(
                    onTap: () => _toggleDay(index, idx),
                    child: Container(
                      width: 28,
                      height: 28,
                      margin: const EdgeInsets.only(right: 8),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isCompleted ? iconColor : Colors.white,
                        border: Border.all(color: isCompleted ? iconColor : Colors.grey.shade300),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        entry.value,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: isCompleted ? Colors.white : Colors.grey.shade500,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    
    if (_error.isNotEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text("Track Progress")),
        drawer: const AppDrawer(),
        body: Center(child: Text(_error)),
      );
    }

    final summary = _data!['weekly_summary'];
    final actions = _data!['actions'] as List;
    final insights = (_dynamicInsights != null ? _dynamicInsights!['insights'] : _data!['insights']) as List;
    final projection = _dynamicInsights != null ? _dynamicInsights!['projection'] : _data!['projection'];
    final reTest = _dynamicInsights != null ? _dynamicInsights!['re_test'] : _data!['re_test'];

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text("Track Progress", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black87)),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
        actions: [
          IconButton(
            icon: Stack(
              children: [
                const Icon(Icons.notifications_none),
                Positioned(
                  right: 2, top: 2,
                  child: Container(width: 8, height: 8, decoration: const BoxDecoration(color: Colors.blue, shape: BoxShape.circle)),
                )
              ],
            ),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("No new notifications"), duration: Duration(seconds: 2)));
            },
          )
        ],
      ),
      drawer: const AppDrawer(),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Info
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.calendar_today, color: Colors.blue, size: 20),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text("Week 2 of Plan", style: TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.bold)),
                        Text("May 6 - May 12", style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                      ],
                    )
                  ],
                ),
                Row(
                  children: [
                    const Icon(Icons.science, color: Colors.blue, size: 20),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text("Next Lab Check", style: TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.bold)),
                        Text("${reTest['days_left']} days", style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.blue)),
                      ],
                    )
                  ],
                )
              ],
            ),
            const SizedBox(height: 20),

            // Summary Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
              child: Row(
                children: [
                  Expanded(
                    flex: 5,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text("You completed", style: TextStyle(color: Colors.grey)),
                        RichText(
                          text: TextSpan(
                            children: [
                              TextSpan(text: "${summary['completed']}", style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.blue)),
                              TextSpan(text: " of ${summary['total']} actions", style: const TextStyle(fontSize: 14, color: Colors.black87)),
                            ]
                          )
                        ),
                        const Text("this week", style: TextStyle(color: Colors.grey)),
                        const SizedBox(height: 12),
                        Container(
                          height: 24,
                          decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(4)),
                          child: Row(
                            children: [
                              Expanded(
                                flex: summary['progress_percent'],
                                child: Container(
                                  decoration: BoxDecoration(color: Colors.blue, borderRadius: BorderRadius.circular(4)),
                                  alignment: Alignment.center,
                                  child: Text("${summary['progress_percent']}%", style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                                ),
                              ),
                              Expanded(flex: 100 - (summary['progress_percent'] as int), child: const SizedBox()),
                            ],
                          ),
                        )
                      ],
                    ),
                  ),
                  Container(width: 1, height: 60, color: Colors.grey.shade200, margin: const EdgeInsets.symmetric(horizontal: 16)),
                  Expanded(
                    flex: 4,
                    child: Column(
                      children: [
                        _buildStatRow(Icons.check_circle_outline, "Completed", summary['completed'].toString(), Colors.green),
                        const SizedBox(height: 8),
                        _buildStatRow(Icons.remove_circle_outline, "Partial", summary['partial'].toString(), Colors.orange),
                        const SizedBox(height: 8),
                        _buildStatRow(Icons.cancel_outlined, "Not Started", summary['not_started'].toString(), Colors.red),
                      ],
                    ),
                  )
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Action Tracker
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("Your Action Tracker", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                TextButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Opening Plan Editor..."), duration: Duration(seconds: 2)));
                  }, 
                  child: const Text("Edit Plan", style: TextStyle(fontWeight: FontWeight.bold))
                ),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
              child: Column(
                children: actions.asMap().entries.map((e) => _buildActionCard(e.value, e.key, e.key == actions.length - 1)).toList(),
              ),
            ),
            const SizedBox(height: 20),

            // Insights
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: const [
                          Icon(Icons.auto_awesome, color: Colors.blue, size: 20),
                          SizedBox(width: 8),
                          Text("What We're Seeing", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        ],
                      ),
                      if (_isGeneratingInsights)
                        const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                      else
                        InkWell(
                          onTap: _generateDynamicInsights,
                          child: const Icon(Icons.refresh, color: Colors.blue, size: 20),
                        )
                    ],
                  ),
                  const SizedBox(height: 16),
                  ...insights.map((insight) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(_getIconData(insight['icon']), color: _getStatusColor(insight['color']), size: 20),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(insight['text'], style: const TextStyle(fontSize: 14)),
                              if (insight['subtext'] != null)
                                Text(insight['subtext'], style: const TextStyle(fontSize: 12, color: Colors.grey)),
                            ],
                          ),
                        )
                      ],
                    ),
                  )).toList()
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Projection
            InkWell(
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => OutcomeSimulationScreen(projection: projection)));
              },
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: const [
                            Icon(Icons.track_changes, color: Colors.blue, size: 20),
                            SizedBox(width: 8),
                            Text("If you stay on track", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          ],
                        ),
                        const Icon(Icons.chevron_right, color: Colors.grey)
                      ],
                    ),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(8)),
                      child: Row(
                        children: [
                          Icon(Icons.trending_up, color: Colors.green.shade600, size: 32),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(projection['text'] ?? 'Projecting improvements', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                const SizedBox(height: 4),
                                Text(projection['subtext'] ?? '', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                              ],
                            ),
                          )
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: TextButton(
                        onPressed: () {
                          Navigator.push(context, MaterialPageRoute(builder: (_) => OutcomeSimulationScreen(projection: projection)));
                        },
                        style: TextButton.styleFrom(
                          foregroundColor: Colors.blue.shade700,
                          backgroundColor: Colors.blue.shade50,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        child: const Text("View Details", style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    )
                  ],
                ),
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildStatRow(IconData icon, String label, String value, Color color) {
    return Row(
      children: [
        Icon(icon, size: 16, color: color),
        const SizedBox(width: 4),
        Expanded(child: Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey))),
        Text(value, style: TextStyle(fontWeight: FontWeight.bold, color: color)),
      ],
    );
  }
}
