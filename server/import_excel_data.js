import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, syncAllDistrictMetrics, ensureDistrictExists } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runImport() {
  const xlsx = await import('../client/node_modules/xlsx/xlsx.mjs');
  const excelDir = path.resolve(__dirname, '..', 'excel');

  if (!fs.existsSync(excelDir)) {
    console.error('Directory not found:', excelDir);
    return;
  }

  const files = fs.readdirSync(excelDir).filter(f => f.endsWith('.xlsx') || f.endsWith('.xls'));
  console.log(`[Import] Found ${files.length} Excel directory files in ${excelDir}`);

  // Mapping of filenames to their designated target districts
  const fileDistrictMap = {
    'Ballari_District_KASAPA_Directory.xlsx': 'Ballari',
    'Belagavi_District_KASAPA_Directory.xlsx': 'Belagavi',
    'Bengaluru_1_Directory.xlsx': 'Bengaluru 1',
    'Bengaluru_District_KASAPA_Directory.xlsx': 'Bengaluru District',
    'Bidar_Directory_Contacts_Deduplicated.xlsx': 'Bidar',
    'Chamarajanagar_District_KASAPA_Directory.xlsx': 'Chamarajanagar',
    'Chikkaballapura_District_KASAPA_Directory.xlsx': 'Chikkaballapura',
    'Chikkamagaluru_KSP_Directory (1).xlsx': 'Chikkamagaluru',
    'chikmagaluru.xlsx': 'Chikkamagaluru',
    'Chitradurga_Contacts_Directory.xlsx': 'Chitradurga',
    'Dakshina_Kannada_District_KASAPA_Directory.xlsx': 'Dakshina Kannada',
    'davangere_dst-08-sep-26.xlsx': 'Davanagere',
    'Dharwad_District_KASAPA_Directory.xlsx': 'Dharwad',
    'Gadag_District_KASAPA_Directory.xlsx': 'Gadag',
    'Hassan_District_KASAPA_Directory.xlsx': 'Hassan',
    'Kalaburagi_District_KASAPA_Directory.xlsx': 'Kalaburagi',
    'Kannada Sahitya Sammelana Data (1).xlsx': 'Kannada Sahitya Sammelana',
    'Kannada Sahitya Sammelana_070.xlsx': 'Kannada Sahitya Sammelana',
    'KASP_Directory_Master_Complete.xlsx': 'KASP Master Directory',
    'Kodagu_District_KASAPA_Directory.xlsx': 'Kodagu',
    'kolar district.xlsx': 'Kolar',
    'Kolar_District_KASAPA_Directory.xlsx': 'Kolar',
    'Koppal_District_KASAPA_Directory.xlsx': 'Koppal',
    'Mandya_District_Directory.xlsx': 'Mandya',
    'Mysore_Kannada_Physical_Records_Clean.xlsx': 'Mysuru',
    'Raichur_District_KASAPA_Directory.xlsx': 'Raichur',
    'Ramanagara_Merged_Directory.xlsx': 'Ramanagara',
    'Shivamogga_District_KASAPA_Directory.xlsx': 'Shivamogga',
    'Tumkur_District_Directory.xlsx': 'Tumakuru',
    'Uttara_Kannada_District_Directory.xlsx': 'Uttara Kannada',
    'Vijayapura_District_KASAPA_Directory.xlsx': 'Vijayapura',
    'Yadgir.xlsx': 'Yadgir',
    'Yadgiri_District_KASAPA_Directory.xlsx': 'Yadgiri'
  };

  // Pre-fetch incharge IDs for each district
  const getInchargeId = (distName) => {
    const row = db.prepare('SELECT incharge_id FROM districts WHERE name = ? COLLATE NOCASE').get(distName);
    return row ? row.incharge_id : 2;
  };

  const districtContactsMap = {};

  for (const file of files) {
    const defaultDist = fileDistrictMap[file] || 'Karnataka State Directory';
    const filePath = path.join(excelDir, file);
    const buf = fs.readFileSync(filePath);
    const wb = xlsx.read(buf, { type: 'buffer' });

    let fileCount = 0;

    for (const sheetName of wb.SheetNames) {
      if (sheetName.includes('Dashboard') || sheetName.includes('ಡ್ಯಾಶ್‌ಬೋರ್ಡ್') || sheetName.includes('ಪರಿಶೀಲನೆ')) {
        continue; // Skip executive summary/dashboard sheets
      }

      let targetDistrict = defaultDist;
      if (file === 'Karnataka_Districts_Contacts.xlsx') {
        if (sheetName.includes('Raichur')) targetDistrict = 'Raichur';
        else if (sheetName.includes('Kalaburagi')) targetDistrict = 'Kalaburagi';
        else if (sheetName.includes('Koppal')) targetDistrict = 'Koppal';
        else if (sheetName.includes('Mandya')) targetDistrict = 'Mandya';
      }

      // Ensure the district exists in the database
      ensureDistrictExists(targetDistrict);

      if (!districtContactsMap[targetDistrict]) {
        districtContactsMap[targetDistrict] = new Map();
      }

      const rows = xlsx.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: '' });
      if (rows.length <= 1) continue;

      let hIdx = -1;
      let nameCol = -1;
      let phoneCol = -1;
      let roleCol = -1;
      let addrCol = -1;
      let notesCol = -1;

      for (let r = 0; r < Math.min(10, rows.length); r++) {
        const nonEmpty = rows[r].filter(c => String(c).trim().length > 0);
        if (nonEmpty.length < 2) continue;

        const row = rows[r].map(c => String(c).toLowerCase().trim());

        let nIdx = row.findIndex(c => c.includes('name') || c.includes('ಹೆಸರು'));
        if (nIdx === -1) {
          nIdx = row.findIndex(c => c.includes('swamiji') || c.includes('ಅಧ್ಯಕ್ಷರು') || c.includes('ವ್ಯಕ್ತಿ') || c.includes('member'));
        }

        let pIdx = row.findIndex(c => c.includes('phone') || c.includes('ಮೊಬೈಲ್') || c.includes('mobile') || c.includes('ದೂರವಾಣಿ') || c.includes('contact'));

        if (nIdx !== -1 && (pIdx !== -1 || row.some(c => c.includes('address') || c.includes('ವಿಳಾಸ') || c.includes('taluk') || c.includes('ಸ್ಥಳ') || c.includes('sl')))) {
          hIdx = r;
          nameCol = nIdx;
          phoneCol = pIdx;
          roleCol = row.findIndex(c => c.includes('role') || c.includes('designation') || c.includes('ಹುದ್ದೆ') || c.includes('ಪಾತ್ರ') || c.includes('ವರ್ಗ') || c.includes('category') || c.includes('ಸ್ಥಾನ') || c.includes('ಪದವಿ'));
          addrCol = row.findIndex(c => (c.includes('address') || c.includes('ವಿಳಾಸ') || c.includes('place') || c.includes('ಸ್ಥಳ') || c.includes('taluk') || c.includes('ತಾಲ್ಲೂಕು')) && c !== row[nameCol]);
          notesCol = row.findIndex(c => (c.includes('note') || c.includes('remark') || c.includes('ಟಿಪ್ಪಣಿ') || c.includes('ವಿವರ') || c.includes('media') || c.includes('ಪತ್ರಿಕೆ')) && c !== row[nameCol]);
          break;
        }
      }

      if (hIdx === -1) continue;

      for (let r = hIdx + 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row || row.length === 0) continue;

        let name = String(row[nameCol] || '').trim();
        let rawPhone = phoneCol !== -1 ? String(row[phoneCol] || '').trim() : '';
        let role = roleCol !== -1 ? String(row[roleCol] || '').trim() : '';
        let addr = addrCol !== -1 ? String(row[addrCol] || '').trim() : '';
        let notes = notesCol !== -1 ? String(row[notesCol] || '').trim() : '';

        // If phone has text and name has digits, swap
        if (/\d{7,}/.test(name) && !/\d{7,}/.test(rawPhone)) {
          const t = name; name = rawPhone; rawPhone = t;
        }

        name = name.replace(/^[\d\.\-\s]+/, '').trim();
        if (!name || name === '-' || name === '—' || name.length <= 1) continue;
        if (name.toLowerCase() === 'name' || name.includes('ಹೆಸರು') || name.toLowerCase().includes('total')) continue;

        const phoneMatch = rawPhone.match(/(?:\+91[\s-]?)?[6-9]\d{9}/) || rawPhone.match(/\d{8,12}/);
        let cleanPhone = phoneMatch ? phoneMatch[0].replace(/[^\d+]/g, '') : '';
        if (!cleanPhone && rawPhone) {
          const digitsOnly = rawPhone.replace(/[^\d+]/g, '');
          if (digitsOnly.length >= 8) cleanPhone = digitsOnly;
        }

        // Format clean phone to 10 digits or +91
        if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
          cleanPhone = '+' + cleanPhone;
        } else if (cleanPhone.length === 10) {
          cleanPhone = '+91 ' + cleanPhone;
        }

        const combinedParts = [role, addr, notes].filter(Boolean);
        const combinedNotes = combinedParts.join(' | ');

        const dedupeKey = cleanPhone && cleanPhone.length >= 8 ? cleanPhone : name.toLowerCase();

        if (!districtContactsMap[targetDistrict].has(dedupeKey)) {
          districtContactsMap[targetDistrict].set(dedupeKey, {
            name,
            phone: cleanPhone || rawPhone || '—',
            district: targetDistrict,
            notes: combinedNotes,
            source: file
          });
          fileCount++;
        }
      }
    }
  }

  // Insert into SQLite database in a single transaction
  console.log('[Import] Inserting contacts into SQLite database...');
  const insertStmt = db.prepare(`
    INSERT INTO contacts (name, phone, district, status, last_contacted, assigned_incharge_id, notes)
    VALUES (?, ?, ?, 'not_contacted', '—', ?, ?)
  `);

  let totalInserted = 0;
  db.exec('BEGIN TRANSACTION');

  try {
    for (const [distName, contactsMap] of Object.entries(districtContactsMap)) {
      const inchargeId = getInchargeId(distName);
      for (const c of contactsMap.values()) {
        insertStmt.run(c.name, c.phone, distName, inchargeId, c.notes);
        totalInserted++;
      }
    }
    db.exec('COMMIT');
    console.log(`[Import] Successfully inserted ${totalInserted} citizen contacts!`);
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('[Import] Error inserting contacts:', err);
    throw err;
  }

  // Recalculate metrics for all districts
  console.log('[Import] Syncing all district metrics and totals...');
  syncAllDistrictMetrics();

  // Audit log
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  db.prepare(`
    INSERT INTO audit_logs (user_name, user_email, action, date, time)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    'State Administrator',
    'admin@connectkarnataka.demo',
    `Imported ${totalInserted} verified citizen contacts across 30+ districts from Excel directory files.`,
    dateStr,
    timeStr
  );

  console.log('[Import] Finished successfully! Summary per district:');
  const counts = db.prepare('SELECT name, total_contacts FROM districts WHERE total_contacts > 0 ORDER BY total_contacts DESC').all();
  for (const c of counts) {
    console.log(`  ${c.name}: ${c.total_contacts.toLocaleString('en-IN')} contacts`);
  }
}

runImport().catch(console.error);
