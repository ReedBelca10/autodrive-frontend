import 'package:flutter/material.dart';

class OtherScreen extends StatelessWidget {
  const OtherScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Autre'), centerTitle: true),
      body: const Center(
        child: Padding(
          padding: EdgeInsets.all(20.0),
          child: Text(
            'Page "Autre" — à définir\nVous pouvez implémenter ici un formulaire générique ou rediriger vers la page de commande.',
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}
