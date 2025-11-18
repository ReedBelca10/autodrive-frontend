const SHEET_ID        = '1Z6CIFDKNVojCs_l84KbkZBAJqxZ6xBodl49j4ewCfBk';
const SHEET_NAME      = 'emefa';
const DRIVE_FOLDER_ID = '1fhLIyeTDQlGfcClNm6LxaI18z96czQQ3';

function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) {
      throw new Error('Aucune donnée reçue (e.postData vide)');
    }

    const data = JSON.parse(e.postData.contents);

    // --- 1. Sauvegarde des images sur Google Drive ---
    let imageUrls = [];

    if (Array.isArray(data.photoBase64)) {
      data.photoBase64.forEach(b64 => {
        if (b64) {
          const bytes = Utilities.base64Decode(b64);
          const url = _saveToDrive(bytes);
          imageUrls.push(url);
        }
      });
    }

    // --- 2. Enregistrement dans Google Sheets ---
    _appendSheetRow([
      data  ['Date'] || '',
      data ['N° de chassis'] || '',
      data ['Nom de la piece'] || '',
      data ['Reference']  || '',
      data ['Telephone']  || '',
      data ['Adresse'] || '',
      imageUrls.join(', '),
    ]);
    _sendToOdooCRM(data, imageUrls)

  } catch (err) {
    console.error('doPost error:', err);
    return _jsonResponse({ status: 'error', message: err.message }, 500);
  }
}


function doGet() {
  try {
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error(`Onglet "${SHEET_NAME}" introuvable`);

    const rows = sheet.getDataRange().getValues();
    const headers = rows.shift();
    const records = rows.map(r => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = r[i]);
      return obj;
    });

    return _jsonResponse(records);
  } catch (err) {
    console.error('doGet error:', err);
    return _jsonResponse({ status: 'error', message: err.message }, 500);
  }
}


function _appendSheetRow(values) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error(`Onglet "${SHEET_NAME}" introuvable`);
  sheet.appendRow(values);
}

function _saveToDrive(bytes) {
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const name   = `photo_${Date.now()}.jpg`;
  const blob   = Utilities.newBlob(bytes, 'image/jpeg', name);
  const file   = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return `https://drive.google.com/uc?export=view&id=${file.getId()}`;
}


function _sendToOdooCRM(data, imageUrls) {
try {
  const to = "info@aniekgroup.odoo.com";
  const subject = `Nouvelle opportunité : ${data['Nom de la piece'] || 'Client inconnu'}`;

  const body = `
  <div style="font-family: 'Segoe UI', Roboto, sans-serif; color: #04554aff; background-color: #f5f6fa; padding: 25px;">
    <div style="max-width: 650px; margin: auto; background: #fff; border-radius: 14px; box-shadow: 0 3px 12px rgba(0,0,0,0.08); overflow: hidden;">
      <div style="background: #007BFF; color: #000; padding: 20px 25px;">
        <h2 style="margin: 0;">Nouvelle Demande Client</h2>
      </div>

      <div style="padding: 25px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;"><b>N° de châssis :</b></td>
            <td>${data['N° de chassis'] || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><b>Nom :</b></td>
            <td>${data['Nom de la piece'] || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><b>Référence :</b></td>
            <td>${data['Reference'] || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><b>Téléphone :</b></td>
            <td>${data['Telephone'] || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><b>Adresse :</b></td>
            <td>${data['Adresse'] || '—'}</td>
          </tr>
        </table>

        <h3 style="margin-top:20px;">Photos associées :</h3>
        ${imageUrls.length > 0 
          ? imageUrls.map(url => `<p><a href="${url}" target="_blank" style="color:#1E88E5;">${url}</a></p>`).join('')
          : '<p>Aucune image fournie.</p>'
        }
      </div>

      <div style="background: #f1f1f1; text-align: center; padding: 12px; font-size: 12px; color: #666;">
        <p>© ${new Date().getFullYear()} Portail Clients - Aniek Group</p>
      </div>
    </div>
  </div>
  `;

  MailApp.sendEmail({
    to: to,
    subject: subject,
    htmlBody: body,
  });

  console.log('E-mail envoyé à Odoo CRM pour le client :', data['Nom de la piece']);

} catch (err) {
  console.error('Erreur lors de l’envoi vers Odoo CRM:', err);
}

}


function _jsonResponse(obj, code = 200) {
  const output = ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  
  // Supprimer cette ligne si ton runtime ne supporte pas ALLOWALL
  if (ContentService.XFrameOptionsMode) {
    output.setXFrameOptionsMode(ContentService.XFrameOptionsMode.ALLOWALL);
  }

  return output;
}
