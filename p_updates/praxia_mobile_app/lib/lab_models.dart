// lib/lab_ai/lab_models.dart
// Data models for the Lab Results AI flow.
// All classes are plain Dart — no HTTP logic lives here.

class Biomarker {
  final String name;
  final double value;
  final String unit;

  const Biomarker({required this.name, required this.value, required this.unit});

  Map<String, dynamic> toJson() => {
        'name': name,
        'value': value,
        'unit': unit,
      };
}

// ── Server response models ────────────────────────────────────────────────

class LabInsight {
  final String biomarker;
  final String status; // "High" | "Low" | "Normal"
  final String shortDescription;
  final String whatItMeans;
  final String whyItMatters;
  final String goodNews;

  const LabInsight({
    required this.biomarker,
    required this.status,
    required this.shortDescription,
    required this.whatItMeans,
    required this.whyItMatters,
    required this.goodNews,
  });

  factory LabInsight.fromJson(Map<String, dynamic> j) => LabInsight(
        biomarker: j['biomarker'] ?? '',
        status: j['status'] ?? 'Normal',
        shortDescription: j['short_description'] ?? '',
        whatItMeans: j['what_it_means'] ?? '',
        whyItMatters: j['why_it_matters'] ?? '',
        goodNews: j['good_news'] ?? '',
      );
}

class ActionPlanItem {
  final String icon;        // SF Symbol / Material icon name hint
  final String title;
  final String description;

  const ActionPlanItem({
    required this.icon,
    required this.title,
    required this.description,
  });

  factory ActionPlanItem.fromJson(Map<String, dynamic> j) => ActionPlanItem(
        icon: j['icon'] ?? 'star',
        title: j['title'] ?? '',
        description: j['description'] ?? '',
      );
}

class LabInsightsResponse {
  final List<LabInsight> insights;
  final List<ActionPlanItem> actionPlan;

  const LabInsightsResponse({required this.insights, required this.actionPlan});

  factory LabInsightsResponse.fromJson(Map<String, dynamic> j) =>
      LabInsightsResponse(
        insights: (j['insights'] as List? ?? [])
            .map((e) => LabInsight.fromJson(e as Map<String, dynamic>))
            .toList(),
        actionPlan: (j['action_plan'] as List? ?? [])
            .map((e) => ActionPlanItem.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}
