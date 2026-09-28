import os

files = {
    r'C:\DEMO AADHAR\client\src\pages\Contacts.jsx': [
        (
            "`My Contacts — ${user?.district || 'Jurisdiction'}` : 'Citizen Contact Directory (All 31 Districts)'",
            "`ನನ್ನ ಸಂಪರ್ಕಗಳು — ${user?.district || 'Jurisdiction'}` : 'ನಾಗರಿಕ ಸಂಪರ್ಕ ನಿರ್ದೇಶಿಕೆ (ಎಲ್ಲಾ 31 ಜಿಲ್ಲೆಗಳು)'"
        ),
        (
            "Showing assigned contacts for ${user?.district || 'your'} district jurisdiction (${total} contacts listed)",
            "${user?.district || 'ನಿಮ್ಮ'} ಜಿಲ್ಲಾ ವ್ಯಾಪ್ತಿಗೆ ನಿಯೋಜಿಸಿದ ಸಂಪರ್ಕಗಳನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ (${total} ಸಂಪರ್ಕಗಳು ಪಟ್ಟಿ ಮಾಡಲಾಗಿದೆ)"
        ),
        (
            "Enterprise searchable directory connected to the 4,00,000+ contact repository",
            "4,00,000+ ಸಂಪರ್ಕ ಭಂಡಾರದೊಂದಿಗೆ ಸಂಪರ್ಕಿತ ಎಂಟರ್ಪ್ರೈಸ್ ಹುಡುಕಬಹುದಾದ ನಿರ್ದೇಶಿಕೆ"
        ),
        (
            "<span>Assigned: {user?.district || 'Bengaluru Urban'}</span>",
            "<span>ನಿಯೋಜಿತ: {user?.district || 'Bengaluru Urban'}</span>"
        ),
        (
            "<span>Import CSV</span>",
            "<span>CSV ಆಮದು ಮಾಡಿ</span>"
        ),
        (
            "<span>Refresh</span>",
            "<span>ರಿಫ್ರೆಶ್</span>"
        ),
        (
            "Search ${isMyContacts ? (user?.district || '') : ''} citizen name (e.g. Rahul Kumar) or phone...",
            "${isMyContacts ? (user?.district || '') : ''} ನಾಗರಿಕ ಹೆಸರು ಅಥವಾ ಫೋನ್ ಹುಡುಕಿ..."
        ),
        (">District:</span>", ">ಜಿಲ್ಲೆ:</span>"),
        (">All Karnataka (31 Districts)</option>", ">ಎಲ್ಲಾ ಕರ್ನಾಟಕ (31 ಜಿಲ್ಲೆಗಳು)</option>"),
        (">Status:</span>", ">ಸ್ಥಿತಿ:</span>"),
        (">All Statuses</option>", ">ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು</option>"),
        (">🟢 Agree</option>", ">🟢 ಒಪ್ಪಿಗೆ</option>"),
        (">🟡 Neutral</option>", ">🟡 ತಟಸ್ಥ</option>"),
        (">🔴 Disagree</option>", ">🔴 ಅಸಮ್ಮತಿ</option>"),
        (">⚪ Not Contacted</option>", ">⚪ ಸಂಪರ್ಕಿಸಿಲ್ಲ</option>"),
        ("<th className=\"py-3.5 px-6\">Name</th>", "<th className=\"py-3.5 px-6\">ಹೆಸರು</th>"),
        ("<th className=\"py-3.5 px-4\">Phone</th>", "<th className=\"py-3.5 px-4\">ಫೋನ್</th>"),
        ("<th className=\"py-3.5 px-4\">District</th>", "<th className=\"py-3.5 px-4\">ಜಿಲ್ಲೆ</th>"),
        ("<th className=\"py-3.5 px-4\">Status</th>", "<th className=\"py-3.5 px-4\">ಸ್ಥಿತಿ</th>"),
        ("<th className=\"py-3.5 px-4\">Last Contacted</th>", "<th className=\"py-3.5 px-4\">ಕೊನೆಯ ಸಂಪರ್ಕ</th>"),
        ("<th className=\"py-3.5 px-6 text-right\">Actions</th>", "<th className=\"py-3.5 px-6 text-right\">ಕ್ರಿಯೆಗಳು</th>"),
        ("<span>🟢</span> AGREE", "<span>🟢</span> ಒಪ್ಪಿಗೆ"),
        ("<span>🟡</span> NEUTRAL", "<span>🟡</span> ತಟಸ್ಥ"),
        ("<span>🔴</span> DISAGREE", "<span>🔴</span> ಅಸಮ್ಮತಿ"),
        ("<span>⚪</span> NOT CONTACTED", "<span>⚪</span> ಸಂಪರ್ಕಿಸಿಲ್ಲ"),
        ("Demo Target", "ಡೆಮೋ ಗುರಿ"),
        ("History Target", "ಇತಿಹಾಸ ಗುರಿ"),
        ("Fetching contacts from SQLite...", "ಸಂಪರ್ಕಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ..."),
        ("No contacts found for ${activeDistrict} matching criteria.", "${activeDistrict} ಗೆ ಹೊಂದುವ ಯಾವುದೇ ಸಂಪರ್ಕ ಕಂಡುಬಂದಿಲ್ಲ."),
        ("<span>CALL NOW</span>", "<span>ಈಗ ಕರೆ ಮಾಡಿ</span>"),
        ("<span>Profile</span>", "<span>ಪ್ರೊಫೈಲ್</span>"),
        ("Showing <strong className=\"text-slate-900\">{contacts.length}</strong> of{' '}\n            <strong className=\"text-slate-900\">{total}</strong> contacts in{' '}\n            <strong className=\"text-emerald-700\">{activeDistrict}</strong>", 
         "<strong className=\"text-emerald-700\">{activeDistrict}</strong> ರಲ್ಲಿ <strong className=\"text-slate-900\">{contacts.length}</strong> ರಿಂದ <strong className=\"text-slate-900\">{total}</strong> ಸಂಪರ್ಕಗಳನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ"),
        ("Page {page} of {totalPages}", "ಪುಟ {page} ರಿಂದ {totalPages}"),
        ("alert('No valid contacts found in CSV. Expected format: Name, Phone, [District]');", "alert('CSV ನಲ್ಲಿ ಯಾವುದೇ ಮಾನ್ಯ ಸಂಪರ್ಕಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ನಿರೀಕ್ಷಿತ ಸ್ವರೂಪ: ಹೆಸರು, ಫೋನ್, [ಜಿಲ್ಲೆ]');"),
        ("alert(`Successfully imported ${data.added} contacts to ${uploadDistrict}!`);", "alert(`${uploadDistrict} ಗೆ ${data.added} ಸಂಪರ್ಕಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಆಮದು ಮಾಡಲಾಗಿದೆ!`);")
    ],
    r'C:\DEMO AADHAR\client\src\pages\Calls.jsx': [
        ("<span>Call Logs & Telephony History</span>", "<span>ಕರೆ ದಾಖಲೆಗಳು & ದೂರವಾಣಿ ಇತಿಹಾಸ</span>"),
        ("Complete audit record of conversations, feedback sentiment, and caller notes", "ಸಂಭಾಷಣೆಗಳ, ಪ್ರತಿಕ್ರಿಯೆ ಅಭಿಪ್ರಾಯ ಮತ್ತು ಕರೆ ಮಾಡುವವರ ಟಿಪ್ಪಣಿಗಳ ಸಂಪೂರ್ಣ ಆಡಿಟ್ ದಾಖಲೆ"),
        ("<span>Refresh Logs</span>", "<span>ದಾಖಲೆಗಳನ್ನು ರಿಫ್ರೆಶ್ ಮಾಡಿ</span>"),
        ("placeholder=\"Search citizen or notes...\"", "placeholder=\"ನಾಗರಿಕ ಅಥವಾ ಟಿಪ್ಪಣಿ ಹುಡುಕಿ...\""),
        (">District:</span>", ">ಜಿಲ್ಲೆ:</span>"),
        (">All Karnataka (31)</option>", ">ಎಲ್ಲಾ ಕರ್ನಾಟಕ (31)</option>"),
        (">Response:</span>", ">ಪ್ರತಿಕ್ರಿಯೆ:</span>"),
        (">All Responses</option>", ">ಎಲ್ಲಾ ಪ್ರತಿಕ್ರಿಯೆಗಳು</option>"),
        (">🟢 Agree</option>", ">🟢 ಒಪ್ಪಿಗೆ</option>"),
        (">🟡 Neutral</option>", ">🟡 ತಟಸ್ಥ</option>"),
        (">🔴 Disagree</option>", ">🔴 ಅಸಮ್ಮತಿ</option>"),
        (">Outcome:</span>", ">ಫಲಿತಾಂಶ:</span>"),
        (">All Outcomes</option>", ">ಎಲ್ಲಾ ಫಲಿತಾಂಶಗಳು</option>"),
        (">Connected</option>", ">ಸಂಪರ್ಕಿತ</option>"),
        (">No Answer</option>", ">ಉತ್ತರವಿಲ್ಲ</option>"),
        (">Busy</option>", ">ಕಾರ್ಯನಿರತ</option>"),
        (">Call Back Later</option>", ">ನಂತರ ಕರೆ ಮಾಡಿ</option>"),
        ("<th className=\"py-3.5 px-6\">Contact</th>", "<th className=\"py-3.5 px-6\">ಸಂಪರ್ಕ</th>"),
        ("<th className=\"py-3.5 px-4\">Caller</th>", "<th className=\"py-3.5 px-4\">ಕರೆ ಮಾಡಿದವರು</th>"),
        ("<th className=\"py-3.5 px-4\">Date & Time</th>", "<th className=\"py-3.5 px-4\">ದಿನಾಂಕ & ಸಮಯ</th>"),
        ("<th className=\"py-3.5 px-4\">Duration</th>", "<th className=\"py-3.5 px-4\">ಅವಧಿ</th>"),
        ("<th className=\"py-3.5 px-4\">Outcome</th>", "<th className=\"py-3.5 px-4\">ಫಲಿತಾಂಶ</th>"),
        ("<th className=\"py-3.5 px-4\">Response</th>", "<th className=\"py-3.5 px-4\">ಪ್ರತಿಕ್ರಿಯೆ</th>"),
        ("<th className=\"py-3.5 px-6\">Description / Notes</th>", "<th className=\"py-3.5 px-6\">ವಿವರಣೆ / ಟಿಪ್ಪಣಿಗಳು</th>"),
        ("Retrieving call logs...", "ಕರೆ ದಾಖಲೆಗಳನ್ನು ಹಿಂಪಡೆಯಲಾಗುತ್ತಿದೆ..."),
        ("No call logs recorded yet.", "ಇನ್ನೂ ಯಾವುದೇ ಕರೆ ದಾಖಲೆಗಳಿಲ್ಲ."),
        ("<span>🟢</span> AGREE", "<span>🟢</span> ಒಪ್ಪಿಗೆ"),
        ("<span>🟡</span> NEUTRAL", "<span>🟡</span> ತಟಸ್ಥ"),
        ("<span>🔴</span> DISAGREE", "<span>🔴</span> ಅಸಮ್ಮತಿ"),
    ],
    r'C:\DEMO AADHAR\client\src\pages\Reports.jsx': [
        ("<span>Enterprise Reports &amp; Data Export Center</span>", "<span>ಎಂಟರ್ಪ್ರೈಸ್ ವರದಿಗಳು &amp; ದತ್ತಾಂಶ ರಫ್ತು ಕೇಂದ್ರ</span>"),
        ("Export or import standardized CSV data to/from the SQLite relational database", "SQLite ಡೇಟಾಬೇಸ್ಗೆ/ನಿಂದ ಪ್ರಮಾಣಿತ CSV ದತ್ತಾಂಶವನ್ನು ರಫ್ತು ಅಥವಾ ಆಮದು ಮಾಡಿ"),
        ("Import Contacts from CSV", "CSV ನಿಂದ ಸಂಪರ್ಕಗಳನ್ನು ಆಮದು ಮಾಡಿ"),
        ("Format: Name, Phone, [District]", "ಸ್ವರೂಪ: ಹೆಸರು, ಫೋನ್, [ಜಿಲ್ಲೆ]"),
        ("Default District:", "ಡೀಫಾಲ್ಟ್ ಜಿಲ್ಲೆ:"),
        ("Importing...", "ಆಮದು ಮಾಡಲಾಗುತ್ತಿದೆ..."),
        ("Choose CSV File & Import", "CSV ಫೈಲ್ ಆರಿಸಿ & ಆಮದು ಮಾಡಿ"),
        ("If your CSV has a 3rd column (District), contacts will be routed to that district automatically.", "ನಿಮ್ಮ CSV ನಲ್ಲಿ 3ನೇ ಅಂಕಣ (ಜಿಲ್ಲೆ) ಇದ್ದರೆ, ಸಂಪರ್ಕಗಳು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಆ ಜಿಲ್ಲೆಗೆ ಕಳುಹಿಸಲ್ಪಡುತ್ತವೆ."),
        ("Otherwise, they go to the selected default district above.", "ಇಲ್ಲದಿದ್ದರೆ, ಮೇಲೆ ಆಯ್ಕೆ ಮಾಡಿದ ಡೀಫಾಲ್ಟ್ ಜಿಲ್ಲೆಗೆ ಹೋಗುತ್ತವೆ."),
        ("Export Reports", "ವರದಿಗಳನ್ನು ರಫ್ತು ಮಾಡಿ"),
        ("Tabular CSV Export", "ಕೋಷ್ಟಕ CSV ರಫ್ತು"),
        ("Contact Master Report", "ಸಂಪರ್ಕ ಮಾಸ್ಟರ್ ವರದಿ"),
        ("Call Telephony Log Report", "ಕರೆ ದೂರವಾಣಿ ದಾಖಲೆ ವರದಿ"),
        ("District Performance Report", "ಜಿಲ್ಲಾ ಕಾರ್ಯಕ್ಷಮತೆ ವರದಿ"),
        ("Response Sentiment Report", "ಪ್ರತಿಕ್ರಿಯೆ ಅಭಿಪ್ರಾಯ ವರದಿ"),
        ("Export all citizen contacts, assigned in-charges, verified phone masks, and current outreach status.", "ಎಲ್ಲಾ ನಾಗರಿಕ ಸಂಪರ್ಕಗಳು, ನಿಯೋಜಿಸಿದ ಉಸ್ತುವಾರಿಗಳು, ಪರಿಶೀಲಿಸಿದ ಫೋನ್ ಮಾಸ್ಕ್ಗಳು ಮತ್ತು ಪ್ರಸ್ತುತ ಪ್ರಚಾರ ಸ್ಥಿತಿಯನ್ನು ರಫ್ತು ಮಾಡಿ."),
        ("Export historical interaction logs, durations, caller timestamps, outcomes, and qualitative conversation notes.", "ಐತಿಹಾಸಿಕ ಸಂವಾದ ದಾಖಲೆಗಳು, ಅವಧಿ, ಕರೆ ಮಾಡಿದ ಸಮಯಮೊಹರು, ಫಲಿತಾಂಶಗಳು ಮತ್ತು ಗುಣಾತ್ಮಕ ಸಂಭಾಷಣೆ ಟಿಪ್ಪಣಿಗಳನ್ನು ರಫ್ತು ಮಾಡಿ."),
        ("Export district-wise quota tracking, caller allocations, total completed, and pending queues.", "ಜಿಲ್ಲಾವಾರು ಕೋಟಾ ಟ್ರ್ಯಾಕಿಂಗ್, ಕರೆ ಮಾಡುವವರ ಹಂಚಿಕೆ, ಒಟ್ಟು ಪೂರ್ಣಗೊಂಡದ್ದು ಮತ್ತು ಬಾಕಿ ಸರದಿಗಳನ್ನು ರಫ್ತು ಮಾಡಿ."),
        ("Export aggregated citizen feedback distribution (🟢 Agree %, 🟡 Neutral %, 🔴 Disagree %) by district.", "ಸಂಗ್ರಹಿಸಿದ ನಾಗರಿಕ ಪ್ರತಿಕ್ರಿಯೆ ವಿತರಣೆ (🟢 ಒಪ್ಪಿಗೆ %, 🟡 ತಟಸ್ಥ %, 🔴 ಅಸಮ್ಮತಿ %) ಜಿಲ್ಲೆಯಿಂದ ರಫ್ತು ಮಾಡಿ."),
        ("<span>Export CSV</span>", "<span>CSV ರಫ್ತು ಮಾಡಿ</span>"),
        ("All reports adhere to Government of Karnataka data privacy policies. Citizen phone numbers are masked in exported records to prevent unauthorized dissemination.", "ಎಲ್ಲಾ ವರದಿಗಳು ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ದತ್ತಾಂಶ ಗೌಪ್ಯತಾ ನೀತಿಗಳಿಗೆ ಬದ್ಧವಾಗಿವೆ. ಅನಧಿಕೃತ ಪ್ರಸಾರವನ್ನು ತಡೆಯಲು ರಫ್ತು ದಾಖಲೆಗಳಲ್ಲಿ ನಾಗರಿಕ ಫೋನ್ ಸಂಖ್ಯೆಗಳನ್ನು ಮರೆಮಾಡಲಾಗಿದೆ."),
        ("No valid rows found. CSV must have columns: Name, Phone, [District]", "ಯಾವುದೇ ಮಾನ್ಯ ಸಾಲುಗಳು ಕಂಡುಬಂದಿಲ್ಲ. CSV ಅಂಕಣಗಳನ್ನು ಹೊಂದಿರಬೇಕು: ಹೆಸರು, ಫೋನ್, [ಜಿಲ್ಲೆ]"),
        ("Downloading ${title} (CSV format)...", "${title} ಡೌನ್ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ (CSV ಸ್ವರೂಪ)..."),
        ("Imported ${data.added} contacts successfully!", "${data.added} ಸಂಪರ್ಕಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಆಮದು ಮಾಡಲಾಗಿದೆ!"),
        ("Successfully imported ${data.added} contacts into the database!", "ಡೇಟಾಬೇಸ್ಗೆ ${data.added} ಸಂಪರ್ಕಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಆಮದು ಮಾಡಲಾಗಿದೆ!")
    ],
    r'C:\DEMO AADHAR\client\src\pages\AuditLogs.jsx': [
        ("Immutable Platform Audit Logs", "ಬದಲಾಯಿಸಲಾಗದ ಪ್ಲಾಟ್ಫಾರ್ಮ್ ಆಡಿಟ್ ದಾಖಲೆಗಳು"),
        ("Chronological audit trail recording authentication, status changes, calling milestones, and broadcasts", "ದೃಢೀಕರಣ, ಸ್ಥಿತಿ ಬದಲಾವಣೆಗಳು, ಕರೆ ಮೈಲಿಗಲ್ಲುಗಳು ಮತ್ತು ಪ್ರಸಾರಗಳನ್ನು ದಾಖಲಿಸುವ ಕಾಲಾನುಕ್ರಮ ಆಡಿಟ್ ಮಾರ್ಗ"),
        ("<span>Refresh Trail</span>", "<span>ಮಾರ್ಗ ರಿಫ್ರೆಶ್ ಮಾಡಿ</span>"),
        ("placeholder=\"Search action, user, or milestone...\"", "placeholder=\"ಕ್ರಿಯೆ, ಬಳಕೆದಾರ ಅಥವಾ ಮೈಲಿಗಲ್ಲು ಹುಡುಕಿ...\""),
        ("<th className=\"py-3.5 px-6\">User / Actor</th>", "<th className=\"py-3.5 px-6\">ಬಳಕೆದಾರ / ಕರ್ತೃ</th>"),
        ("<th className=\"py-3.5 px-6\">Action / Event</th>", "<th className=\"py-3.5 px-6\">ಕ್ರಿಯೆ / ಘಟನೆ</th>"),
        ("<th className=\"py-3.5 px-4\">Date</th>", "<th className=\"py-3.5 px-4\">ದಿನಾಂಕ</th>"),
        ("<th className=\"py-3.5 px-4\">Time</th>", "<th className=\"py-3.5 px-4\">ಸಮಯ</th>"),
        ("Retrieving audit events...", "ಆಡಿಟ್ ಘಟನೆಗಳನ್ನು ಹಿಂಪಡೆಯಲಾಗುತ್ತಿದೆ..."),
        ("No audit records match query.", "ಯಾವುದೇ ಆಡಿಟ್ ದಾಖಲೆಗಳು ಪ್ರಶ್ನೆಗೆ ಹೊಂದುತ್ತಿಲ್ಲ.")
    ]
}

for path, replacements in files.items():
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        if old not in content:
            print(f'Warning: {repr(old)} not found in {path}')
        content = content.replace(old, new)
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
print('Done!')
