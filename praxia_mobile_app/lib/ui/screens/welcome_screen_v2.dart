import 'package:flutter/material.dart';
import '../../core/style_constants.dart';
import '../components/praxia_button.dart';
import '../widgets/app_drawer.dart';
import 'login_screen.dart';
import 'registration_screen.dart';

class WelcomeScreenV2 extends StatelessWidget {
  const WelcomeScreenV2({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      drawer: const AppDrawer(),
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Color(0xFF1D3B5A)), // Navy blue hamburger menu
      ),
      body: SingleChildScrollView(
          child: Column(
            children: [
              // 1. Header
              _buildHeader(),
              
              // 2. Hero Section
              _buildHeroSection(context),
              
              // 4. Features Grid
              _buildFeaturesGrid(),
              
              // 5. Combined Footer (Security + Links)
              _buildCombinedFooter(),
              
              const SizedBox(height: 20),
            ],
          ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(28, 20, 24, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start, // Left-align for Image 1 look
        children: [
          Image.asset(
            'public/welcome_screen/PraxiaOne_logo.png',
            height: 52,
            fit: BoxFit.contain,
          ),
          const SizedBox(height: 2),
          const Padding(
            padding: EdgeInsets.only(left: 4), // Slight nudge to align with "P"
            child: Text(
              "AI-Driven Personalized Wellness",
              style: TextStyle(
                fontSize: 12,
                color: Color(0xFF1D3B5A), // Matches the logo's navy blue
                fontWeight: FontWeight.w600,
                letterSpacing: 0.1,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroSection(BuildContext context) {
    return Container(
      height: 320, // Increased height to accommodate buttons
      width: double.infinity,
      decoration: BoxDecoration(
        image: DecorationImage(
          image: const AssetImage('public/welcome_screen/woman.png'),
          fit: BoxFit.cover,
          colorFilter: ColorFilter.mode(
            Colors.black.withOpacity(0.1),
            BlendMode.darken,
          ),
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            left: 24,
            top: 40,
            child: const Text(
              "Your Health,\nYour Data,\nYour Way",
              style: TextStyle(
                fontSize: 34,
                fontWeight: FontWeight.bold,
                color: Colors.white,
                height: 1.2,
                shadows: [
                  Shadow(color: Colors.black45, offset: Offset(0, 2), blurRadius: 8),
                ],
              ),
            ),
          ),
          Positioned(
            left: 24,
            right: 24,
            bottom: 30,
            child: Row(
              children: [
                  Expanded(
                  child: PraxiaButton(
                    text: "Get Started",
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const RegistrationScreen()));
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: PraxiaButton(
                    text: "Log In",
                    outline: true, // Switched to outline to comply with UI constants
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }


  Widget _buildFeaturesGrid() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      // Adding shadow for the new visual format you requested
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(
          top: BorderSide(color: Colors.grey.shade200, width: 1),
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              _buildGridItem(
                'Personalized Wellness Insights',
                'Tailored Health Recommendations',
                'public/welcome_screen/heart_icon.png',
                hasRightBorder: true,
                hasBottomBorder: true,
              ),
              _buildGridItem(
                'Secure Data Integration',
                'Self, Labs, Wearables, EHR',
                'public/welcome_screen/data_icon.png',
                hasBottomBorder: true,
              ),
            ],
          ),
          Row(
            children: [
              _buildGridItem(
                'AI-Assisted Guidance',
                'Smart Health Recommendations',
                'public/welcome_screen/lightbulb icon.png',
                hasRightBorder: true,
              ),
              _buildGridItem(
                'Optional Telehealth Access',
                'Connect with Providers',
                'public/welcome_screen/telehealth_icon.png',
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildGridItem(String title, String subtitle, String image,
      {bool hasRightBorder = false, bool hasBottomBorder = false}) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
        decoration: BoxDecoration(
          border: Border(
            right: hasRightBorder
                ? BorderSide(color: Colors.grey.shade200, width: 1)
                : BorderSide.none,
            bottom: hasBottomBorder
                ? BorderSide(color: Colors.grey.shade200, width: 1)
                : BorderSide.none,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min, // Keep content compact
          children: [
            Image.asset(
              image,
              height: 52,
              width: 52,
              fit: BoxFit.contain,
            ),
            const SizedBox(height: 12),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 14,
                color: Color(0xFF1A3B5D),
                height: 1.2,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 11,
                color: Colors.grey.shade600,
                letterSpacing: 0.1,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCombinedFooter() {
    return Container(
      margin: const EdgeInsets.only(top: 30),
      width: double.infinity,
      decoration: const BoxDecoration(
        color: Color(0xFF2E4E7E), // Dark blue from design
      ),
      child: Column(
        children: [
          // Security Items
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildComplianceItem(Icons.verified_user_rounded, "HIPAA Compliant", Colors.green.shade400),
                    const SizedBox(width: 24),
                    _buildComplianceItem(Icons.security_rounded, "Secure & Encrypted", Colors.blue.shade300),
                  ],
                ),
                const SizedBox(height: 16),
                _buildComplianceItem(Icons.inventory_2_rounded, "User Controlled Consent", Colors.blue.shade200),
              ],
            ),
          ),
          
          // Divider
          Divider(color: Colors.white.withOpacity(0.2), height: 1),
          
          // Footer Links
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildFooterLink("Privacy Policy"),
                _buildFooterVerticalDivider(),
                _buildFooterLink("Terms of Service"),
                _buildFooterVerticalDivider(),
                _buildFooterLink("Contact Us"),
              ],
            ),
          ),
          const SizedBox(height: 10),
        ],
      ),
    );
  }

  Widget _buildComplianceItem(IconData icon, String label, Color iconColor) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: iconColor, size: 22),
        const SizedBox(width: 8),
        Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 13,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildFooterLink(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 12,
        color: Colors.white,
        fontWeight: FontWeight.bold,
        decoration: TextDecoration.none, // Removed underline
      ),
    );
  }

  Widget _buildFooterVerticalDivider() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10),
      child: Text("|", style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12)),
    );
  }
}
