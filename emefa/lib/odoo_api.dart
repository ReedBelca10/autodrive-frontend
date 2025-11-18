// odoo_api.dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class OdooApi {
  final String url; // ex: https://odoo.monsite.com
  final String db; // nom de la base
  final String username; // email ou login
  final String password; // mot de passe

  int? _uid;

  OdooApi({
    required this.url,
    required this.db,
    required this.username,
    required this.password,
  });

  Uri get _rpcUri => Uri.parse('$url/jsonrpc');

  Future<void> authenticate() async {
    final body = jsonEncode({
      'jsonrpc': '2.0',
      'method': 'call',
      'params': {
        'service': 'common',
        'method': 'login',
        'args': [db, username, password],
      },
    });

    final res = await http.post(
      _rpcUri,
      headers: {'Content-Type': 'application/json'},
      body: body,
    );
    final data = jsonDecode(res.body);
    _uid = data['result'] as int?;
    if (_uid == null) {
      throw Exception('Auth Odoo échouée');
    }
  }

  Future<int> createLead({
    required String name,
    required String phone,
    required String description,
  }) async {
    if (_uid == null) {
      await authenticate();
    }

    final args = [
      db,
      _uid,
      password,
      'crm.lead',
      'create',
      [
        {'name': name, 'phone': phone, 'description': description},
      ],
    ];
    final body = jsonEncode({
      'jsonrpc': '2.0',
      'method': 'call',
      'params': {'service': 'object', 'method': 'execute_kw', 'args': args},
    });

    final res = await http.post(
      _rpcUri,
      headers: {'Content-Type': 'application/json'},
      body: body,
    );
    final data = jsonDecode(res.body);
    return data['result'] as int;
  }

  Future<int> attachImageToLead({
    required int leadId,
    required String fileName,
    required String base64Image,
  }) async {
    if (_uid == null) {
      await authenticate();
    }

    final record = {
      'name': fileName,
      'datas': base64Image,
      'res_model': 'crm.lead',
      'res_id': leadId,
      'mimetype': 'image/jpeg',
    };
    final args = [
      db,
      _uid,
      password,
      'ir.attachment',
      'create',
      [record],
    ];
    final body = jsonEncode({
      'jsonrpc': '2.0',
      'method': 'call',
      'params': {'service': 'object', 'method': 'execute_kw', 'args': args},
    });

    final res = await http.post(
      _rpcUri,
      headers: {'Content-Type': 'application/json'},
      body: body,
    );
    final data = jsonDecode(res.body);
    return data['result'] as int;
  }
}
