import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:praxia_mobile_app/main.dart';

void main() {
  testWidgets('App loads smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const PraxiaApp());

    // Verify that our app builds successfully (at least the material app)
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
