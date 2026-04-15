import 'package:flutter/material.dart';

class PraxiaRow extends StatelessWidget {
  final String iconStr;
  final String title;
  final String status;
  final bool last;

  const PraxiaRow(this.iconStr, this.title, this.status, {Key? key, this.last = false}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16), 
      decoration: BoxDecoration(border: last ? null : const Border(bottom: BorderSide(color: Color(0xFFF8FAFC), width: 2))), 
      child: Row(children: [
        Text(iconStr), 
        const SizedBox(width: 12), 
        Expanded(child: Text(title, style: const TextStyle(fontWeight: FontWeight.bold))), 
        Text(status, style: const TextStyle(color: Colors.green, fontSize: 12, fontWeight: FontWeight.bold)), 
        const SizedBox(width: 8), 
        const Icon(Icons.check_circle, color: Colors.green, size: 16)
      ])
    );
  }
}

class PraxiaMetric extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String value;
  final bool last;
  final VoidCallback? onTap;
  final Widget? statusWidget;

  const PraxiaMetric(
    this.icon, this.color, this.title, this.value, 
    {Key? key, this.last = false, this.onTap, this.statusWidget}
  ) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16), 
        decoration: BoxDecoration(border: last ? null : const Border(bottom: BorderSide(color: Color(0xFFF8FAFC), width: 2))), 
        child: Row(children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(width: 12),
          Expanded(child: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16))),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF334155))),
          const SizedBox(width: 8),
          if (statusWidget != null) statusWidget!,
          const Icon(Icons.chevron_right, color: Colors.grey, size: 20),
        ])
      ),
    );
  }
}

class PraxiaJourneyStep extends StatelessWidget {
  final int numLabel;
  final String title;
  final String subtitle;
  final bool isCompleted;

  const PraxiaJourneyStep(this.numLabel, this.title, this.subtitle, this.isCompleted, {Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20), 
      child: Row(children: [
        CircleAvatar(
          backgroundColor: isCompleted ? const Color(0xFF10B981) : Colors.grey.shade200, 
          child: Text('$numLabel', style: TextStyle(color: isCompleted ? Colors.white : Colors.grey))
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start, 
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold)), 
              Text(subtitle, style: TextStyle(color: isCompleted ? const Color(0xFF10B981) : Colors.grey, fontSize: 12))
            ]
          )
        ),
        if (isCompleted) const Icon(Icons.check_circle, color: Color(0xFF10B981)),
      ])
    );
  }
}

class PraxiaWhatIf extends StatelessWidget {
  final String title;
  final String score;
  
  const PraxiaWhatIf(this.title, this.score, {Key? key}) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12), 
      padding: const EdgeInsets.all(16), 
      decoration: BoxDecoration(
        color: Colors.white, 
        border: Border.all(color: Colors.grey.shade200), 
        borderRadius: BorderRadius.circular(12)
      ), 
      child: Row(children: [
        Text(title), 
        const Spacer(), 
        const Text('Score ', style: TextStyle(color: Colors.grey, fontSize: 12)), 
        Text(score, style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 18))
      ])
    );
  }
}
