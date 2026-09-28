import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'connect_karnataka.db');

export const db = new DatabaseSync(DB_PATH);

// Initialize Tables
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      district TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS districts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      total_contacts INTEGER NOT NULL,
      called INTEGER NOT NULL,
      pending INTEGER NOT NULL,
      agree INTEGER NOT NULL,
      neutral INTEGER NOT NULL,
      disagree INTEGER NOT NULL,
      incharge_id INTEGER,
      incharge_name TEXT
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      district TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'not_contacted',
      last_contacted TEXT DEFAULT '—',
      assigned_incharge_id INTEGER DEFAULT 2,
      notes TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS calls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_id INTEGER NOT NULL,
      contact_name TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      district TEXT NOT NULL,
      caller_name TEXT NOT NULL,
      caller_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      duration TEXT NOT NULL,
      outcome TEXT NOT NULL,
      response TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS broadcasts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      audience TEXT NOT NULL,
      district TEXT DEFAULT 'All',
      recipients TEXT NOT NULL,
      delivered TEXT NOT NULL,
      pending TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      voice_title TEXT DEFAULT NULL,
      image_url TEXT DEFAULT NULL
    );

    CREATE TABLE IF NOT EXISTS voice_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      duration TEXT NOT NULL,
      audio_url TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      action TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrate columns for custom districts if they do not exist
  try {
    const cols = db.prepare("SELECT name FROM pragma_table_info('districts')").all().map(c => c.name);
    if (!cols.includes('name_kn')) db.exec("ALTER TABLE districts ADD COLUMN name_kn TEXT DEFAULT ''");
    if (!cols.includes('division')) db.exec("ALTER TABLE districts ADD COLUMN division TEXT DEFAULT 'Karnataka General'");
    if (!cols.includes('incharge_phone')) db.exec("ALTER TABLE districts ADD COLUMN incharge_phone TEXT DEFAULT ''");
    if (!cols.includes('incharge_email')) db.exec("ALTER TABLE districts ADD COLUMN incharge_email TEXT DEFAULT ''");
    if (!cols.includes('is_custom')) db.exec("ALTER TABLE districts ADD COLUMN is_custom INTEGER DEFAULT 0");
  } catch (err) {
    console.error('[DB] Districts migration notice:', err.message);
  }

  seedDataIfEmpty();
}

// Canonical Karnataka Districts and their designated In-Charges
export const districtConfigs = [
  { name: 'Bengaluru', incharge: 'Suresh Gowda', email: 'bengaluru@connectkarnataka.demo', pass: 'incharge123' },
  { name: 'Mysuru', incharge: 'Maheshwarappa K', email: 'mysuru@connectkarnataka.demo', pass: 'mysuru123' },
  { name: 'Belagavi', incharge: 'Anand Shinde', email: 'belagavi@connectkarnataka.demo', pass: 'belagavi123' },
  { name: 'Mangaluru', incharge: 'Ramesh Poojary', email: 'mangaluru@connectkarnataka.demo', pass: 'mangaluru123' },
  { name: 'Tumakuru', incharge: 'Girish Siddagangaiah', email: 'tumakuru@connectkarnataka.demo', pass: 'tumakuru123' },
  { name: 'Mandya', incharge: 'Kempegowda C', email: 'mandya@connectkarnataka.demo', pass: 'mandya123' },
  { name: 'Hassan', incharge: 'Siddesh Gowda', email: 'hassan@connectkarnataka.demo', pass: 'hassan123' },
  { name: 'Shivamogga', incharge: 'Shivaraj Patil', email: 'shivamogga@connectkarnataka.demo', pass: 'shivamogga123' },
  { name: 'Hubballi-Dharwad', incharge: 'Prakash Rathod', email: 'dharwad@connectkarnataka.demo', pass: 'dharwad123' },
  { name: 'Ballari', incharge: 'Sudarshan Reddy', email: 'ballari@connectkarnataka.demo', pass: 'ballari123' },
  { name: 'Kalaburagi', incharge: 'Mallikarjun Biradar', email: 'kalaburagi@connectkarnataka.demo', pass: 'kalaburagi123' },
  { name: 'Udupi', incharge: 'Guruprasad Udupa', email: 'udupi@connectkarnataka.demo', pass: 'udupi123' },
  { name: 'Davanagere', incharge: 'Manjunath Byadagi', email: 'davanagere@connectkarnataka.demo', pass: 'davanagere123' },
  { name: 'Vijayapura', incharge: 'Basanagouda Patil', email: 'vijayapura@connectkarnataka.demo', pass: 'vijayapura123' },
  { name: 'Bidar', incharge: 'Santosh Doddamani', email: 'bidar@connectkarnataka.demo', pass: 'bidar123' },
  { name: 'Raichur', incharge: 'Venkatesh Nayak', email: 'raichur@connectkarnataka.demo', pass: 'raichur123' },
  { name: 'Koppal', incharge: 'Sharanappa Karadi', email: 'koppal@connectkarnataka.demo', pass: 'koppal123' },
  { name: 'Gadag', incharge: 'Chandrashekhar Patil', email: 'gadag@connectkarnataka.demo', pass: 'gadag123' },
  { name: 'Haveri', incharge: 'Basavaraj Shivalli', email: 'haveri@connectkarnataka.demo', pass: 'haveri123' },
  { name: 'Uttara Kannada', incharge: 'Prashanth Hegde', email: 'uttarakannada@connectkarnataka.demo', pass: 'uttarakannada123' },
  { name: 'Chikkamagaluru', incharge: 'Jayaprakash Gowda', email: 'chikkamagaluru@connectkarnataka.demo', pass: 'chikkamagaluru123' },
  { name: 'Kodagu', incharge: 'Appanna Bopanna', email: 'kodagu@connectkarnataka.demo', pass: 'kodagu123' },
  { name: 'Chamarajanagar', incharge: 'Mahadeva Prasad', email: 'chamarajanagar@connectkarnataka.demo', pass: 'chamarajanagar123' },
  { name: 'Ramanagara', incharge: 'Lokesh Kumar', email: 'ramanagara@connectkarnataka.demo', pass: 'ramanagara123' },
  { name: 'Chikkaballapura', incharge: 'Muniyappa N', email: 'chikkaballapura@connectkarnataka.demo', pass: 'chikkaballapura123' },
  { name: 'Kolar', incharge: 'Narayanaswamy K', email: 'kolar@connectkarnataka.demo', pass: 'kolar123' },
  { name: 'Bagalkote', incharge: 'Veeranna Charantimath', email: 'bagalkote@connectkarnataka.demo', pass: 'bagalkote123' },
  { name: 'Yadgir', incharge: 'Venkatreddy Mudnal', email: 'yadgir@connectkarnataka.demo', pass: 'yadgir123' },
  { name: 'Chitradurga', incharge: 'Thippareddy G', email: 'chitradurga@connectkarnataka.demo', pass: 'chitradurga123' },
  { name: 'Vijayanagara', incharge: 'Anand Singh', email: 'vijayanagara@connectkarnataka.demo', pass: 'vijayanagara123' },
  { name: 'Dakshina Kannada', incharge: 'Ramesh Poojary', email: 'dakshinakannada@connectkarnataka.demo', pass: 'dakshinakannada123' },
  { name: 'Dharwad', incharge: 'Prakash Rathod', email: 'dharwad@connectkarnataka.demo', pass: 'dharwad123' },
  { name: 'Kannada Sahitya Sammelana', incharge: 'Sammelana General Secretary', email: 'sammelana@connectkarnataka.demo', pass: 'sammelana123' },
  { name: 'KASP Master Directory', incharge: 'KASAPA Central Directorate', email: 'kasapa@connectkarnataka.demo', pass: 'kasapa123' },
  { name: 'Karnataka State Directory', incharge: 'State Coordination Desk', email: 'statecontacts@connectkarnataka.demo', pass: 'statecontacts123' },
  { name: 'Yadgiri', incharge: 'Venkatreddy Mudnal', email: 'yadgiri@connectkarnataka.demo', pass: 'yadgiri123' }
];

// District Alias Normalization Map for robust file upload
export const DISTRICT_ALIAS_MAP = {
  'bangalore': 'Bengaluru',
  'bangalore urban': 'Bengaluru',
  'bengaluru': 'Bengaluru',
  'bengaluru urban': 'Bengaluru',
  'bangalore city': 'Bengaluru',
  'bengaluru city': 'Bengaluru',
  'bangalore rural': 'Bengaluru',
  'bengaluru rural': 'Bengaluru',
  'bengaluru 1': 'Bengaluru',
  'bengaluru_1': 'Bengaluru',
  'bengaluru district': 'Bengaluru',
  'bengaluru_district': 'Bengaluru',
  'mysore': 'Mysuru',
  'mysuru': 'Mysuru',
  'belgaum': 'Belagavi',
  'belagavi': 'Belagavi',
  'mangalore': 'Mangaluru',
  'mangaluru': 'Mangaluru',
  'dakshina kannada': 'Dakshina Kannada',
  'dakshina_kannada': 'Dakshina Kannada',
  'south canara': 'Dakshina Kannada',
  'tumkur': 'Tumakuru',
  'tumakuru': 'Tumakuru',
  'mandya': 'Mandya',
  'hassan': 'Hassan',
  'shimoga': 'Shivamogga',
  'shivamogga': 'Shivamogga',
  'dharwad': 'Dharwad',
  'hubli': 'Hubballi-Dharwad',
  'hubli dharwad': 'Hubballi-Dharwad',
  'hubballi': 'Hubballi-Dharwad',
  'hubballi-dharwad': 'Hubballi-Dharwad',
  'kannada sahitya sammelana': 'Kannada Sahitya Sammelana',
  'kannada_sahitya_sammelana': 'Kannada Sahitya Sammelana',
  'kasp': 'KASP Master Directory',
  'kasapa': 'KASP Master Directory',
  'karnataka districts': 'Karnataka State Directory',
  'karnataka_districts': 'Karnataka State Directory',
  'yadgiri': 'Yadgiri',
  'bellary': 'Ballari',
  'ballari': 'Ballari',
  'gulbarga': 'Kalaburagi',
  'kalaburagi': 'Kalaburagi',
  'udupi': 'Udupi',
  'davangere': 'Davanagere',
  'davanagere': 'Davanagere',
  'bijapur': 'Vijayapura',
  'vijayapura': 'Vijayapura',
  'bidar': 'Bidar',
  'raichur': 'Raichur',
  'koppal': 'Koppal',
  'gadag': 'Gadag',
  'haveri': 'Haveri',
  'uttara kannada': 'Uttara Kannada',
  'north canara': 'Uttara Kannada',
  'karwar': 'Uttara Kannada',
  'chikmagalur': 'Chikkamagaluru',
  'chikkamagaluru': 'Chikkamagaluru',
  'coorg': 'Kodagu',
  'kodagu': 'Kodagu',
  'madikeri': 'Kodagu',
  'chamarajnagar': 'Chamarajanagar',
  'chamarajanagar': 'Chamarajanagar',
  'ramanagara': 'Ramanagara',
  'ramanagar': 'Ramanagara',
  'chikballapur': 'Chikkaballapura',
  'chikkaballapur': 'Chikkaballapura',
  'chikkaballapura': 'Chikkaballapura',
  'kolar': 'Kolar',
  'bagalkot': 'Bagalkote',
  'bagalkote': 'Bagalkote',
  'yadgir': 'Yadgir',
  'chitradurga': 'Chitradurga',
  'vijayanagara': 'Vijayanagara',
  'hospet': 'Vijayanagara'
};

export function normalizeDistrict(input) {
  if (!input) return null;
  const raw = input.trim();
  const clean = raw.toLowerCase().replace(/[_-]/g, ' ').replace(/\s+/g, ' ');

  // 1. Direct match with existing district in database (case-insensitive)
  try {
    const exact = db.prepare('SELECT name FROM districts WHERE name = ? COLLATE NOCASE').get(raw);
    if (exact) return exact.name;

    const cleanMatch = db.prepare('SELECT name FROM districts WHERE LOWER(REPLACE(REPLACE(name, "_", " "), "-", " ")) = ?').get(clean);
    if (cleanMatch) return cleanMatch.name;
  } catch (_) {}

  // 2. Check alias map
  if (DISTRICT_ALIAS_MAP[clean]) {
    const aliasTarget = DISTRICT_ALIAS_MAP[clean];
    try {
      const dbTarget = db.prepare('SELECT name FROM districts WHERE name = ? COLLATE NOCASE').get(aliasTarget);
      if (dbTarget) return dbTarget.name;
    } catch (_) {}
    return aliasTarget;
  }

  // 3. Fallback to predefined district configurations
  const found = districtConfigs.find(d => d.name.toLowerCase() === clean);
  return found ? found.name : null;
}

export function ensureDistrictExists(districtName, options = {}) {
  if (!districtName || !districtName.trim()) return null;
  const name = districtName.trim();

  // Check if district already exists
  const existing = db.prepare('SELECT * FROM districts WHERE name = ? COLLATE NOCASE').get(name);
  if (existing) return existing;

  const nameKn = (options.name_kn || '').trim();
  const division = (options.division || 'Special Directory').trim();
  const inchargeName = (options.incharge_name || 'District Coordinator').trim();
  const phone = (options.incharge_phone || '').trim();
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const email = (options.incharge_email || `${slug || 'custom'}@connectkarnataka.demo`).trim();
  const pass = options.password || 'incharge123';

  // 1. Create user account for the in-charge if email doesn't exist
  let inchargeId = 2;
  try {
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ? COLLATE NOCASE').get(email);
    if (existingUser) {
      inchargeId = existingUser.id;
    } else {
      const uRes = db.prepare(`
        INSERT INTO users (name, email, password, role, district)
        VALUES (?, ?, ?, 'district_incharge', ?)
      `).run(inchargeName, email, pass, name);
      inchargeId = uRes.lastInsertRowid;
    }
  } catch (e) {
    console.error('[DB] In-charge user creation notice:', e.message);
  }

  // 2. Insert into districts
  const res = db.prepare(`
    INSERT INTO districts (name, total_contacts, called, pending, agree, neutral, disagree, incharge_id, incharge_name, name_kn, division, incharge_phone, incharge_email, is_custom)
    VALUES (?, 0, 0, 0, 0, 0, 0, ?, ?, ?, ?, ?, ?, 1)
  `).run(name, inchargeId, inchargeName, nameKn, division, phone, email);

  // Sync metrics in case contacts already exist with this district name
  syncAllDistrictMetrics();

  return db.prepare('SELECT * FROM districts WHERE id = ?').get(res.lastInsertRowid);
}

function seedDataIfEmpty() {
  const checkUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (checkUsers.count > 0) return;

  console.log('[DB] Initializing administrative users and Karnataka districts...');

  // 1. Seed Users (Super Admin + 31 District In-charges)
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password, role, district)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertUser.run('State Administrator', 'admin@connectkarnataka.demo', 'admin123', 'super_admin', 'All');

  const inchargeIdMap = {};
  districtConfigs.forEach((d) => {
    const res = insertUser.run(d.incharge, d.email, d.pass, 'district_incharge', d.name);
    inchargeIdMap[d.name] = res.lastInsertRowid;
  });

  // 2. Seed Districts with 0 initial contacts
  const insertDistrict = db.prepare(`
    INSERT INTO districts (name, total_contacts, called, pending, agree, neutral, disagree, incharge_id, incharge_name)
    VALUES (?, 0, 0, 0, 0, 0, 0, ?, ?)
  `);

  districtConfigs.forEach((d) => {
    insertDistrict.run(
      d.name,
      inchargeIdMap[d.name] || 2,
      d.incharge
    );
  });

  console.log('[DB] Connect Karnataka database initialized cleanly with 0 dummy contacts.');
}

// Recalculates district total_contacts, called, pending, agree, neutral, disagree
// directly from the ground truth in contacts table.
export function syncAllDistrictMetrics() {
  db.exec(`
    UPDATE districts SET
      total_contacts = (SELECT COUNT(*) FROM contacts WHERE contacts.district = districts.name COLLATE NOCASE),
      called = (SELECT COUNT(*) FROM contacts WHERE contacts.district = districts.name COLLATE NOCASE AND contacts.status != 'not_contacted'),
      pending = (SELECT COUNT(*) FROM contacts WHERE contacts.district = districts.name COLLATE NOCASE AND contacts.status = 'not_contacted'),
      agree = (SELECT COUNT(*) FROM contacts WHERE contacts.district = districts.name COLLATE NOCASE AND contacts.status = 'agree'),
      neutral = (SELECT COUNT(*) FROM contacts WHERE contacts.district = districts.name COLLATE NOCASE AND contacts.status = 'neutral'),
      disagree = (SELECT COUNT(*) FROM contacts WHERE contacts.district = districts.name COLLATE NOCASE AND contacts.status = 'disagree');
  `);
}

// Clear all user-generated / dummy data completely
export function clearAllSiteData() {
  db.exec(`
    DELETE FROM contacts;
    DELETE FROM calls;
    DELETE FROM broadcasts;
    DELETE FROM voice_messages;
    DELETE FROM audit_logs;
    UPDATE districts SET total_contacts = 0, called = 0, pending = 0, agree = 0, neutral = 0, disagree = 0;
  `);
  console.log('[DB] All data cleared. Ready for original data upload.');
}
