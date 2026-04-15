import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import '../../core/app_theme.dart';

class PraxiaBox extends StatelessWidget {
  final List<Widget> children;
  final double padding;
  const PraxiaBox({Key? key, required this.children, this.padding = 5}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white, 
        borderRadius: BorderRadius.circular(16), 
        border: Border.all(color: const Color(0xFFE2E8F0))
      ), 
      clipBehavior: Clip.antiAlias, 
      child: Padding(padding: EdgeInsets.all(padding), child: Column(children: children))
    );
  }
}

class PraxiaRow extends StatelessWidget {
  final String icon;
  final String title;
  final String subtitle;
  final bool last;
  const PraxiaRow({Key? key, required this.icon, required this.title, required this.subtitle, this.last = false}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16), 
      decoration: BoxDecoration(border: last ? null : const Border(bottom: BorderSide(color: Color(0xFFF8FAFC), width: 2))), 
      child: Row(children: [
        Text(icon), 
        const SizedBox(width: 12), 
        Expanded(child: Text(title, style: const TextStyle(fontWeight: FontWeight.bold))), 
        Text(subtitle, style: const TextStyle(color: Colors.green, fontSize: 12, fontWeight: FontWeight.bold)), 
        const SizedBox(width: 8), 
        const Icon(Icons.check_circle, color: Colors.green, size: 16)
      ])
    );
  }
}

class PraxiaMetricRow extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String value;
  final bool last;
  const PraxiaMetricRow({Key? key, required this.icon, required this.color, required this.title, required this.value, this.last = false}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16), 
      decoration: BoxDecoration(border: last ? null : const Border(bottom: BorderSide(color: Color(0xFFF8FAFC), width: 2))), 
      child: Row(children: [
        Icon(icon, color: color, size: 20), 
        const SizedBox(width: 12), 
        Expanded(child: Text(title, style: const TextStyle(fontWeight: FontWeight.bold))), 
        Text(value, style: const TextStyle(fontWeight: FontWeight.w900)), 
        const Icon(Icons.chevron_right, color: Colors.grey, size: 16)
      ])
    );
  }
}

class PraxiaMessageBubble extends StatelessWidget {
  final String text;
  final bool isUser;
  const PraxiaMessageBubble({Key? key, required this.text, required this.isUser}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        padding: const EdgeInsets.all(16),
        constraints: const BoxConstraints(maxWidth: 320),
        decoration: BoxDecoration(
          color: isUser ? AppColors.primary : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(20),
        ),
        child: MarkdownBody(
          data: text,
          styleSheet: MarkdownStyleSheet(
            p: TextStyle(color: isUser ? Colors.white : Colors.black, height: 1.4, fontSize: 13),
            tableBody: TextStyle(color: isUser ? Colors.white : Colors.black, fontSize: 11),
            tableHead: TextStyle(color: isUser ? Colors.white : Colors.black, fontWeight: FontWeight.bold, fontSize: 11),
            tableBorder: TableBorder.all(color: isUser ? Colors.white24 : Colors.black12, width: 1),
          ),
        ),
      ),
    );
  }
}

class PraxiaWhatIfCard extends StatelessWidget {
  final String label;
  final String score;
  final String assetPath;
  const PraxiaWhatIfCard({Key? key, required this.label, required this.score, required this.assetPath}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8, offset: const Offset(0, 4))],
        border: Border.all(color: Colors.black.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          Image.asset(assetPath, width: 22, height: 22, errorBuilder: (c,e,s) => const Icon(Icons.image, size: 22)),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black87, fontSize: 13),
              overflow: TextOverflow.ellipsis,
              maxLines: 1,
            ),
          ),
          const SizedBox(width: 8),
          const Icon(Icons.arrow_forward_rounded, color: Colors.grey, size: 14),
          const SizedBox(width: 8),
          const Text('Score ', style: TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.w500)),
          Text(score, style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 16)),
        ],
      ),
    );
  }
}
