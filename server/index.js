import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { db, initDB, syncAllDistrictMetrics, clearAllSiteData, normalizeDistrict, ensureDistrictExists } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');

initDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper to format Indian numbers (e.g. 2,84,521)
function formatIndian(num) {
  if (num === null || num === undefined) return '0';
  const str = Math.round(num).toString();
  if (str.length <= 3) return str;
  const lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
}

// 1. Auth Endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT id, name, email, password, role, district FROM users WHERE email = ?').get(email?.trim());

  if (!user || user.password !== password?.trim()) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Audit log login
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  db.prepare(`
    INSERT INTO audit_logs (user_name, user_email, action, date, time)
    VALUES (?, ?, ?, ?, ?)
  `).run(user.name, user.email, `${user.role === 'super_admin' ? 'Super Admin' : 'District In-charge'} logged in`, dateStr, timeStr);

  const { password: _, ...userData } = user;
  res.json({
    token: `demo-token-${user.id}-${Date.now()}`,
    user: userData
  });
});

// 2. Dashboard Statistics
app.get('/api/dashboard/stats', (req, res) => {
  // Real-time aggregates directly from database
  const totalContactsCount = db.prepare('SELECT COUNT(*) as count FROM contacts').get().count;
  const callsCompletedCount = db.prepare('SELECT COUNT(*) as count FROM calls').get().count;
  const pendingCount = db.prepare("SELECT COUNT(*) as count FROM contacts WHERE status = 'not_contacted'").get().count;

  // Sentiment responses from contacts or calls
  const agreeCount = db.prepare("SELECT COUNT(*) as count FROM contacts WHERE status = 'agree'").get().count;
  const neutralCount = db.prepare("SELECT COUNT(*) as count FROM contacts WHERE status = 'neutral'").get().count;
  const disagreeCount = db.prepare("SELECT COUNT(*) as count FROM contacts WHERE status = 'disagree'").get().count;

  const totalContacted = agreeCount + neutralCount + disagreeCount;
  const agreePercent = totalContacted > 0 ? Math.round((agreeCount / totalContacted) * 100) : 0;
  const neutralPercent = totalContacted > 0 ? Math.round((neutralCount / totalContacted) * 100) : 0;
  const disagreePercent = totalContacted > 0 ? Math.max(0, 100 - agreePercent - neutralPercent) : 0;
  const callingProgress = totalContactsCount > 0 ? Math.min(100, Math.round(((totalContactsCount - pendingCount) / totalContactsCount) * 100)) : 0;

  const activeCallersCount = db.prepare('SELECT COUNT(DISTINCT caller_id) as count FROM calls').get().count;

  // Incharge stats for selected district (defaults to Bengaluru)
  const targetDistrictName = req.query.district || 'Bengaluru';
  const targetDist = db.prepare('SELECT * FROM districts WHERE name = ? COLLATE NOCASE').get(targetDistrictName) || {
    name: targetDistrictName,
    total_contacts: 0,
    called: 0,
    pending: 0,
    agree: 0,
    neutral: 0,
    disagree: 0,
    incharge_name: 'District Coordinator'
  };

  const distTotalContacts = db.prepare('SELECT COUNT(*) as count FROM contacts WHERE district = ? COLLATE NOCASE').get(targetDist.name).count;
  const distCalled = db.prepare("SELECT COUNT(*) as count FROM contacts WHERE district = ? COLLATE NOCASE AND status != 'not_contacted'").get(targetDist.name).count;
  const distPending = db.prepare("SELECT COUNT(*) as count FROM contacts WHERE district = ? COLLATE NOCASE AND status = 'not_contacted'").get(targetDist.name).count;
  const distAgree = db.prepare("SELECT COUNT(*) as count FROM contacts WHERE district = ? COLLATE NOCASE AND status = 'agree'").get(targetDist.name).count;
  const distNeutral = db.prepare("SELECT COUNT(*) as count FROM contacts WHERE district = ? COLLATE NOCASE AND status = 'neutral'").get(targetDist.name).count;
  const distDisagree = db.prepare("SELECT COUNT(*) as count FROM contacts WHERE district = ? COLLATE NOCASE AND status = 'disagree'").get(targetDist.name).count;

  // Calls today across entire state
  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const todayCallsCount = db.prepare("SELECT COUNT(*) as count FROM calls WHERE date = ?").get(todayStr).count;
  const distCallsToday = db.prepare("SELECT COUNT(*) as count FROM calls WHERE district = ? COLLATE NOCASE AND date = ?").get(targetDist.name, todayStr).count;
  const targetGoal = Math.max(10, Math.min(250, distTotalContacts > 0 ? Math.round(distTotalContacts * 0.1) : 50));

  res.json({
    superAdmin: {
      totalContacts: formatIndian(totalContactsCount),
      totalContactsRaw: totalContactsCount,
      callsCompleted: formatIndian(callsCompletedCount),
      callsCompletedRaw: callsCompletedCount,
      pending: formatIndian(pendingCount),
      pendingRaw: pendingCount,
      todayCalls: formatIndian(todayCallsCount),
      todayCallsRaw: todayCallsCount,
      activeCallers: activeCallersCount,
      callingProgress,
      responseDistribution: {
        agree: { percent: agreePercent, count: formatIndian(agreeCount) },
        neutral: { percent: neutralPercent, count: formatIndian(neutralCount) },
        disagree: { percent: disagreePercent, count: formatIndian(disagreeCount) }
      }
    },
    incharge: {
      district: targetDist.name,
      inchargeName: targetDist.incharge_name || 'District Coordinator',
      myContacts: formatIndian(distTotalContacts),
      myContactsRaw: distTotalContacts,
      completed: formatIndian(distCalled),
      pending: formatIndian(distPending),
      callsToday: distCallsToday,
      todayTarget: targetGoal,
      todayProgress: targetGoal > 0 ? Math.min(100, Math.round((distCallsToday / targetGoal) * 100)) : 0,
      responseBreakdown: {
        agree: formatIndian(distAgree),
        neutral: formatIndian(distNeutral),
        disagree: formatIndian(distDisagree)
      }
    }
  });
});


// 3. Districts List & Single District
app.get('/api/districts', (req, res) => {
  const districts = db.prepare(`
    SELECT d.*, u.email as incharge_email, u.password as incharge_password
    FROM districts d
    LEFT JOIN users u ON d.incharge_id = u.id
    ORDER BY d.total_contacts DESC
  `).all();
  res.json(districts);
});

app.get('/api/districts/:name', (req, res) => {
  const districtName = decodeURIComponent(req.params.name);
  const district = db.prepare(`
    SELECT d.*, u.email as incharge_email, u.password as incharge_password
    FROM districts d
    LEFT JOIN users u ON d.incharge_id = u.id
    WHERE d.name = ? COLLATE NOCASE
  `).get(districtName);
  if (!district) return res.status(404).json({ error: 'District not found' });
  res.json(district);
});

// Add new custom district
app.post('/api/districts', (req, res) => {
  try {
    const { name, name_kn = '', division = 'Other', incharge_name = 'District Coordinator', email = '', phone = '' } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'District name is required' });
    }
    const cleanName = name.trim();

    // Check if already exists
    const existing = db.prepare('SELECT * FROM districts WHERE name = ? COLLATE NOCASE').get(cleanName);
    if (existing) {
      return res.status(409).json({ error: `District "${cleanName}" already exists.`, district: existing });
    }

    const created = ensureDistrictExists(cleanName, {
      name_kn,
      division,
      incharge_name,
      incharge_email: email,
      incharge_phone: phone
    });

    // Audit log
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    db.prepare(`
      INSERT INTO audit_logs (user_name, user_email, action, date, time)
      VALUES (?, ?, ?, ?, ?)
    `).run('State Administrator', 'admin@connectkarnataka.demo', `New district created: "${cleanName}" (${division})`, dateStr, timeStr);

    res.status(201).json({ success: true, district: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete custom district (only allowed if 0 contacts attached)
app.delete('/api/districts/:id', (req, res) => {
  try {
    const district = db.prepare('SELECT * FROM districts WHERE id = ?').get(req.params.id);
    if (!district) return res.status(404).json({ error: 'District not found' });

    const contactCount = db.prepare('SELECT COUNT(*) as count FROM contacts WHERE district = ? COLLATE NOCASE').get(district.name).count;
    if (contactCount > 0) {
      return res.status(400).json({
        error: `Cannot delete district "${district.name}" because it contains ${contactCount} contacts. Please reassign or clear contacts first.`
      });
    }

    db.prepare('DELETE FROM districts WHERE id = ?').run(district.id);
    
    // Audit log
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    db.prepare(`
      INSERT INTO audit_logs (user_name, user_email, action, date, time)
      VALUES (?, ?, ?, ?, ?)
    `).run('State Administrator', 'admin@connectkarnataka.demo', `District removed: "${district.name}"`, dateStr, timeStr);

    res.json({ success: true, message: `District "${district.name}" deleted successfully.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Contacts CRUD & Search
app.get('/api/contacts', (req, res) => {
  const { search = '', district = '', status = '', page = 1, limit = 15 } = req.query;
  const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

  let query = 'SELECT * FROM contacts WHERE 1=1';
  let countQuery = 'SELECT COUNT(*) as total FROM contacts WHERE 1=1';
  const params = [];
  const countParams = [];

  if (search.trim()) {
    const s = `%${search.trim()}%`;
    const digitsOnly = search.replace(/\D/g, '');
    if (digitsOnly.length >= 3) {
      const d = `%${digitsOnly}%`;
      query += " AND (name LIKE ? OR phone LIKE ? OR REPLACE(REPLACE(phone, ' ', ''), '-', '') LIKE ?)";
      countQuery += " AND (name LIKE ? OR phone LIKE ? OR REPLACE(REPLACE(phone, ' ', ''), '-', '') LIKE ?)";
      params.push(s, s, d);
      countParams.push(s, s, d);
    } else {
      query += ' AND (name LIKE ? OR phone LIKE ?)';
      countQuery += ' AND (name LIKE ? OR phone LIKE ?)';
      params.push(s, s);
      countParams.push(s, s);
    }
  }

  if (district.trim() && district !== 'All') {
    query += ' AND district = ? COLLATE NOCASE';
    countQuery += ' AND district = ? COLLATE NOCASE';
    params.push(district);
    countParams.push(district);
  }

  if (status.trim() && status !== 'all') {
    query += ' AND status = ?';
    countQuery += ' AND status = ?';
    params.push(status);
    countParams.push(status);
  }

  query += ' ORDER BY id ASC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  const contacts = db.prepare(query).all(...params);
  const total = db.prepare(countQuery).get(...countParams).total;

  res.json({
    contacts,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / parseInt(limit))
  });
});

app.post('/api/contacts/import', (req, res) => {
  try {
    const { contacts, defaultDistrict = 'Bengaluru' } = req.body;
    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({ error: 'Invalid contacts data array' });
    }

    let added = 0;
    const insertContact = db.prepare(`
      INSERT INTO contacts (name, phone, district, status, last_contacted, assigned_incharge_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    db.exec('BEGIN TRANSACTION');

    for (const c of contacts) {
      const name = (c.name || '').trim();
      let phone = String(c.phone || '').trim();
      if (!name || !phone) continue;

      // Clean phone number: remove non-digits except leading +
      phone = phone.replace(/[^\d+]/g, '');

      // Resolve district
      const rawDist = (c.district || defaultDistrict).trim();
      let resolvedDistrict = normalizeDistrict(rawDist);
      if (!resolvedDistrict && rawDist && rawDist.length >= 2) {
        const autoDist = ensureDistrictExists(rawDist, {
          division: 'Special Directory',
          incharge_name: `${rawDist} Coordinator`
        });
        resolvedDistrict = autoDist ? autoDist.name : defaultDistrict;
      }
      if (!resolvedDistrict) resolvedDistrict = defaultDistrict;

      // Incharge lookup
      let distInfo = db.prepare('SELECT incharge_id FROM districts WHERE name = ? COLLATE NOCASE').get(resolvedDistrict);
      if (!distInfo) {
        const autoDist = ensureDistrictExists(resolvedDistrict);
        distInfo = autoDist ? { incharge_id: autoDist.incharge_id } : { incharge_id: 2 };
      }
      const inchargeId = distInfo ? distInfo.incharge_id : 2;

      let status = (c.status || 'not_contacted').trim().toLowerCase();
      if (!['agree', 'neutral', 'disagree', 'not_contacted'].includes(status)) {
        status = 'not_contacted';
      }
      const lastContacted = status !== 'not_contacted' ? (c.last_contacted || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })) : '—';
      const notes = (c.notes || '').trim();

      insertContact.run(name, phone, resolvedDistrict, status, lastContacted, inchargeId, notes);
      added++;
    }

    db.exec('COMMIT');

    // Automatically recalculate and sync all 31 districts metrics!
    syncAllDistrictMetrics();

    // Audit log
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    db.prepare(`
      INSERT INTO audit_logs (user_name, user_email, action, date, time)
      VALUES (?, ?, ?, ?, ?)
    `).run('Administrator', 'admin@connectkarnataka.demo', `Imported ${added} citizen contacts`, dateStr, timeStr);

    res.json({ success: true, added });
  } catch (err) {
    try { db.exec('ROLLBACK'); } catch (_) {}
    res.status(500).json({ error: err.message });
  }
});

// Single contact creation
app.post('/api/contacts', (req, res) => {
  try {
    const { name, phone, district = 'Bengaluru', status = 'not_contacted', notes = '' } = req.body;
    if (!name?.trim() || !phone?.trim()) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    let resolvedDistrict = normalizeDistrict(district) || district;
    let distInfo = db.prepare('SELECT incharge_id FROM districts WHERE name = ? COLLATE NOCASE').get(resolvedDistrict);
    if (!distInfo) {
      const autoDist = ensureDistrictExists(resolvedDistrict);
      distInfo = autoDist ? { incharge_id: autoDist.incharge_id } : { incharge_id: 2 };
    }
    const inchargeId = distInfo ? distInfo.incharge_id : 2;
    const rawDigits = String(phone).trim().replace(/\D/g, '');
    let formattedPhone = String(phone).trim();
    if (rawDigits.length === 10 && /^[6-9]/.test(rawDigits)) {
      formattedPhone = `+91 ${rawDigits.slice(0, 5)} ${rawDigits.slice(5)}`;
    } else if (rawDigits.length === 12 && rawDigits.startsWith('91')) {
      formattedPhone = `+91 ${rawDigits.slice(2, 7)} ${rawDigits.slice(7)}`;
    }

    const lastContacted = status !== 'not_contacted' ? new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    const result = db.prepare(`
      INSERT INTO contacts (name, phone, district, status, last_contacted, assigned_incharge_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name.trim(), formattedPhone, resolvedDistrict, status, lastContacted, inchargeId, notes.trim());

    syncAllDistrictMetrics();

    const created = db.prepare('SELECT * FROM contacts WHERE id = ?').get(result.lastInsertRowid);
    res.json({ success: true, contact: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete single contact
app.delete('/api/contacts/:id', (req, res) => {
  try {
    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });

    db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
    db.prepare('DELETE FROM calls WHERE contact_id = ?').run(req.params.id);
    syncAllDistrictMetrics();

    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear all site data
app.delete('/api/contacts', (req, res) => {
  try {
    clearAllSiteData();
    res.json({ success: true, message: 'All contacts and logs cleared successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/contacts/:id', (req, res) => {
  const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
  if (!contact) return res.status(404).json({ error: 'Contact not found' });

  // Fetch call history for this contact
  const history = db.prepare('SELECT * FROM calls WHERE contact_id = ? ORDER BY id DESC').all(req.params.id);
  res.json({ ...contact, history });
});

// 5. Calls & Complete Calling Workflow
app.get('/api/calls', (req, res) => {
  const { search = '', district = '', caller = '', response = '', outcome = '' } = req.query;

  let query = 'SELECT * FROM calls WHERE 1=1';
  const params = [];

  if (search.trim()) {
    const s = `%${search.trim()}%`;
    query += ' AND (contact_name LIKE ? OR contact_phone LIKE ? OR description LIKE ?)';
    params.push(s, s, s);
  }
  if (district && district !== 'All') {
    query += ' AND district = ?';
    params.push(district);
  }
  if (caller && caller !== 'All') {
    query += ' AND caller_name = ?';
    params.push(caller);
  }
  if (response && response !== 'All') {
    query += ' AND response = ?';
    params.push(response);
  }
  if (outcome && outcome !== 'All') {
    query += ' AND outcome = ?';
    params.push(outcome);
  }

  query += ' ORDER BY id DESC';
  const calls = db.prepare(query).all(...params);
  res.json(calls);
});

app.post('/api/calls', (req, res) => {
  const {
    contact_id,
    duration = '00:12',
    outcome = 'Connected',
    response = 'agree',
    description = '',
    caller_name = 'Suresh Gowda',
    caller_id = 2
  } = req.body;

  const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(contact_id);
  if (!contact) return res.status(404).json({ error: 'Contact not found' });

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // 1. Insert call record
  const insertCall = db.prepare(`
    INSERT INTO calls (contact_id, contact_name, contact_phone, district, caller_name, caller_id, date, time, duration, outcome, response, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const callResult = insertCall.run(
    contact.id,
    contact.name,
    contact.phone,
    contact.district,
    caller_name,
    caller_id,
    dateStr,
    timeStr,
    duration,
    outcome,
    response,
    description
  );

  // 2. Update contact status & notes
  db.prepare(`
    UPDATE contacts 
    SET status = ?, last_contacted = ?, notes = ?
    WHERE id = ?
  `).run(response, dateStr, description, contact.id);

  // 3. Keep all district metrics in sync
  syncAllDistrictMetrics();

  // 4. Audit Log
  db.prepare(`
    INSERT INTO audit_logs (user_name, user_email, action, date, time)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    caller_name,
    'incharge@connectkarnataka.demo',
    `Call completed for ${contact.name} (Outcome: ${outcome}, Status: ${response.toUpperCase()})`,
    dateStr,
    timeStr
  );

  const updatedContact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(contact.id);
  const updatedHistory = db.prepare('SELECT * FROM calls WHERE contact_id = ? ORDER BY id DESC').all(contact.id);

  res.json({
    success: true,
    message: 'Call recorded successfully',
    contact: { ...updatedContact, history: updatedHistory },
    callId: callResult.lastInsertRowid
  });
});

// 6. Broadcasts
app.get('/api/broadcasts', (req, res) => {
  const broadcasts = db.prepare('SELECT * FROM broadcasts ORDER BY id DESC').all();
  res.json(broadcasts);
});

app.post('/api/broadcasts', (req, res) => {
  const { title, message, audience, district = 'All', voice_title = null, image_url = null } = req.body;

  const totalContacts = db.prepare('SELECT COUNT(*) as count FROM contacts').get().count;
  let recipientsCount = totalContacts;

  if (audience === 'Specific District' && district !== 'All') {
    const distCount = db.prepare('SELECT COUNT(*) as count FROM contacts WHERE district = ? COLLATE NOCASE').get(district)?.count || 0;
    recipientsCount = distCount;
  } else if (audience === 'Selected Contacts') {
    recipientsCount = Math.min(totalContacts, 50);
  }

  const recipients = formatIndian(recipientsCount);
  const delivered = formatIndian(Math.round(recipientsCount * 0.96));
  const pending = formatIndian(recipientsCount - Math.round(recipientsCount * 0.96));

  const now = new Date();
  const dateStr = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

  const result = db.prepare(`
    INSERT INTO broadcasts (title, message, audience, district, recipients, delivered, pending, status, created_at, voice_title, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    title || 'Important Announcement',
    message || '',
    audience || 'All Karnataka',
    district,
    recipients,
    delivered,
    pending,
    'Sent',
    dateStr,
    voice_title,
    image_url
  );

  // Audit log
  db.prepare(`
    INSERT INTO audit_logs (user_name, user_email, action, date, time)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    'State Administrator',
    'admin@connectkarnataka.demo',
    `Broadcast created & sent: "${title}" to ${audience}`,
    dateStr.split(',')[0],
    dateStr.split(',')[1]?.trim() || '10:00 AM'
  );

  const newBroadcast = db.prepare('SELECT * FROM broadcasts WHERE id = ?').get(result.lastInsertRowid);

  res.json({
    success: true,
    broadcast: newBroadcast,
    message: audience === 'All Karnataka' 
      ? `Broadcast prepared for ${recipients} contacts.` 
      : `Broadcast prepared for ${recipients} contacts in ${district}.`
  });
});

// 7. Voice Messages
app.get('/api/voice', (req, res) => {
  const list = db.prepare('SELECT * FROM voice_messages ORDER BY id DESC').all();
  res.json(list);
});

app.post('/api/voice', (req, res) => {
  const { title, duration = '00:30', audio_url = '' } = req.body;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const result = db.prepare(`
    INSERT INTO voice_messages (title, duration, audio_url, created_at)
    VALUES (?, ?, ?, ?)
  `).run(title || 'Voice Announcement', duration, audio_url, dateStr);

  const voice = db.prepare('SELECT * FROM voice_messages WHERE id = ?').get(result.lastInsertRowid);
  res.json(voice);
});

// 8. Assignments
app.get('/api/assignments', (req, res) => {
  const list = db.prepare(`
    SELECT d.id, d.name as district, d.incharge_name, d.total_contacts, d.called, d.pending,
           CASE WHEN d.total_contacts > 0 THEN ROUND((CAST(d.called AS FLOAT) / d.total_contacts) * 100, 1) ELSE 0.0 END as completion_rate
    FROM districts d
    ORDER BY d.total_contacts DESC, d.name ASC
  `).all();
  res.json(list);
});

// 9. Audit Logs
app.get('/api/audit-logs', (req, res) => {
  const logs = db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 100').all();
  res.json(logs);
});

// 10. CSV Reports
app.get('/api/reports/export/:type', (req, res) => {
  const type = req.params.type;
  let filename = `ConnectKarnataka_${type}_${Date.now()}.csv`;
  let csv = '';

  if (type === 'contacts') {
    const rows = db.prepare('SELECT id, name, phone, district, status, last_contacted, notes FROM contacts').all();
    csv = 'ID,Name,Phone,District,Status,Last Contacted,Notes\n' +
      rows.map(r => `"${r.id}","${r.name}","${r.phone}","${r.district}","${r.status}","${r.last_contacted}","${(r.notes||'').replace(/"/g, '""')}"`).join('\n');
  } else if (type === 'calls') {
    const rows = db.prepare('SELECT id, contact_name, contact_phone, district, caller_name, date, time, duration, outcome, response, description FROM calls ORDER BY id DESC').all();
    csv = 'ID,Contact Name,Phone,District,Caller,Date,Time,Duration,Outcome,Response,Description\n' +
      rows.map(r => `"${r.id}","${r.name||r.contact_name}","${r.contact_phone}","${r.district}","${r.caller_name}","${r.date}","${r.time}","${r.duration}","${r.outcome}","${r.response}","${(r.description||'').replace(/"/g, '""')}"`).join('\n');
  } else if (type === 'districts') {
    const rows = db.prepare('SELECT id, name, incharge_name, total_contacts, called, pending, agree, neutral, disagree FROM districts').all();
    csv = 'ID,District,In-Charge,Total Contacts,Called,Pending,Agree,Neutral,Disagree\n' +
      rows.map(r => `"${r.id}","${r.name}","${r.incharge_name||'Unassigned'}","${r.total_contacts}","${r.called}","${r.pending}","${r.agree}","${r.neutral}","${r.disagree}"`).join('\n');
  } else if (type === 'responses') {
    const rows = db.prepare('SELECT name, called, agree, neutral, disagree FROM districts').all();
    csv = 'District,Total Called,Agree,Agree %,Neutral,Neutral %,Disagree,Disagree %\n' +
      rows.map(r => {
        const c = r.called || 1;
        const ap = Math.round((r.agree / c) * 100);
        const np = Math.round((r.neutral / c) * 100);
        const dp = 100 - ap - np;
        return `"${r.name}","${r.called}","${r.agree}","${ap}%","${r.neutral}","${np}%","${r.disagree}","${dp}%"`;
      }).join('\n');
  } else {
    return res.status(400).send('Invalid report type');
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
});

// Unified single-port server (Live Vite HMR + Static build fallback on http://localhost:5000)
async function startServer() {
  const clientRoot = path.join(__dirname, '..', 'client');
  const viteNodePath = path.join(clientRoot, 'node_modules', 'vite', 'dist', 'node', 'index.js');

  let useViteMiddleware = false;
  if (process.env.NODE_ENV !== 'production' && fs.existsSync(viteNodePath)) {
    try {
      process.chdir(clientRoot);
      const { createServer: createViteServer } = await import(pathToFileURL(viteNodePath).href);
      const vite = await createViteServer({
        root: clientRoot,
        configFile: path.join(clientRoot, 'vite.config.js'),
        server: { middlewareMode: true },
        appType: 'spa'
      });
      app.use(vite.middlewares);
      useViteMiddleware = true;
      console.log('[Connect Karnataka] Unified Live Dev + Backend mode active');
    } catch (err) {
      console.warn('[Connect Karnataka] Falling back to static dist build:', err.message);
    }
  }

  if (!useViteMiddleware && fs.existsSync(CLIENT_DIST)) {
    app.use(express.static(CLIENT_DIST, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
      }
    }));

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.join(CLIENT_DIST, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[Connect Karnataka] Unified Server running on http://localhost:${PORT}`);
  });
}

startServer();

