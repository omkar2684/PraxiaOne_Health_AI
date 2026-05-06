import 'package:flutter/material.dart';
import '../../core/style_constants.dart';

class PraxiaCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;

  const PraxiaCard({
    super.key,
    required this.child,
    this.padding,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(StyleConstants.borderRadius),
        boxShadow: StyleConstants.softShadow,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(StyleConstants.borderRadius),
          child: Padding(
            padding: padding ?? const EdgeInsets.all(StyleConstants.paddingUnit),
            child: child,
          ),
        ),
      ),
    );
  }
}

class PraxiaBox extends StatelessWidget {
  final List<Widget> children;
  final double padding;

  const PraxiaBox({super.key, required this.children, this.padding = 24});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(padding),
      width: double.infinity,
      decoration: StyleConstants.cardShadowDecoration,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: children),
    );
  }
}
