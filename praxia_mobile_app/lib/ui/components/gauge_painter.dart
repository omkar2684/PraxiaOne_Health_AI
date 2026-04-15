import 'package:flutter/material.dart';
import 'dart:math' as math;

class GaugePainter extends CustomPainter {
  final double p;
  GaugePainter(this.p);

  @override
  void paint(Canvas c, Size s) {
    final rect = Rect.fromCircle(center: Offset(s.width / 2, s.height / 2), radius: s.width / 2 - 10);
    
    // Background arc (gray)
    c.drawArc(
      rect,
      math.pi * 0.75,
      math.pi * 1.5,
      false,
      Paint()
        ..color = const Color(0xFFF1F5F9)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 14
        ..strokeCap = StrokeCap.round
    );

    // Progress arc (emerald)
    c.drawArc(
      rect,
      math.pi * 0.75,
      math.pi * 1.5 * p,
      false,
      Paint()
        ..color = const Color(0xFF10B981)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 16
        ..strokeCap = StrokeCap.round
    );
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => true;
}

class ChartPainter extends CustomPainter {
  final List<double> dataPoints;
  ChartPainter({required this.dataPoints});

  @override
  void paint(Canvas c, Size s) {
    if (dataPoints.isEmpty) return;

    final p = Paint()
      ..color = Colors.red
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke
      ..strokeJoin = StrokeJoin.round;

    final path = Path();
    double maxVal = dataPoints.reduce(math.max);
    double minVal = dataPoints.reduce(math.min);
    
    // add some padding to min/max
    maxVal = maxVal == minVal ? maxVal + 1 : maxVal + (maxVal - minVal) * 0.2;
    minVal = minVal == maxVal ? minVal - 1 : minVal - (maxVal - minVal) * 0.2;

    final xStep = dataPoints.length > 1 ? s.width / (dataPoints.length - 1) : s.width;

    for (int i = 0; i < dataPoints.length; i++) {
      double x = i * xStep;
      double y = s.height - ((dataPoints[i] - minVal) / (maxVal - minVal) * s.height);
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    c.drawPath(path, p);
  }

  @override
  bool shouldRepaint(covariant ChartPainter oldDelegate) {
    return oldDelegate.dataPoints != dataPoints;
  }
}
