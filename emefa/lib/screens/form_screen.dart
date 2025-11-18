// CLEAN: single-file implementation for FormScreen (no duplicates)
import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:intl_phone_field/intl_phone_field.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';

import 'selection_screen.dart';
import '../sheet_api.dart';
import '../config.dart';

class FormScreen extends StatefulWidget {
  const FormScreen({super.key});

  @override
  State<FormScreen> createState() => _FormScreenState();
}

class _FormScreenState extends State<FormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _chassisController = TextEditingController();
  final _nomController = TextEditingController();
  final _refController = TextEditingController();
  final _emailController = TextEditingController();
  final _telController = TextEditingController();
  final ImagePicker _picker = ImagePicker();
  String _phoneFull = '';
  List<File> _images = [];
  static const int maxPhotos = 3;

  bool _sending = false;
  bool _permissionsGranted = false;

  late final SheetApi _api;

  @override
  void initState() {
    super.initState();
    _api = SheetApi(baseUrl: appsScriptUrl, enableLogging: enableLogging);
    WidgetsBinding.instance.addPostFrameCallback((_) => _checkPermissions());
  }

  Future<void> _checkPermissions() async {
    // Request camera, microphone and location permissions
    final cam = await Permission.camera.request();
    final mic = await Permission.microphone.request();
    await Permission.locationWhenInUse.request();

    final granted = cam.isGranted && mic.isGranted;
    if (mounted) setState(() => _permissionsGranted = granted);
  }

  Future<String> _getAddress() async {
    try {
      if (!await Geolocator.isLocationServiceEnabled()) {
        return 'Localisation désactivée';
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          return 'Permission localisation refusée';
        }
      }

      if (permission == LocationPermission.deniedForever) {
        return 'Permissions localisation refusées définitivement';
      }

      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
        ),
      );
      final placemarks = await placemarkFromCoordinates(
        pos.latitude,
        pos.longitude,
      );
      if (placemarks.isNotEmpty) {
        final p = placemarks.first;
        final parts = <String>[];
        if ((p.street ?? '').isNotEmpty) parts.add(p.street!);
        if ((p.locality ?? '').isNotEmpty) parts.add(p.locality!);
        if ((p.postalCode ?? '').isNotEmpty) parts.add(p.postalCode!);
        if ((p.country ?? '').isNotEmpty) parts.add(p.country!);
        return parts.join(', ');
      }
    } catch (_) {}
    return 'Non disponible';
  }

  Future<void> _showImageSourceDialog() async {
    if (_images.length >= maxPhotos) {
      _showSnack('Maximum de $maxPhotos photos atteint', isError: true);
      return;
    }

    if (!_permissionsGranted) {
      await _checkPermissions();
      if (!_permissionsGranted) {
        _showSnack('Permission caméra requise', isError: true);
        return;
      }
    }

    if (!mounted) return;

    await showModalBottomSheet(
      context: context,
      builder: (BuildContext ctx) {
        return SizedBox(
          height: 160,
          child: Column(
            children: [
              ListTile(
                leading: const Icon(Icons.camera_alt),
                title: const Text('Prendre une photo'),
                onTap: () {
                  Navigator.pop(ctx);
                  _pick(ImageSource.camera);
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo_library),
                title: const Text('Choisir dans la galerie'),
                onTap: () {
                  Navigator.pop(ctx);
                  _pick(ImageSource.gallery);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _pick(ImageSource src) async {
    if (_images.length >= maxPhotos) return;
    final XFile? pick = await _picker.pickImage(source: src, imageQuality: 80);
    if (pick != null && mounted) setState(() => _images.add(File(pick.path)));
  }

  // Voice recording temporarily disabled (plugin caused build errors).
  // The mic button will show a message for now; re-add recording helpers
  // when the plugin integration is restored.

  Future<void> _send() async {
    if (_sending) return;
    if (!_formKey.currentState!.validate()) return;
    setState(() => _sending = true);
    try {
      final photos = await Future.wait(
        _images.map((f) => f.readAsBytes().then(base64Encode)),
      );
      final adresse = await _getAddress();

      final result = await _api.createRecord(
        chassis: _chassisController.text.trim(),
        nomPiece: _nomController.text.trim(),
        reference: _refController.text.trim().isEmpty
            ? null
            : _refController.text.trim(),
        email: _emailController.text.trim().isEmpty
            ? null
            : _emailController.text.trim(),
        telephone: _phoneFull.isNotEmpty
            ? _phoneFull
            : _telController.text.trim(),
        adresse: adresse,
        photoBase64: photos,
      );

      if (!mounted) return;
      if (result['status'] == 'ok') {
        _formKey.currentState?.reset();
        _chassisController.clear();
        _nomController.clear();
        _refController.clear();
        _telController.clear();
        setState(() => _images = []);
        _showSnack('Envoyé avec succès');
      } else {
        _showSnack('Erreur serveur', isError: true);
      }
    } catch (e) {
      _showSnack('Erreur: $e', isError: true);
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  void _showSnack(String msg, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: isError ? Colors.red : null,
      ),
    );
  }

  @override
  void dispose() {
    _chassisController.dispose();
    _nomController.dispose();
    _refController.dispose();
    _emailController.dispose();
    _telController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final disabled = _sending || !_permissionsGranted;
    final double fieldGap = 6.0;
    final double bottomPad = MediaQuery.of(context).viewInsets.bottom > 0
        ? MediaQuery.of(context).viewInsets.bottom + 10.0
        : 10.0;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            Navigator.of(context).pushReplacement(
              MaterialPageRoute(builder: (_) => const SelectionScreen()),
            );
          },
        ),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        title: const Text(
          'Passez vos commandes instantanément',
          style: TextStyle(fontSize: 16),
        ),
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 760),
          child: SingleChildScrollView(
            padding: EdgeInsets.fromLTRB(20, 20, 20, bottomPad),
            child: Card(
              color: Colors.white,
              elevation: 6,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Center(
                        child: Image.asset(
                          'assets/logo.png',
                          height: 90,
                          errorBuilder: (context, error, stackTrace) =>
                              const FlutterLogo(size: 72),
                        ),
                      ),
                      SizedBox(height: fieldGap),
                      // Photo button (Anuba style) placed above the chassis field
                      ElevatedButton.icon(
                        onPressed: disabled || _images.length >= maxPhotos
                            ? null
                            : _showImageSourceDialog,
                        icon: const Icon(Icons.camera_alt),
                        label: Text(
                          'Prendre une photo (${_images.length}/$maxPhotos)',
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Theme.of(
                            context,
                          ).colorScheme.primary,
                          foregroundColor: Colors.white,
                          elevation: 6,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          minimumSize: const Size.fromHeight(48),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(50),
                          ),
                          textStyle: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      if (_images.isNotEmpty) ...[
                        SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: _images.map((f) {
                              return Padding(
                                padding: const EdgeInsets.only(right: 8),
                                child: Stack(
                                  children: [
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(8),
                                      child: Image.file(
                                        f,
                                        height: 100,
                                        width: 100,
                                        fit: BoxFit.cover,
                                      ),
                                    ),
                                    Positioned(
                                      right: 2,
                                      top: 2,
                                      child: GestureDetector(
                                        onTap: () {
                                          setState(() => _images.remove(f));
                                        },
                                        child: Container(
                                          decoration: BoxDecoration(
                                            color: Colors.red.shade700,
                                            borderRadius: BorderRadius.circular(
                                              10,
                                            ),
                                          ),
                                          padding: const EdgeInsets.all(2),
                                          child: const Icon(
                                            Icons.close,
                                            size: 14,
                                            color: Colors.white,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                        SizedBox(height: fieldGap),
                      ],
                      SizedBox(height: fieldGap),
                      TextFormField(
                        controller: _chassisController,
                        decoration: const InputDecoration(
                          labelText: 'N° de châssis',
                        ),
                        validator: (v) =>
                            (v ?? '').trim().isEmpty && _images.isEmpty
                            ? 'N° de châssis requis si pas de photo'
                            : null,
                      ),
                      SizedBox(height: fieldGap),
                      // Nom + description with embedded mic recorder (like Anuba)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: TextFormField(
                          controller: _nomController,
                          keyboardType: TextInputType.text,
                          maxLength: 200,
                          minLines: 1,
                          maxLines: 3,
                          decoration: InputDecoration(
                            labelText: 'Nom et description de la pièce',
                            border: const UnderlineInputBorder(),
                            enabledBorder: UnderlineInputBorder(
                              borderSide: BorderSide(
                                color: Colors.grey.shade400,
                              ),
                            ),
                            focusedBorder: UnderlineInputBorder(
                              borderSide: BorderSide(
                                color: Theme.of(context).colorScheme.primary,
                                width: 2,
                              ),
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              vertical: 8,
                              horizontal: 12,
                            ),
                            suffixIcon: Padding(
                              padding: const EdgeInsets.only(right: 6.0),
                              child: Center(
                                widthFactor: 1,
                                child: IconButton(
                                  visualDensity: VisualDensity.compact,
                                  icon: Icon(
                                    Icons.mic,
                                    size: 24,
                                    color: Theme.of(
                                      context,
                                    ).colorScheme.primary,
                                  ),
                                  tooltip: 'Enregistrer vocal (désactivé)',
                                  onPressed: () {
                                    _showSnack(
                                      'Enregistrement vocal temporairement désactivé',
                                    );
                                  },
                                ),
                              ),
                            ),
                          ),
                          validator: (_) => null,
                        ),
                      ),
                      // Voice recording temporarily disabled; no recording banner
                      SizedBox(height: fieldGap),
                      TextFormField(
                        controller: _refController,
                        decoration: const InputDecoration(
                          labelText: 'Référence',
                        ),
                        validator: (v) =>
                            (v ?? '').trim().isEmpty && _images.isEmpty
                            ? 'Référence requise si pas de photo'
                            : null,
                      ),
                      SizedBox(height: fieldGap),
                      // Email field (require email or phone)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: TextFormField(
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          decoration: InputDecoration(
                            labelText: 'Email',
                            border: const UnderlineInputBorder(),
                            enabledBorder: UnderlineInputBorder(
                              borderSide: BorderSide(
                                color: Colors.grey.shade400,
                              ),
                            ),
                            focusedBorder: UnderlineInputBorder(
                              borderSide: BorderSide(
                                color: Theme.of(context).colorScheme.primary,
                                width: 2,
                              ),
                            ),
                            hintText: 'Entrez votre email',
                          ),
                          validator: (v) {
                            final email = (v ?? '').trim();
                            final phone = _phoneFull.trim();
                            if (email.isEmpty && phone.isEmpty) {
                              return 'Entrez un email ou un téléphone';
                            }
                            if (email.isNotEmpty) {
                              if (!RegExp(
                                r"^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}",
                              ).hasMatch(email)) {
                                return 'Email invalide';
                              }
                            }
                            return null;
                          },
                        ),
                      ),
                      SizedBox(height: fieldGap),
                      IntlPhoneField(
                        initialCountryCode: 'TG',
                        decoration: const InputDecoration(
                          labelText: 'Téléphone',
                        ),
                        onChanged: (phone) {
                          setState(() {
                            _phoneFull = phone.completeNumber;
                          });
                        },
                        onCountryChanged: (_) {},
                        validator: (_) {
                          final v = _phoneFull.trim();
                          if (v.isEmpty) {
                            return 'Champ requis';
                          }
                          if (!RegExp(r'^\+\d{6,}$').hasMatch(v)) {
                            return 'Numéro invalide';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 12),
                      SizedBox(height: fieldGap * 2),
                      ElevatedButton(
                        onPressed: disabled ? null : _send,
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                        child: _sending
                            ? const SizedBox(
                                height: 18,
                                width: 18,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              )
                            : const Text(
                                'Envoyer',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
