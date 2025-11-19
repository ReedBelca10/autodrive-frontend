import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;

class SheetApi {
  final String baseUrl;
  final Duration timeout;
  final bool enableLogging;

  SheetApi({
    required this.baseUrl,
    this.timeout = const Duration(seconds: 20),
    this.enableLogging = false,
  });

  void _log(String msg) {
    if (enableLogging) {
      // ignore: avoid_print
      print('[SheetApi] $msg');
    }
  }

  /// Envoie le payload et suit les 302 (POST→POST, fallback GET)
  Future<Map<String, dynamic>> createRecord({
    required String chassis,
    required String nomPiece,
    String? reference,
    required String telephone,
    required String adresse,
    required List<String> photoBase64,
    String? email,
    String? audioBase64,
    String? audioFilename,
  }) async {
    final payload = <String, dynamic>{
      'Date': DateTime.now().toIso8601String(),
      'N° de chassis': chassis,
      'Nom de la piece': nomPiece,
      if (reference != null && reference.trim().isNotEmpty)
        'Reference': reference.trim(),
      'Telephone': telephone.trim(),
      if (email != null && email.trim().isNotEmpty) 'Email': email.trim(),
      'Adresse': adresse,
      'photoBase64': photoBase64,
      if (audioBase64 != null) 'audioBase64': audioBase64,
      if (audioFilename != null) 'audioFilename': audioFilename,
    };

    final headers = <String, String>{
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
    };

    _log('→ POST $baseUrl');
    _log('payload: $payload');

    http.Response res;
    try {
      res = await http
          .post(Uri.parse(baseUrl), headers: headers, body: jsonEncode(payload))
          .timeout(timeout);
    } on TimeoutException {
      throw Exception('Le délai d’envoi est dépassé');
    } catch (e) {
      throw Exception('Erreur réseau initiale');
    }

    // Si 302 : on suit la redirection
    if (res.statusCode == 302) {
      final loc = res.headers['location'];
      _log('← 302, location: $loc');
      if (loc != null) {
        // Essaye POST vers URL redirigée
        try {
          _log('→ POST redirigé $loc');
          res = await http
              .post(Uri.parse(loc), headers: headers, body: jsonEncode(payload))
              .timeout(timeout);
        } catch (e) {
          _log('Erreur POST redirigé: $e');
        }

        // Si toujours pas 200, fallback GET
        if (res.statusCode != 200) {
          try {
            _log('→ GET redirigé $loc');
            res = await http
                .get(Uri.parse(loc), headers: {'Accept': 'application/json'})
                .timeout(timeout);
          } catch (e) {
            _log('Erreur GET redirigé: $e');
          }
        }
      }
    }

    _log('← HTTP ${res.statusCode}');
    _log('body: ${res.body}');

    if (res.statusCode != 200) {
      throw Exception('');
    }

    try {
      final json = jsonDecode(res.body);
      if (json is Map<String, dynamic>) {
        return json;
      }
      return {'status': 'ok', 'raw': res.body};
    } catch (e) {
      _log('JSON parse échoué: $e');
      return {'status': 'ok', 'raw': res.body};
    }
  }
}
