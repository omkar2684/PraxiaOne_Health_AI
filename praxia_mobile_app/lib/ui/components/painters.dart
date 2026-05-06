import 'package:flutter/material.dart';
import 'dart:math' as math;

class GaugePainter extends CustomPainter {
  final double p; 
  GaugePainter(this.p);
  
  @override void paint(Canvas c, Size s) {
    final center = Offset(s.width/2, s.height/2);
    final radius = s.width/2-15;
    final rect = Rect.fromCircle(center: center, radius: radius);
    final startAngle = math.pi * 0.75;
    final totalSweep = math.pi * 1.5;
    
    // Background Track
    c.drawArc(rect, startAngle, totalSweep, false, Paint()..color=const Color(0xFFF1F5F9)..style=PaintingStyle.stroke..strokeWidth=18..strokeCap=StrokeCap.round);
    
    // Progress Track
    final progressPaint = Paint()..color=const Color(0xFF10B981)..style=PaintingStyle.stroke..strokeWidth=20..strokeCap=StrokeCap.round;
    c.drawArc(rect, startAngle, totalSweep * p, false, progressPaint);
    
    // The Needle (Arrow at the end)
    final needleAngle = startAngle + totalSweep * p;
    final needleX = center.dx + radius * math.cos(needleAngle);
    final needleY = center.dy + radius * math.sin(needleAngle);
    
    final needlePaint = Paint()..color=const Color(0xFF64748B)..style=PaintingStyle.fill;
    
    final path = Path();
    path.moveTo(needleX, needleY);
    path.lineTo(needleX + 12 * math.cos(needleAngle + 0.6), needleY + 12 * math.sin(needleAngle + 0.6));
    path.lineTo(needleX + 12 * math.cos(needleAngle - 0.6), needleY + 12 * math.sin(needleAngle - 0.6));
    path.close();
    c.drawPath(path, needlePaint);
  }
  @override bool shouldRepaint(covariant GaugePainter oldDelegate) => oldDelegate.p != p;
}

class LineChartPainter extends CustomPainter {
  final List<double> data;
  final Color color;
  LineChartPainter(this.data, this.color);

  @override
  void paint(Canvas c, Size s) {
    if (data.isEmpty) return;
    final paint = Paint()..color=color..strokeWidth=3..style=PaintingStyle.stroke..strokeCap=StrokeCap.round;
    final fillPaint = Paint()..shader=LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [color.withOpacity(0.3), color.withOpacity(0)]).createShader(Rect.fromLTWH(0, 0, s.width, s.height));

    final path = Path();
    final fillPath = Path();
    
    double maxVal = data.reduce(math.max);
    double minVal = data.reduce(math.min);
    double range = maxVal - minVal;
    if (range == 0) range = 1;

    for (int i = 0; i < data.length; i++) {
      double x = (s.width / (data.length - 1)) * i;
      double y = s.height - ((data[i] - minVal) / range) * s.height * 0.8;
      
      if (i == 0) {
        path.moveTo(x, y);
        fillPath.moveTo(x, s.height);
        fillPath.lineTo(x, y);
      } else {
        path.lineTo(x, y);
        fillPath.lineTo(x, y);
      }
      
      if (i == data.length - 1) {
        fillPath.lineTo(x, s.height);
        fillPath.close();
      }
    }
    
    c.drawPath(fillPath, fillPaint);
    c.drawPath(path, paint);
    
    // Draw points
    for (int i = 0; i < data.length; i++) {
      double x = (s.width / (data.length - 1)) * i;
      double y = s.height - ((data[i] - minVal) / range) * s.height * 0.8;
      c.drawCircle(Offset(x, y), 4, Paint()..color=color);
      c.drawCircle(Offset(x, y), 2, Paint()..color=Colors.white);
    }
  }
  @override bool shouldRepaint(covariant LineChartPainter oldDelegate) => oldDelegate.data != data || oldDelegate.color != color;
}

class ChartPainter extends CustomPainter {
  @override void paint(Canvas c, Size s) {
    final p = Paint()..color=Colors.red..strokeWidth=3..style=PaintingStyle.stroke;
    final path = Path()..moveTo(0, s.height*0.7)..lineTo(s.width*0.3, s.height*0.6)..lineTo(s.width*0.6, s.height*0.8)..lineTo(s.width, s.height*0.2);
    c.drawPath(path, p);
  }
  @override bool shouldRepaint(v) => false;
}
