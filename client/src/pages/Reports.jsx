import React, { useRef, useState } from 'react';
import { FileSpreadsheet, Download, FileText, CheckCircle2, Database, Shield, Upload, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Reports({ onShowToast }) {
  const { t, language, formatDistrictName } = useLanguage();
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState('Bengaluru');

  const karnatakDistricts = [
    'Bagalkote','Ballari','Belagavi','Bengaluru',
    'Bidar','Chamarajanagar','Chikkaballapura','Chikkamagaluru','Chitradurga',
    'Dakshina Kannada','Davanagere','Dharwad','Gadag','Hassan',
    'Haveri','Kalaburagi','Kodagu','Kolar','Koppal',
    'Mandya','Mysuru','Raichur','Ramanagara','Shivamogga',
    'Tumakuru','Udupi','Uttara Kannada','Vijayapura','Vijayanagara','Yadgir'
  ];

  const reportsList = [
    {
      id: 'contacts',
      title: t('ಸಂಪರ್ಕ ಮಾಸ್ಟರ್ ವರದಿ', 'Contact Master Report'),
      description: t(
        'ಎಲ್ಲಾ ನಾಗರಿಕ ಸಂಪರ್ಕಗಳು, ನಿಯೋಜಿಸಿದ ಉಸ್ತುವಾರಿಗಳು, ಪರಿಶೀಲಿಸಿದ ಫೋನ್ ಮಾಸ್ಕ್ಗಳು ಮತ್ತು ಪ್ರಸ್ತುತ ಪ್ರಚಾರ ಸ್ಥಿತಿಯನ್ನು ರಫ್ತು ಮಾಡಿ.',
        'Export all citizen contacts, assigned in-charges, verified phone masks, and current outreach status.'
      ),
      filename: 'ConnectKarnataka_Contacts_Export.csv',
      color: 'emerald'
    },
    {
      id: 'calls',
      title: t('ಕರೆ ದೂರವಾಣಿ ದಾಖಲೆ ವರದಿ', 'Call Telephony Log Report'),
      description: t(
        'ಐತಿಹಾಸಿಕ ಸಂವಾದ ದಾಖಲೆಗಳು, ಅವಧಿ, ಕರೆ ಮಾಡಿದ ಸಮಯಮೊಹರು, ಫಲಿತಾಂಶಗಳು ಮತ್ತು ಗುಣಾತ್ಮಕ ಸಂಭಾಷಣೆ ಟಿಪ್ಪಣಿಗಳನ್ನು ರಫ್ತು ಮಾಡಿ.',
        'Export historical interaction logs, durations, caller timestamps, outcomes, and qualitative conversation notes.'
      ),
      filename: 'ConnectKarnataka_Calls_Export.csv',
      color: 'blue'
    },
    {
      id: 'districts',
      title: t('ಜಿಲ್ಲಾ ಕಾರ್ಯಕ್ಷಮತೆ ವರದಿ', 'District Performance Report'),
      description: t(
        'ಜಿಲ್ಲಾವಾರು ಕೋಟಾ ಟ್ರ್ಯಾಕಿಂಗ್, ಕರೆ ಮಾಡುವವರ ಹಂಚಿಕೆ, ಒಟ್ಟು ಪೂರ್ಣಗೊಂಡದ್ದು ಮತ್ತು ಬಾಕಿ ಸರದಿಗಳನ್ನು ರಫ್ತು ಮಾಡಿ.',
        'Export district-wise quota tracking, caller allocations, total completed, and pending queues.'
      ),
      filename: 'ConnectKarnataka_Districts_Export.csv',
      color: 'purple'
    },
    {
      id: 'responses',
      title: t('ಪ್ರತಿಕ್ರಿಯೆ ಅಭಿಪ್ರಾಯ ವರದಿ', 'Response Sentiment Report'),
      description: t(
        'ಸಂಗ್ರಹಿಸಿದ ನಾಗರಿಕ ಪ್ರತಿಕ್ರಿಯೆ ವಿತರಣೆ (🟢 ಒಪ್ಪಿಗೆ %, 🟡 ತಟಸ್ಥ %, 🔴 ಅಸಮ್ಮತಿ %) ಜಿಲ್ಲೆಯಿಂದ ರಫ್ತು ಮಾಡಿ.',
        'Export aggregated citizen feedback distribution (🟢 Agree %, 🟡 Neutral %, 🔴 Disagree %) by district.'
      ),
      filename: 'ConnectKarnataka_Responses_Export.csv',
      color: 'amber'
    }
  ];

  const handleDownload = (type, title) => {
    window.location.href = `/api/reports/export/${type}`;
    if (onShowToast) {
      onShowToast(
        language === 'en' ? `Downloading ${title} (CSV format)...` : `${title} ಡೌನ್ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ (CSV ಸ್ವರೂಪ)...`,
        'success'
      );
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const buffer = evt.target.result;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!rawJson || rawJson.length === 0) {
          throw new Error(t('ಫೈಲ್ ಖಾಲಿಯಾಗಿದೆ', 'File is empty'));
        }

        const headerRow = rawJson[0] || [];
        let nameIdx = -1, phoneIdx = -1, distIdx = -1;

        headerRow.forEach((col, idx) => {
          const str = String(col || '').toLowerCase().trim();
          if (str.includes('name') || str.includes('ಹೆಸರು')) nameIdx = idx;
          if (str.includes('phone') || str.includes('mobile') || str.includes('ಫೋನ್') || str.includes('ಸಂಖ್ಯೆ') || str.includes('contact')) phoneIdx = idx;
          if (str.includes('district') || str.includes('ಜಿಲ್ಲೆ') || str.includes('city') || str.includes('location')) distIdx = idx;
        });

        let startRow = 1;
        if (nameIdx === -1 && phoneIdx === -1) {
          startRow = 0;
          nameIdx = 0;
          phoneIdx = 1;
          distIdx = 2;
        } else {
          if (nameIdx === -1) nameIdx = 0;
          if (phoneIdx === -1) phoneIdx = 1;
        }

        const contacts = [];
        for (let i = startRow; i < rawJson.length; i++) {
          const row = rawJson[i];
          if (!row || row.length === 0) continue;
          const name = String(row[nameIdx] || '').trim();
          const phone = String(row[phoneIdx] || '').trim();
          const district = distIdx !== -1 && row[distIdx] ? String(row[distIdx]).trim() : selectedDistrict;
          if (name && phone) {
            contacts.push({ name, phone, district: district || selectedDistrict });
          }
        }

        if (contacts.length === 0) {
          throw new Error(t('ಯಾವುದೇ ಮಾನ್ಯ ಸಾಲುಗಳು ಕಂಡುಬಂದಿಲ್ಲ. CSV ಅಂಕಣಗಳನ್ನು ಹೊಂದಿರಬೇಕು: ಹೆಸರು, ಫೋನ್, [ಜಿಲ್ಲೆ]', 'No valid rows found. CSV/Excel must have columns: Name, Phone, [District]'));
        }

        const res = await fetch('/api/contacts/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contacts, defaultDistrict: selectedDistrict })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Import failed');

        setImportResult({
          success: true,
          message: language === 'en'
            ? `Successfully imported ${data.added} contacts into the database!`
            : `ಡೇಟಾಬೇಸ್ಗೆ ${data.added} ಸಂಪರ್ಕಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಆಮದು ಮಾಡಲಾಗಿದೆ!`
        });

        if (onShowToast) {
          onShowToast(
            language === 'en' ? `Imported ${data.added} contacts successfully!` : `${data.added} ಸಂಪರ್ಕಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಆಮದು ಮಾಡಲಾಗಿದೆ!`,
            'success'
          );
        }
      } catch (err) {
        setImportResult({
          success: false,
          message: err.message
        });
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
          <span>{t('ಎಂಟರ್ಪ್ರೈಸ್ ವರದಿಗಳು & ದತ್ತಾಂಶ ರಫ್ತು ಕೇಂದ್ರ', 'Enterprise Reports & Data Export Center')}</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {t(
            'SQLite ಡೇಟಾಬೇಸ್ಗೆ/ನಿಂದ ಪ್ರಮಾಣಿತ CSV/Excel ದತ್ತಾಂಶವನ್ನು ರಫ್ತು ಅಥವಾ ಆಮದು ಮಾಡಿ',
            'Export or import standardized CSV/Excel data to/from the SQLite relational database'
          )}
        </p>
      </div>

      {/* ── IMPORT SECTION ── */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-emerald-300 p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-emerald-600" />
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            {t('CSV / Excel ನಿಂದ ಸಂಪರ್ಕಗಳನ್ನು ಆಮದು ಮಾಡಿ', 'Import Contacts from CSV / Excel')}
          </h2>
          <span className="ml-auto text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg hidden sm:inline-block">
            {t('ಸ್ವರೂಪ: ಹೆಸರು, ಫೋನ್, [ಜಿಲ್ಲೆ] (.xlsx, .xls, .csv)', 'Format: Name, Phone, [District] (.xlsx, .xls, .csv)')}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* District selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 whitespace-nowrap">
              {t('ಡೀಫಾಲ್ಟ್ ಜಿಲ್ಲೆ:', 'Default District:')}
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {karnatakDistricts.map(d => (
                <option key={d} value={d}>{formatDistrictName(d)}</option>
              ))}
            </select>
          </div>

          {/* File input trigger */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .xlsx, .xls, .tsv, .txt"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => { setImportResult(null); fileInputRef.current?.click(); }}
            disabled={importing}
            className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-bold shadow-sm cursor-pointer transition-colors active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>
              {importing 
                ? t('ಆಮದು ಮಾಡಲಾಗುತ್ತಿದೆ...', 'Importing...') 
                : t('ಫೈಲ್ ಆರಿಸಿ & ಆಮದು ಮಾಡಿ (CSV / Excel)', 'Choose File & Import (CSV / Excel)')}
            </span>
          </button>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            {t(
              'ನಿಮ್ಮ ಫೈಲ್ನಲ್ಲಿ ಜಿಲ್ಲೆ ಅಂಕಣವಿದ್ದರೆ, ಸಂಪರ್ಕಗಳು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಆ ಜಿಲ್ಲೆಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತವೆ. ಇಲ್ಲದಿದ್ದರೆ, ಮೇಲೆ ಆಯ್ಕೆ ಮಾಡಿದ ಡೀಫಾಲ್ಟ್ ಜಿಲ್ಲೆಗೆ ಹೋಗುತ್ತವೆ.',
              'If your file has a District column, contacts will be routed automatically. Otherwise, they go to the selected default district above.'
            )}
          </p>
        </div>

        {/* Result banner */}
        {importResult && (
          <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-xs font-semibold ${
            importResult.success
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}>
            <span>{importResult.message}</span>
            <button onClick={() => setImportResult(null)} className="cursor-pointer">
              <X className="w-4 h-4 opacity-60 hover:opacity-100" />
            </button>
          </div>
        )}
      </div>

      {/* ── EXPORT SECTION ── */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <Download className="w-4 h-4" />
          <span>{t('ವರದಿಗಳನ್ನು ರಫ್ತು ಮಾಡಿ', 'Export Reports')}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportsList.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {t('ಕೋಷ್ಟಕ CSV ರಫ್ತು', 'Tabular CSV Export')}
                  </span>
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{r.title}</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{r.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">{r.filename}</span>
                <button
                  onClick={() => handleDownload(r.id, r.title)}
                  className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer transition-colors active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('CSV ರಫ್ತು ಮಾಡಿ', 'Export CSV')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance banner */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
        <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <span>
          {t(
            'ಎಲ್ಲಾ ವರದಿಗಳು ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ದತ್ತಾಂಶ ಗೌಪ್ಯತಾ ನೀತಿಗಳಿಗೆ ಬದ್ಧವಾಗಿವೆ. ಅನಧಿಕೃತ ಪ್ರಸಾರವನ್ನು ತಡೆಯಲು ರಫ್ತು ದಾಖಲೆಗಳಲ್ಲಿ ನಾಗರಿಕ ಫೋನ್ ಸಂಖ್ಯೆಗಳನ್ನು ಮರೆಮಾಡಲಾಗಿದೆ.',
            'All reports adhere to Government of Karnataka data privacy policies. Citizen phone numbers are masked in exported records to prevent unauthorized dissemination.'
          )}
        </span>
      </div>

    </div>
  );
}
