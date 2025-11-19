import 'package:flutter/material.dart';
import 'selection_screen.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _lineFade;
  late final Animation<double> _nameFade;
  late final Animation<double> _nameScale;
  late final Animation<Offset> _tagSlide;
  late final Animation<double> _tagFade;
  late final Animation<double> _logoFade;
  late final Animation<double> _logoScale;
  bool _navigated = false;

  @override
  void initState() {
    super.initState();
    // 3s animation with refined staggered intervals
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    );

    // Logo appears first
    _logoFade = CurvedAnimation(
      parent: _ctrl,
      curve: const Interval(0.0, 0.25, curve: Curves.easeOut),
    );
    _logoScale = Tween<double>(begin: 0.9, end: 1.0).animate(
      CurvedAnimation(
        parent: _ctrl,
        curve: const Interval(0.0, 0.25, curve: Curves.elasticOut),
      ),
    );

    // Small welcoming line
    _lineFade = CurvedAnimation(
      parent: _ctrl,
      curve: const Interval(0.18, 0.45, curve: Curves.easeOut),
    );

    // Name appears with scale and fade
    _nameFade = CurvedAnimation(
      parent: _ctrl,
      curve: const Interval(0.35, 0.75, curve: Curves.easeOut),
    );
    _nameScale = Tween<double>(begin: 0.86, end: 1.0).animate(
      CurvedAnimation(
        parent: _ctrl,
        curve: const Interval(0.35, 0.75, curve: Curves.elasticOut),
      ),
    );

    // Tagline slides and fades at the end
    _tagSlide = Tween<Offset>(begin: const Offset(0, 0.14), end: Offset.zero)
        .animate(
          CurvedAnimation(
            parent: _ctrl,
            curve: const Interval(0.7, 1.0, curve: Curves.easeOut),
          ),
        );
    _tagFade = CurvedAnimation(
      parent: _ctrl,
      curve: const Interval(0.7, 1.0, curve: Curves.easeIn),
    );

    _ctrl.forward();

    // Navigate when animation completes, unless skipped
    _ctrl.addStatusListener((status) {
      if (status == AnimationStatus.completed && !_navigated && mounted) {
        _navigateToSelection();
      }
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Stack(
          children: [
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  FadeTransition(
                    opacity: _logoFade,
                    child: ScaleTransition(
                      scale: _logoScale,
                      child: Image.asset(
                        'assets/logo.png',
                        width: 84,
                        height: 84,
                        errorBuilder: (_, __, ___) =>
                            const FlutterLogo(size: 84),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  FadeTransition(
                    opacity: _lineFade,
                    child: Text(
                      'Bienvenue sur',
                      style: TextStyle(fontSize: 18, color: Colors.grey[700]),
                    ),
                  ),
                  const SizedBox(height: 8),
                  FadeTransition(
                    opacity: _nameFade,
                    child: ScaleTransition(
                      scale: _nameScale,
                      child: Text(
                        'Emefa',
                        style: TextStyle(
                          fontSize: 42,
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).colorScheme.primary,
                          letterSpacing: 1.2,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SlideTransition(
                    position: _tagSlide,
                    child: FadeTransition(
                      opacity: _tagFade,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 28.0),
                        child: Text(
                          'L\'application pour traiter vos commandes en un clic',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Skip button top-right
            Positioned(
              right: 12,
              top: 12,
              child: TextButton(
                onPressed: () {
                  if (!_navigated) {
                    _navigated = true;
                    _ctrl.stop();
                    _navigateToSelection();
                  }
                },
                child: const Text('Passer'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

extension on _WelcomeScreenState {
  void _navigateToSelection() {
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (_, __, ___) => const SelectionScreen(),
        transitionsBuilder: (_, a, __, c) =>
            FadeTransition(opacity: a, child: c),
        transitionDuration: const Duration(milliseconds: 800),
      ),
    );
  }
}
