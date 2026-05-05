// lib/ui/screens/what_it_means_screen.dart
// Screen 3 — What It Means
// Plain language explanations for each top finding.
// Receives LabInsightsResponse — makes ZERO additional API calls.

import 'package:flutter/material.dart';
import '../../lab_ai/lab_models.dart';
import 'action_plan_screen.dart';

class WhatItMeansScreen extends StatelessWidget {
  final LabInsightsResponse response;

  const WhatItMeansScreen({Key? key, required this.response}) : super(key: key);

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
          'What It Means',
          style: TextStyle(
              color: Color(0xFF1D3B5A),
              fontWeight: FontWeight.w800,
              fontSize: 20),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                itemCount: insights.length,
                itemBuilder: (_, i) => _ExplanationCard(insight: insights[i], index: i),
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
                      builder: (_) => ActionPlanScreen(response: response),
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1E3A8A),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Next: Action Plan',
                        style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                            fontSize: 16),
                      ),
                      SizedBox(width: 8),
                      Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 20),
                    ],
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

// ── Single Explanation Card ───────────────────────────────────────────────

class _ExplanationCard extends StatelessWidget {
  final LabInsight insight;
  final int index;

  const _ExplanationCard({required this.insight, required this.index});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, 4))
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Header ────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
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
                        fontSize: 15),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Text(
                    insight.biomarker,
                    style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 18,
                        color: Color(0xFF1E293B)),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),

          // ── Body ──────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'What it means',
                  style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                      color: Color(0xFF334155)),
                ),
                const SizedBox(height: 6),
                Text(
                  insight.whatItMeans,
                  style: const TextStyle(
                      fontSize: 14, color: Color(0xFF64748B), height: 1.5),
                ),
                const SizedBox(height: 20),
                const Text(
                  'Why it matters',
                  style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                      color: Color(0xFF334155)),
                ),
                const SizedBox(height: 6),
                Text(
                  insight.whyItMatters,
                  style: const TextStyle(
                      fontSize: 14, color: Color(0xFF64748B), height: 1.5),
                ),
              ],
            ),
          ),

          // ── Good News / Next Step Callout ────────────────────
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Color(0xFFF0FDF4),
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(16),
                bottomRight: Radius.circular(16),
              ),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.check_circle_rounded,
                    color: Color(0xFF10B981), size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    insight.goodNews,
                    style: const TextStyle(
                        color: Color(0xFF065F46),
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        height: 1.4),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
