import 'package:flutter/material.dart';
import '../../core/app_theme.dart';

class PraxiaButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool outline;
  final EdgeInsets? margin;
  final EdgeInsetsGeometry? padding;
  final Widget? icon;
  final bool isLoading;
  
  const PraxiaButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.outline = false,
    this.margin,
    this.padding,
    this.icon,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: margin,
      width: double.infinity,
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: outline ? Colors.white : AppColors.primary,
          side: outline ? BorderSide(color: Colors.grey.shade300) : null,
          elevation: 0,
          padding: padding ?? const EdgeInsets.symmetric(vertical: 18),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        child: isLoading 
            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
            : Row(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (icon != null) ...[icon!, const SizedBox(width: 8)],
                  Text(
                    text, 
                    style: TextStyle(
                      color: outline ? Colors.black : Colors.white, 
                      fontWeight: FontWeight.bold
                    )
                  ),
                ],
              ),
      ),
    );
  }
}
