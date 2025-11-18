import 'package:flutter/material.dart';
import 'form_screen.dart';
import 'other_screen.dart';

class SelectionScreen extends StatelessWidget {
  const SelectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final primary = Theme.of(context).colorScheme.primary;
    final screenW = MediaQuery.of(context).size.width;
    final btnWidth = screenW > 520 ? 520.0 : screenW * 0.86;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        // Minimal AppBar — remove automatic back icon to prevent accidental navigation
        backgroundColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: false,
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                'Quel genre de pièce voulez-vous commander ?',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: Colors.grey[900],
                  height: 1.25,
                ),
              ),
              const SizedBox(height: 32),

              SizedBox(
                width: btnWidth,
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.directions_car, size: 20),
                  label: const Text('Véhicule'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primary,
                    foregroundColor: Colors.white,
                    elevation: 6,
                    shadowColor: primary.withOpacity(0.28),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    textStyle: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const FormScreen()),
                    );
                  },
                ),
              ),

              const SizedBox(height: 18),

              SizedBox(
                width: btnWidth,
                child: Material(
                  elevation: 3,
                  borderRadius: BorderRadius.circular(12),
                  child: OutlinedButton.icon(
                    icon: Icon(Icons.build, color: primary, size: 20),
                    label: const Text('Autre'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      side: BorderSide(color: primary, width: 1.6),
                      backgroundColor: Colors.white,
                      foregroundColor: primary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      textStyle: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const OtherScreen()),
                      );
                    },
                  ),
                ),
              ),

              const SizedBox(height: 26),
              Text(
                'Vous pouvez revenir en arrière à tout moment',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey[600], fontSize: 13),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
