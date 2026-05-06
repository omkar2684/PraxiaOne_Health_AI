// lib/ui/screens/ai_insights_screen.dart
// Screen 2 — AI Insights
// Shows the top 3 findings returned by DeepSeek.
// Receives LabInsightsResponse — makes ZERO additional API calls.

import 'package:flutter/material.dart';
import '../../lab_ai/lab_models.dart';
import 'what_it_means_screen.dart';

class AIInsightsScreen extends StatelessWidget {
  final LabInsightsResponse response;

  const AIInsightsScreen({Key? key, required this.response}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final insights = response.insights.take(3).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF2F4F7),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              color: Color(0xFF1D3B5A), size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'AI Insights',
          style: TextStyle(
              color: Color(0xFF1D3B5A),
              fontWeight: FontWeight.w800,
              fontSize: 20),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // ── Intro banner ──────────────────────────────────────────
            Container(
              margin: const EdgeInsets.fromLTRB(16, 14, 16, 6),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFBFDBFE)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.auto_awesome_rounded,
                      color: Color(0xFF2563EB), size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'DeepSeek identified ${insights.length} key findings from your blood panel.',
                      style: const TextStyle(
                          color: Color(0xFF1D4ED8),
                          fontWeight: FontWeight.w600,
                          fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),

            // ── "Top 3 Findings" label ────────────────────────────────
            const Padding(
              padding: EdgeInsets.fromLTRB(16, 10, 16, 6),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Top 3 Findings',
                  style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF1E293B)),
                ),
              ),
            ),

            // ── Insight cards ─────────────────────────────────────────
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: insights.length,
                itemBuilder: (_, i) =>
                    _InsightCard(insight: insights[i], index: i),
              ),
            ),

            // ── Bottom button ─────────────────────────────────────────
            Container(
              color: Colors.white,
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
              child: SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => WhatItMeansScreen(response: response),
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1E3A8A),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                  child: const Text(
                    'See What This Means',
                    style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 16),
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

// ── Single insight card ───────────────────────────────────────────────────

class _InsightCard extends StatelessWidget {
  final LabInsight insight;
  final int index;

  const _InsightCard({required this.insight, required this.index});

  Color get _badgeColor {
    switch (insight.status.toLowerCase()) {
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
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 4))
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Numbered badge
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: const Color(0xFF1D3B5A),
              borderRadius: BorderRadius.circular(100),
            ),
            alignment: Alignment.center,
            child: Text(
              '${index + 1}',
              style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                  fontSize: 14),
            ),
          ),
          const SizedBox(width: 12),
          // Text
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        insight.biomarker,
                        style: const TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 15,
                            color: Color(0xFF1E293B)),
                      ),
                    ),
                    const SizedBox(width: 8),
                    // Status badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: _badgeColor.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(100),
                      ),
                      child: Text(
                        insight.status,
                        style: TextStyle(
                            color: _badgeColor,
                            fontWeight: FontWeight.w700,
                            fontSize: 12),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  insight.shortDescription,
                  style: const TextStyle(
                      fontSize: 13, color: Color(0xFF64748B), height: 1.4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
