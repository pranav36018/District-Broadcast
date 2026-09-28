import { db, initDB } from './server/db.js';

async function runTests() {
  console.log('--- STARTING CONNECT KARNATAKA AUTOMATED DEMO VERIFICATION ---');

  // Check if server is already running on port 5000
  let isRunning = false;
  try {
    const ping = await fetch('http://localhost:5000/api/districts');
    if (ping.ok) isRunning = true;
  } catch (e) {}

  if (!isRunning) {
    await import('./server/index.js');
    await new Promise(r => setTimeout(r, 600));
  }

  const BASE_URL = 'http://localhost:5000';

  let passCount = 0;
  function assert(cond, msg) {
    if (!cond) {
      console.error(`❌ FAILED: ${msg}`);
      process.exit(1);
    } else {
      console.log(`✅ PASSED: ${msg}`);
      passCount++;
    }
  }

  // 1. Super Admin Login
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@connectkarnataka.demo', password: 'admin123' })
  });
  const adminLogin = await adminLoginRes.json();
  assert(adminLogin.user?.role === 'super_admin', 'Step 1: Super Admin login succeeded');

  // 2. Super Admin Dashboard Stats
  const statsRes = await fetch(`${BASE_URL}/api/dashboard/stats`);
  const stats = await statsRes.json();
  const s = stats.superAdmin;
  assert(s.totalContacts === '4,00,000+', `Step 2a: Total contacts shows 4,00,000+ (Got ${s.totalContacts})`);
  assert(s.callsCompleted.includes('2,84,52'), `Step 2b: Calls completed represents 2,84,521 scale (Got ${s.callsCompleted})`);
  assert(s.activeCallers === 248, `Step 2c: Active callers is 248 (Got ${s.activeCallers})`);
  assert(s.responseDistribution.agree.percent === 67, `Step 2d: Agree response is 67% (Got ${s.responseDistribution.agree.percent}%)`);
  assert(s.responseDistribution.neutral.percent === 23, `Step 2e: Neutral response is 23% (Got ${s.responseDistribution.neutral.percent}%)`);
  assert(s.responseDistribution.disagree.percent === 10, `Step 2f: Disagree response is 10% (Got ${s.responseDistribution.disagree.percent}%)`);
  assert(s.callingProgress === 71, `Step 2g: Calling progress is ~71% (Got ${s.callingProgress}%)`);

  // 3. Districts List
  const districtsRes = await fetch(`${BASE_URL}/api/districts`);
  const districts = await districtsRes.json();
  assert(districts.length === 31, `Step 3: All 31 Karnataka districts returned (Got ${districts.length})`);

  // 4. Bengaluru Urban District Overview
  const bglRes = await fetch(`${BASE_URL}/api/districts/Bengaluru%20Urban`);
  const bgl = await bglRes.json();
  assert(bgl.name === 'Bengaluru Urban', 'Step 4a: Bengaluru Urban found');
  assert(bgl.total_contacts === 35421, `Step 4b: Total contacts is 35,421 (Got ${bgl.total_contacts})`);
  assert(bgl.called >= 28321, `Step 4c: Completed calls is ~28,321 (Got ${bgl.called})`);

  // 5. Assignments
  const assignRes = await fetch(`${BASE_URL}/api/assignments`);
  const assign = await assignRes.json();
  const bglAssign = assign.find(a => a.district === 'Bengaluru Urban');
  assert(bglAssign && bglAssign.incharge_name === 'Suresh Gowda', 'Step 5: Assignments show Suresh Gowda for Bengaluru Urban');

  // 6. District In-charge Login
  const inchargeLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'incharge@connectkarnataka.demo', password: 'incharge123' })
  });
  const inchargeLogin = await inchargeLoginRes.json();
  assert(inchargeLogin.user?.role === 'district_incharge', 'Step 6a: District In-charge login succeeded');
  assert(inchargeLogin.user?.district === 'Bengaluru Urban', 'Step 6b: In-charge assigned to Bengaluru Urban');

  // 7. In-charge Dashboard Stats
  const ic = stats.incharge;
  assert(ic.district === 'Bengaluru Urban', 'Step 7a: In-charge district is Bengaluru Urban');
  assert(ic.myContacts === '10,000+', 'Step 7b: In-charge contacts shows 10,000+');
  assert(ic.callsToday >= 183, `Step 7c: Calls today is >= 183 (Got ${ic.callsToday})`);
  assert(ic.todayTarget === 250, 'Step 7d: Today target is 250');

  // 8. Contact Search for Rahul Kumar
  const rahulSearchRes = await fetch(`${BASE_URL}/api/contacts?search=Rahul%20Kumar&district=Bengaluru%20Urban`);
  const rahulSearch = await rahulSearchRes.json();
  assert(rahulSearch.contacts.length >= 1, 'Step 8a: Rahul Kumar found in search');
  const rahul = rahulSearch.contacts[0];
  assert(rahul.name === 'Rahul Kumar', 'Step 8b: Name is Rahul Kumar');
  assert(rahul.phone === '+91 XXXXXXXX01', `Step 8c: Phone is +91 XXXXXXXX01 (Got ${rahul.phone})`);
  assert(rahul.district === 'Bengaluru Urban', 'Step 8d: District is Bengaluru Urban');

  // 9. Simulated Call Workflow & Post-Call Save
  const callRecordRes = await fetch(`${BASE_URL}/api/calls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contact_id: rahul.id,
      duration: '00:12',
      outcome: 'Connected',
      response: 'agree',
      description: 'Contact agreed with the proposal.',
      caller_name: 'Suresh Gowda',
      caller_id: 2
    })
  });
  const callRecord = await callRecordRes.json();
  assert(callRecord.success === true, 'Step 9a: Call record successfully saved to SQLite');
  assert(callRecord.contact.status === 'agree', 'Step 9b: Rahul Kumar status updated to 🟢 Agree');
  assert(callRecord.contact.history.length >= 1, 'Step 9c: Call added to contact call history');
  assert(callRecord.contact.history[0].duration === '00:12', 'Step 9d: Call duration recorded as 00:12');
  assert(callRecord.contact.history[0].description === 'Contact agreed with the proposal.', 'Step 9e: Description recorded');

  // 10. Verify Contact Details Endpoint
  const rahulDetailRes = await fetch(`${BASE_URL}/api/contacts/${rahul.id}`);
  const rahulDetail = await rahulDetailRes.json();
  assert(rahulDetail.status === 'agree', 'Step 10a: Status persisted as agree');
  assert(rahulDetail.notes.includes('agreed'), 'Step 10b: Notes persisted');

  // 11. Verify Call Logs Table
  const callLogsRes = await fetch(`${BASE_URL}/api/calls`);
  const callLogs = await callLogsRes.json();
  assert(callLogs.length >= 1 && callLogs[0].contact_name === 'Rahul Kumar', 'Step 11: Rahul Kumar call is at top of Call Logs');

  // 12. Create Broadcast Workflow
  const broadcastRes = await fetch(`${BASE_URL}/api/broadcasts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Important Announcement',
      message: "Tomorrow's meeting will begin at 10:00 AM.",
      audience: 'All Karnataka'
    })
  });
  const broadcastData = await broadcastRes.json();
  assert(broadcastData.success === true, 'Step 12a: Broadcast created successfully');
  assert(broadcastData.message.includes('4,00,000+ contacts'), `Step 12b: Confirmation message verified (Got: ${broadcastData.message})`);
  assert(broadcastData.broadcast.recipients === '4,00,000+', `Step 12c: Recipients is 4,00,000+ (Got ${broadcastData.broadcast.recipients})`);
  assert(broadcastData.broadcast.delivered === '3,82,421', `Step 12d: Delivered is 3,82,421 (Got ${broadcastData.broadcast.delivered})`);
  assert(broadcastData.broadcast.pending === '17,579', `Step 12e: Pending is 17,579 (Got ${broadcastData.broadcast.pending})`);
  assert(broadcastData.broadcast.status === 'Sent', 'Step 12f: Status is Sent');

  // 13. Broadcast History
  const bcastHistoryRes = await fetch(`${BASE_URL}/api/broadcasts`);
  const bcastHistory = await bcastHistoryRes.json();
  assert(bcastHistory[0].title === 'Important Announcement', 'Step 13: New announcement appears in broadcast history');

  // 14. Voice Library
  const voiceRes = await fetch(`${BASE_URL}/api/voice`);
  const voiceList = await voiceRes.json();
  assert(voiceList.length >= 3, `Step 14: Pre-seeded voice announcements available (Got ${voiceList.length})`);

  // 15. CSV Export Reports
  const csvContactsRes = await fetch(`${BASE_URL}/api/reports/export/contacts`);
  const csvText = await csvContactsRes.text();
  assert(csvText.includes('Rahul Kumar') && csvText.includes('agree'), 'Step 15a: Contacts CSV export contains Rahul Kumar with agree status');

  const csvCallsRes = await fetch(`${BASE_URL}/api/reports/export/calls`);
  const csvCalls = await csvCallsRes.text();
  assert(csvCalls.includes('Contact agreed with the proposal'), 'Step 15b: Calls CSV export contains conversation description');

  // 16. Audit Log
  const auditRes = await fetch(`${BASE_URL}/api/audit-logs`);
  const auditLogs = await auditRes.json();
  const hasCallAudit = auditLogs.some(l => l.action.includes('Rahul Kumar'));
  assert(hasCallAudit, 'Step 16: Audit log successfully recorded Rahul Kumar call event');

  console.log(`\n🎉 ALL ${passCount} AUTOMATED TESTS PASSED SUCCESSFULLY! EVERYTHING WORKS!`);
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
