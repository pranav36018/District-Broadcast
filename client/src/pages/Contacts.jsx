import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Phone,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Upload,
  Plus,
  Trash2,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  X,
  CheckCircle2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import AddDistrictModal from '../components/AddDistrictModal.jsx';

export default function Contacts({
  user,
  isMyContacts = false,
  onOpenCallModal,
  onOpenDetailModal,
  refreshTrigger
}) {
  const { t, language, formatDistrictName } = useLanguage();

  const [contacts, setContacts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState(isMyContacts ? (user?.district || 'Bengaluru Urban') : 'All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [allDistricts, setAllDistricts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showAddDistrictModal, setShowAddDistrictModal] = useState(false);
  const [districtModalInitialName, setDistrictModalInitialName] = useState('');
  const [detectedDistrictHint, setDetectedDistrictHint] = useState(null);

  // Import State
  const [importFile, setImportFile] = useState(null);
  const [parsedContacts, setParsedContacts] = useState([]);
  const [importDistrict, setImportDistrict] = useState(user?.district || 'Bengaluru Urban');
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [importStatusMessage, setImportStatusMessage] = useState(null);
  const fileInputRef = useRef(null);

  // Add Contact Form State
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    district: user?.district || 'Bengaluru',
    status: 'not_contacted',
    notes: ''
  });
  const [addLoading, setAddLoading] = useState(false);

  const activeDistrict = isMyContacts ? (user?.district || 'Bengaluru') : districtFilter;

  // Helper to extract district from filename
  const detectDistrictFromFileName = (fileName, districtsList) => {
    if (!fileName) return null;
    const clean = fileName.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[_-]/g, ' ');

    // 1. Direct match with existing districts in list
    for (const d of districtsList) {
      const dClean = d.name.toLowerCase().replace(/[_-]/g, ' ');
      if (clean.includes(dClean)) return d.name;
    }

    // 2. Check special/custom keywords
    const keywords = [
      { key: 'dakshina kannada', target: 'Dakshina Kannada' },
      { key: 'bengaluru 1', target: 'Bengaluru' },
      { key: 'bengaluru district', target: 'Bengaluru' },
      { key: 'bengaluru', target: 'Bengaluru' },
      { key: 'bangalore', target: 'Bengaluru' },
      { key: 'mysuru', target: 'Mysuru' },
      { key: 'mysore', target: 'Mysuru' },
      { key: 'belagavi', target: 'Belagavi' },
      { key: 'belgaum', target: 'Belagavi' },
      { key: 'mangaluru', target: 'Mangaluru' },
      { key: 'mangalore', target: 'Mangaluru' },
      { key: 'dharwad', target: 'Dharwad' },
      { key: 'ballari', target: 'Ballari' },
      { key: 'bellary', target: 'Ballari' },
      { key: 'kalaburagi', target: 'Kalaburagi' },
      { key: 'gulbarga', target: 'Kalaburagi' },
      { key: 'tumakuru', target: 'Tumakuru' },
      { key: 'tumkur', target: 'Tumakuru' },
      { key: 'shivamogga', target: 'Shivamogga' },
      { key: 'shimoga', target: 'Shivamogga' },
      { key: 'chikkamagaluru', target: 'Chikkamagaluru' },
      { key: 'chikmagalur', target: 'Chikkamagaluru' },
      { key: 'chamarajanagar', target: 'Chamarajanagar' },
      { key: 'chikkaballapura', target: 'Chikkaballapura' },
      { key: 'chitradurga', target: 'Chitradurga' },
      { key: 'davanagere', target: 'Davanagere' },
      { key: 'davangere', target: 'Davanagere' },
      { key: 'gadag', target: 'Gadag' },
      { key: 'hassan', target: 'Hassan' },
      { key: 'haveri', target: 'Haveri' },
      { key: 'kodagu', target: 'Kodagu' },
      { key: 'kolar', target: 'Kolar' },
      { key: 'koppal', target: 'Koppal' },
      { key: 'mandya', target: 'Mandya' },
      { key: 'raichur', target: 'Raichur' },
      { key: 'ramanagara', target: 'Ramanagara' },
      { key: 'udupi', target: 'Udupi' },
      { key: 'uttara kannada', target: 'Uttara Kannada' },
      { key: 'vijayapura', target: 'Vijayapura' },
      { key: 'bijapur', target: 'Vijayapura' },
      { key: 'vijayanagara', target: 'Vijayanagara' },
      { key: 'yadgir', target: 'Yadgir' },
      { key: 'kannada sahitya sammelana', target: 'Kannada Sahitya Sammelana' },
      { key: 'kasapa', target: 'KASP Master Directory' },
      { key: 'kasp', target: 'KASP Master Directory' }
    ];

    for (const kw of keywords) {
      if (clean.includes(kw.key)) return kw.target;
    }

    return null;
  };

  const handleDistrictAdded = (newDist) => {
    setAllDistricts(prev => {
      const exists = prev.some(d => d.id === newDist.id || d.name.toLowerCase() === newDist.name.toLowerCase());
      return exists ? prev : [newDist, ...prev];
    });
    setImportDistrict(newDist.name);
    setNewContact(prev => ({ ...prev, district: newDist.name }));
    setDetectedDistrictHint({ name: newDist.name, isNew: false });
  };

  const fetchDistricts = () => {
    fetch('/api/districts')
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) {
          setAllDistricts(d);
          if (!user?.district && d.length > 0 && !importDistrict) {
            setImportDistrict(d[0].name);
          }
        }
      })
      .catch(err => console.error(err));
  };

  // Fetch districts for dropdowns
  useEffect(() => {
    fetchDistricts();
  }, []);

  // Sync district filter when user or isMyContacts changes
  useEffect(() => {
    if (isMyContacts) {
      setDistrictFilter(user?.district || 'Bengaluru Urban');
      setImportDistrict(user?.district || 'Bengaluru Urban');
    } else if (user?.role === 'super_admin') {
      setDistrictFilter('All');
    }
    setPage(1);
  }, [isMyContacts, user?.district]);

  useEffect(() => {
    fetchContacts();
  }, [page, search, districtFilter, statusFilter, refreshTrigger, user?.district]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const currentDistrict = isMyContacts ? (user?.district || 'Bengaluru Urban') : districtFilter;
      const params = new URLSearchParams({
        page,
        limit: 12,
        search,
        district: currentDistrict,
        status: statusFilter
      });

      const res = await fetch(`/api/contacts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Parse Excel or CSV file
  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setIsParsing(true);
    setImportStatusMessage(null);

    // Auto-detect district from filename
    const detected = detectDistrictFromFileName(file.name, allDistricts);
    if (detected) {
      const existsInList = allDistricts.some(d => d.name.toLowerCase() === detected.toLowerCase());
      if (existsInList) {
        setImportDistrict(detected);
        setDetectedDistrictHint({ name: detected, isNew: false });
      } else {
        setDetectedDistrictHint({ name: detected, isNew: true });
      }
    } else {
      setDetectedDistrictHint(null);
    }

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      if (rawRows.length === 0) {
        setImportStatusMessage({ 
          type: 'error', 
          text: t('ಆಯ್ಕೆಮಾಡಿದ ಫೈಲ್ ಖಾಲಿಯಾಗಿದೆ (File is empty).', 'Selected file is empty.') 
        });
        setIsParsing(false);
        return;
      }

      // Detect header row or use index
      let headerRowIndex = -1;
      let nameCol = 0;
      let phoneCol = 1;
      let districtCol = -1;
      let statusCol = -1;
      let notesCol = -1;

      for (let i = 0; i < Math.min(5, rawRows.length); i++) {
        const row = rawRows[i].map(c => String(c).toLowerCase().trim());
        const nIdx = row.findIndex(c => c.includes('name') || c.includes('hesaru') || c.includes('ಹೆಸರು') || c.includes('citizen') || c.includes('person'));
        const pIdx = row.findIndex(c => c.includes('phone') || c.includes('mobile') || c.includes('contact') || c.includes('cell') || c.includes('ph') || c.includes('ಮೊಬೈಲ್') || c.includes('ದೂರವಾಣಿ'));
        if (nIdx !== -1 || pIdx !== -1) {
          headerRowIndex = i;
          if (nIdx !== -1) nameCol = nIdx;
          if (pIdx !== -1) phoneCol = pIdx;
          districtCol = row.findIndex(c => c.includes('district') || c.includes('zille') || c.includes('city') || c.includes('location') || c.includes('ಜಿಲ್ಲೆ'));
          statusCol = row.findIndex(c => c.includes('status') || c.includes('sentiment') || c.includes('feedback') || c.includes('response'));
          notesCol = row.findIndex(c => c.includes('note') || c.includes('remark') || c.includes('comment'));
          break;
        }
      }

      const startIndex = headerRowIndex !== -1 ? headerRowIndex + 1 : 0;
      const extracted = [];

      for (let i = startIndex; i < rawRows.length; i++) {
        const row = rawRows[i];
        if (!row || row.length === 0) continue;

        let name = String(row[nameCol] || '').trim();
        let phone = String(row[phoneCol] || '').trim();

        // If phone looks like text and name looks like digits, swap
        if (/\d{7,}/.test(name) && !/\d{7,}/.test(phone)) {
          const temp = name;
          name = phone;
          phone = temp;
        }

        if (!name && !phone) continue;

        const district = districtCol !== -1 ? String(row[districtCol] || '').trim() : '';
        const status = statusCol !== -1 ? String(row[statusCol] || '').trim() : '';
        const notes = notesCol !== -1 ? String(row[notesCol] || '').trim() : '';

        extracted.push({
          name: name || 'Citizen',
          phone,
          district: district || null,
          status: status || 'not_contacted',
          notes: notes || ''
        });
      }

      if (extracted.length === 0) {
        setImportStatusMessage({ 
          type: 'error', 
          text: t(
            'ಯಾವುದೇ ಮಾನ್ಯ ಸಂಪರ್ಕಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಫೈಲ್ ಹೆಸರು ಮತ್ತು ಫೋನ್ ಕಾಲಮ್ಗಳನ್ನು ಹೊಂದಿರಬೇಕು.',
            'No valid contacts found. File must have name and phone columns.'
          ) 
        });
      } else {
        setParsedContacts(extracted);
      }
    } catch (err) {
      console.error('Parse error:', err);
      setImportStatusMessage({ 
        type: 'error', 
        text: `${t('ಫೈಲ್ ಓದಲು ದೋಷ:', 'Error reading file:')} ${err.message}` 
      });
    } finally {
      setIsParsing(false);
    }
  };

  // Submit parsed contacts to API
  const handleConfirmImport = async () => {
    if (parsedContacts.length === 0) return;

    setIsUploading(true);
    setImportStatusMessage(null);

    try {
      const res = await fetch('/api/contacts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts: parsedContacts,
          defaultDistrict: importDistrict
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setImportStatusMessage({
          type: 'success',
          text: language === 'en'
            ? `Success! ${data.added} contacts imported successfully to database.`
            : `ಯಶಸ್ವಿಯಾಗಿದೆ! ${data.added} ಸಂಪರ್ಕಗಳನ್ನು ಡೇಟಾಬೇಸ್ಗೆ ಯಶಸ್ವಿಯಾಗಿ ಆಮದು ಮಾಡಲಾಗಿದೆ.`
        });
        setTimeout(() => {
          setShowImportModal(false);
          setImportFile(null);
          setParsedContacts([]);
          setImportStatusMessage(null);
          fetchContacts();
        }, 1200);
      } else {
        setImportStatusMessage({ type: 'error', text: data.error || t('ಆಮದು ವಿಫಲವಾಗಿದೆ', 'Import failed') });
      }
    } catch (err) {
      setImportStatusMessage({ type: 'error', text: `${t('ಅಪ್ಲೋಡ್ ದೋಷ:', 'Upload error:')} ${err.message}` });
    } finally {
      setIsUploading(false);
    }
  };

  // Download Sample CSV
  const handleDownloadTemplate = () => {
    const csvContent =
      'Name,Phone,District,Status,Notes\n' +
      'Suresh Patil,+91 9845012345,Bengaluru Urban,not_contacted,Ward 12 volunteer\n' +
      'Anand Kumar,+91 9845023456,Mysuru,agree,Interested in agriculture schemes\n' +
      'Kavitha Rao,+91 9845034567,Belagavi,neutral,Requested callback next week\n' +
      'Ramesh Naik,+91 9845045678,Mangaluru,disagree,Concerns regarding road works\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Connect_Karnataka_Contacts_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add Single Contact
  const handleAddContactSubmit = async (e) => {
    e.preventDefault();
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      alert(t('ಹೆಸರು ಮತ್ತು ಫೋನ್ ಸಂಖ್ಯೆ ಕಡ್ಡಾಯವಾಗಿದೆ.', 'Name and phone number are required.'));
      return;
    }

    setAddLoading(true);
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowAddModal(false);
        setNewContact({
          name: '',
          phone: '',
          district: user?.district || 'Bengaluru Urban',
          status: 'not_contacted',
          notes: ''
        });
        fetchContacts();
      } else {
        alert(t('ದೋಷ: ', 'Error: ') + (data.error || t('ಸಂಪರ್ಕ ಸೇರಿಸಲು ವಿಫಲವಾಗಿದೆ', 'Failed to add contact')));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setAddLoading(false);
    }
  };

  // Delete single contact
  const handleDeleteContact = async (id, name) => {
    const confirmMsg = language === 'en'
      ? `Are you sure you want to delete contact "${name}"?`
      : `"${name}" ಸಂಪರ್ಕವನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ?`;
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchContacts();
      } else {
        const err = await res.json();
        alert('Delete failed: ' + err.error);
      }
    } catch (err) {
      alert('Delete error: ' + err.message);
    }
  };

  // Clear all data
  const handleClearAllData = async () => {
    try {
      const res = await fetch('/api/contacts', { method: 'DELETE' });
      if (res.ok) {
        setShowClearModal(false);
        fetchContacts();
      }
    } catch (err) {
      alert('Error clearing data: ' + err.message);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'agree':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span>🟢</span> {t('ಒಪ್ಪಿಗೆ', 'Agree')}
          </span>
        );
      case 'neutral':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <span>🟡</span> {t('ತಟಸ್ಥ', 'Neutral')}
          </span>
        );
      case 'disagree':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <span>🔴</span> {t('ಅಸಮ್ಮತಿ', 'Disagree')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300">
            <span>⚪</span> {t('ಸಂಪರ್ಕಿಸಿಲ್ಲ', 'Not Contacted')}
          </span>
        );
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>
              {isMyContacts 
                ? `${t('ನನ್ನ ಸಂಪರ್ಕಗಳು', 'My Contacts')} — ${formatDistrictName(user?.district) || 'Bengaluru Urban'}` 
                : t('ನಾಗರಿಕ ಸಂಪರ್ಕ ನಿರ್ದೇಶಿಕೆ', 'Citizen Contact Directory')}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isMyContacts
              ? (language === 'en'
                  ? `Showing assigned contacts for ${user?.district || 'your'} district jurisdiction (${total} contacts listed)`
                  : `${formatDistrictName(user?.district) || 'ನಿಮ್ಮ'} ಜಿಲ್ಲಾ ವ್ಯಾಪ್ತಿಗೆ ನಿಯೋಜಿಸಿದ ಸಂಪರ್ಕಗಳನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ (${total} ಸಂಪರ್ಕಗಳು)`)
              : (language === 'en'
                  ? `Directory of citizen contacts across all 31 districts of Karnataka (${total} contacts listed)`
                  : `ಕರ್ನಾಟಕದ ಎಲ್ಲಾ 31 ಜಿಲ್ಲೆಗಳ ನಾಗರಿಕ ಸಂಪರ್ಕಗಳ ನಿರ್ದೇಶಿಕೆ (ಒಟ್ಟು: ${total} ಸಂಪರ್ಕಗಳು)`)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isMyContacts && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('ನಿಯೋಜಿತ:', 'Assigned:')} {formatDistrictName(user?.district) || (language === 'en' ? 'Bengaluru' : 'ಬೆಂಗಳೂರು')}</span>
            </div>
          )}

          {/* Add Single Contact */}
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>+ {t('ಸಂಪರ್ಕ ಸೇರಿಸಿ', 'Add Contact')}</span>
          </button>

          {/* Import CSV / Excel */}
          <button
            onClick={() => {
              setParsedContacts([]);
              setImportFile(null);
              setImportStatusMessage(null);
              setShowImportModal(true);
            }}
            className="p-2 bg-emerald-600 border border-emerald-600 rounded-xl hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>{t('CSV / Excel ಆಮದು ಮಾಡಿ', 'Import CSV / Excel')}</span>
          </button>

          {/* Refresh */}
          <button
            onClick={() => fetchContacts()}
            className="p-2 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            title={t('ರಿಫ್ರೆಶ್', 'Refresh')}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('ರಿಫ್ರೆಶ್', 'Refresh')}</span>
          </button>

          {/* Clear all (Super Admin) */}
          {user?.role === 'super_admin' && total > 0 && (
            <button
              onClick={() => setShowClearModal(true)}
              className="p-2 bg-white border border-rose-200 rounded-xl hover:bg-rose-50 text-rose-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title={t('ಡೇಟಾ ತೆರವುಗೊಳಿಸಿ', 'Clear all data')}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('ತೆರವುಗೊಳಿಸಿ', 'Clear All')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={
              language === 'en'
                ? `Search ${isMyContacts ? (user?.district || '') : ''} citizen name or phone...`
                : `${isMyContacts ? (formatDistrictName(user?.district) || '') : ''} ನಾಗರಿಕ ಹೆಸರು ಅಥವಾ ಫೋನ್ ಹುಡುಕಿ...`
            }
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        {/* District Filter (Super admin only) */}
        {!isMyContacts && user?.role === 'super_admin' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('ಜಿಲ್ಲೆ:', 'District:')}
            </span>
            <select
              value={districtFilter}
              onChange={(e) => {
                setDistrictFilter(e.target.value);
                setPage(1);
              }}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[200px]"
            >
              <option value="All">{t('ಎಲ್ಲಾ ಕರ್ನಾಟಕ (31 ಜಿಲ್ಲೆಗಳು)', 'All Karnataka (31 Districts)')}</option>
              {allDistricts.map((d) => (
                <option key={d.id} value={d.name}>
                  {formatDistrictName(d.name)} ({d.total_contacts?.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('ಸ್ಥಿತಿ:', 'Status:')}
          </span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">{t('ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು', 'All Statuses')}</option>
            <option value="agree">🟢 {t('ಒಪ್ಪಿಗೆ', 'Agree')}</option>
            <option value="neutral">🟡 {t('ತಟಸ್ಥ', 'Neutral')}</option>
            <option value="disagree">🔴 {t('ಅಸಮ್ಮತಿ', 'Disagree')}</option>
            <option value="not_contacted">⚪ {t('ಸಂಪರ್ಕಿಸಿಲ್ಲ', 'Not Contacted')}</option>
          </select>
        </div>
      </div>

      {/* Contacts Table or Clean Empty State */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {contacts.length === 0 ? (
          <div className="py-16 px-6 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {t('ಇನ್ನೂ ಯಾವುದೇ ಸಂಪರ್ಕಗಳಿಲ್ಲ (No Contacts Found)', 'No Contacts Found')}
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              {t(
                'ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಪ್ರಸ್ತುತ ಯಾವುದೇ ನಾಗರಿಕ ಸಂಪರ್ಕಗಳಿಲ್ಲ. ನಿಮ್ಮ ಮೂಲ CSV ಅಥವಾ Excel (.xlsx / .xls) ಫೈಲ್ ಅನ್ನು ಸುಲಭವಾಗಿ ಅಪ್ಲೋಡ್ ಮಾಡಿ ಪ್ರಾರಂಭಿಸಿ.',
                'Currently no citizen contacts in database. Easily upload your original CSV or Excel (.xlsx / .xls) file to get started.'
              )}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setParsedContacts([]);
                  setImportFile(null);
                  setImportStatusMessage(null);
                  setShowImportModal(true);
                }}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{t('CSV / Excel ಫೈಲ್ ಆಮದು ಮಾಡಿ', 'Import CSV / Excel File')}</span>
              </button>
              <button
                onClick={handleDownloadTemplate}
                className="py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>{t('ಮಾದರಿ CSV ಟೆಂಪ್ಲೇಟ್', 'Sample CSV Template')}</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
                    <th className="py-3.5 px-6">{t('ಹೆಸರು', 'Name')}</th>
                    <th className="py-3.5 px-4">{t('ಫೋನ್', 'Phone')}</th>
                    <th className="py-3.5 px-4">{t('ಜಿಲ್ಲೆ', 'District')}</th>
                    <th className="py-3.5 px-4">{t('ಸ್ಥಿತಿ', 'Status')}</th>
                    <th className="py-3.5 px-4">{t('ಕೊನೆಯ ಸಂಪರ್ಕ', 'Last Contacted')}</th>
                    <th className="py-3.5 px-6 text-right">{t('ಕ್ರಿಯೆಗಳು', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {contacts.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name */}
                      <td className="py-3.5 px-6 font-bold text-slate-900">
                        {c.name}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-800 font-semibold whitespace-nowrap">
                        {c.phone && c.phone.includes(',') ? (
                          <div className="flex flex-col gap-0.5">
                            {c.phone.split(',').map((num, i) => (
                              <span key={i} className={i === 0 ? 'text-slate-900 font-bold' : 'text-slate-500 text-[11px] font-normal'}>
                                {num.trim()}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span>{c.phone}</span>
                        )}
                      </td>

                      {/* District */}
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                        {formatDistrictName(c.district)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {renderStatusBadge(c.status)}
                      </td>

                      {/* Last Contacted */}
                      <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">
                        {c.last_contacted || '-'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Call Now */}
                          <button
                            onClick={() => onOpenCallModal(c)}
                            className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{t('ಕರೆ ಮಾಡಿ', 'Call')}</span>
                          </button>

                          {/* Profile */}
                          <button
                            onClick={() => onOpenDetailModal(c.id)}
                            className="py-1.5 px-3 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{t('ಪ್ರೊಫೈಲ್', 'Profile')}</span>
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteContact(c.id, c.name)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title={t('ಅಳಿಸಿ', 'Delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              <div>
                {language === 'en' ? (
                  <>Showing <strong className="text-slate-900">{contacts.length}</strong> of <strong className="text-slate-900">{total}</strong> contacts in <strong className="text-emerald-700">{formatDistrictName(activeDistrict)}</strong></>
                ) : (
                  <><strong className="text-emerald-700">{formatDistrictName(activeDistrict)}</strong> ರಲ್ಲಿ <strong className="text-slate-900">{contacts.length}</strong> ತೋರಿಸಲಾಗುತ್ತಿದೆ (ಒಟ್ಟು: <strong className="text-slate-900">{total}</strong>)</>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-semibold text-slate-700">
                  {t('ಪುಟ', 'Page')} {page} {t('ರಿಂದ', 'of')} {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ======================================================== */}
      {/* 1. UPLOAD / IMPORT MODAL (CSV, XLSX, XLS)                */}
      {/* ======================================================== */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {t('ಮೂಲ ಡೇಟಾ ಆಮದು ಮಾಡಿ', 'Import Original Contacts')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('CSV, Excel (.xlsx, .xls), ಅಥವಾ TSV ಫೈಲ್‌ಗಳನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ', 'Supports CSV, Excel (.xlsx, .xls), or TSV files')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* File Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl p-6 text-center cursor-pointer transition-all"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,.xlsx,.xls,.tsv,.txt"
                  className="hidden"
                  onChange={handleFileSelected}
                />
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-slate-800">
                  {importFile ? importFile.name : t('ಫೈಲ್ ಆಯ್ಕೆ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ ಇಲ್ಲಿ ಎಳೆಯಿರಿ', 'Click to select file or drag here')}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {t('ಬೆಂಬಲಿತ ಫಾರ್ಮ್ಯಾಟ್‌ಗಳು: .csv, .xlsx, .xls (ಹೆಸರು, ಫೋನ್, [ಜಿಲ್ಲೆ])', 'Supported formats: .csv, .xlsx, .xls (Name, Phone, [District])')}
                </div>
              </div>

              {/* District Fallback & Download Template */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {t('ಪೂರ್ವನಿಯೋಜಿತ ಜಿಲ್ಲೆ (Default District):', 'Default District:')}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setDistrictModalInitialName(detectedDistrictHint?.isNew ? detectedDistrictHint.name : '');
                        setShowAddDistrictModal(true);
                      }}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('ಹೊಸ ಜಿಲ್ಲೆ', 'Add District')}</span>
                    </button>
                  </div>
                  <select
                    value={importDistrict}
                    onChange={(e) => setImportDistrict(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {allDistricts.map((d) => (
                      <option key={d.id} value={d.name}>
                        {formatDistrictName(d.name, d.name_kn)}
                      </option>
                    ))}
                  </select>
                  {detectedDistrictHint && (
                    <div className={`mt-2 p-2.5 rounded-xl text-[11px] flex items-center justify-between ${
                      detectedDistrictHint.isNew ? 'bg-amber-50 border border-amber-200 text-amber-900' : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    }`}>
                      <div className="flex items-center gap-1.5 font-medium truncate mr-2">
                        <span>🎯</span>
                        <span className="truncate">
                          {detectedDistrictHint.isNew
                            ? `${t('ಹೊಸ ಜಿಲ್ಲೆ ಪತ್ತೆಯಾಗಿದೆ:', 'New district detected:')} "${detectedDistrictHint.name}"`
                            : `${t('ಫೈಲ್‌ನಿಂದ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಹೊಂದಿಸಲಾಗಿದೆ:', 'Auto-selected from file:')} "${formatDistrictName(detectedDistrictHint.name)}"`}
                        </span>
                      </div>
                      {detectedDistrictHint.isNew && (
                        <button
                          type="button"
                          onClick={() => {
                            setDistrictModalInitialName(detectedDistrictHint.name);
                            setShowAddDistrictModal(true);
                          }}
                          className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-[10px] cursor-pointer whitespace-nowrap"
                        >
                          {t('ಈಗ ಸೇರಿಸಿ', 'Add Now')}
                        </button>
                      )}
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1">
                    {t(
                      'ಫೈಲ್‌ನಲ್ಲಿ ಜಿಲ್ಲೆಯ ಕಾಲಮ್ ಇಲ್ಲದಿದ್ದರೆ ಈ ಜಿಲ್ಲೆಯನ್ನು ಅನ್ವಯಿಸಲಾಗುತ್ತದೆ',
                      'Applied if CSV/Excel row has no district column'
                    )}
                  </p>
                </div>

                <div className="flex flex-col justify-end">
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="py-2 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>{t('ಮಾದರಿ CSV ಟೆಂಪ್ಲೇಟ್ ಡೌನ್ಲೋಡ್', 'Download Sample CSV Template')}</span>
                  </button>
                  <p className="text-[11px] text-slate-400 mt-1 text-center">
                    {t('ಕಾಲಮ್‌ಗಳು: Name, Phone, District, Status, Notes', 'Columns: Name, Phone, District, Status, Notes')}
                  </p>
                </div>
              </div>

              {/* Status Message */}
              {importStatusMessage && (
                <div
                  className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${
                    importStatusMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {importStatusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  )}
                  <span>{importStatusMessage.text}</span>
                </div>
              )}

              {/* Parsing status */}
              {isParsing && (
                <div className="p-4 text-center text-xs text-slate-500 font-semibold flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>{t('ಫೈಲ್ ಪಾರ್ಸ್ ಮಾಡಲಾಗುತ್ತಿದೆ...', 'Parsing file...')}</span>
                </div>
              )}

              {/* Parsed Contacts Preview */}
              {parsedContacts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {t('ಪರಿಶೀಲಿಸಲಾದ ಸಂಪರ್ಕಗಳು:', 'Parsed Contacts:')} <strong className="text-emerald-700">{parsedContacts.length}</strong>
                    </span>
                    <span className="text-[11px] text-slate-400">{t('ಮೊದಲ 5 ಸಾಲುಗಳ ಪೂರ್ವವೀಕ್ಷಣೆ', 'Preview of first 5 rows')}</span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">{t('ಹೆಸರು', 'Name')}</th>
                          <th className="py-2 px-3">{t('ಫೋನ್', 'Phone')}</th>
                          <th className="py-2 px-3">{t('ಜಿಲ್ಲೆ', 'District')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedContacts.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="bg-white">
                            <td className="py-2 px-3 font-semibold text-slate-800">{row.name}</td>
                            <td className="py-2 px-3 font-mono text-slate-600">{row.phone}</td>
                            <td className="py-2 px-3 text-slate-600">{formatDistrictName(row.district) || `(${t('ಪೂರ್ವನಿಯೋಜಿತ:', 'Default:')} ${formatDistrictName(importDistrict)})`}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="py-2 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {t('ರದ್ದುಮಾಡಿ', 'Cancel')}
              </button>
              <button
                type="button"
                disabled={parsedContacts.length === 0 || isUploading}
                onClick={handleConfirmImport}
                className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('ಅಪ್ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...', 'Uploading...')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'en' ? `Confirm & Upload ${parsedContacts.length} Contacts` : `ಖಚಿತಪಡಿಸಿ & ${parsedContacts.length} ಸಂಪರ್ಕಗಳನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ`}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. ADD SINGLE CONTACT MODAL                              */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{t('ಹೊಸ ಸಂಪರ್ಕ ಸೇರಿಸಿ', 'Add New Contact')}</h3>
                  <p className="text-xs text-slate-500">{t('ನಾಗರಿಕ ಸಂಪರ್ಕ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ', 'Enter citizen contact details')}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddContactSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('ನಾಗರಿಕ ಹೆಸರು *', 'Citizen Name *')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'en' ? 'e.g. Suresh Gowda' : 'ಉದಾ. ಸುರೇಶ್ ಗೌಡ'}
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('ದೂರವಾಣಿ / ಮೊಬೈಲ್ ಸಂಖ್ಯೆ *', 'Phone / Mobile Number *')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 9845012345"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {t('ಜಿಲ್ಲೆ', 'District')}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setDistrictModalInitialName('');
                      setShowAddDistrictModal(true);
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('ಹೊಸ ಜಿಲ್ಲೆ', 'Add District')}</span>
                  </button>
                </div>
                <select
                  value={newContact.district}
                  onChange={(e) => setNewContact({ ...newContact, district: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {allDistricts.map((d) => (
                    <option key={d.id} value={d.name}>
                      {formatDistrictName(d.name, d.name_kn)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('ಆರಂಭಿಕ ಸ್ಥಿತಿ', 'Initial Status')}
                </label>
                <select
                  value={newContact.status}
                  onChange={(e) => setNewContact({ ...newContact, status: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="not_contacted">⚪ {t('ಸಂಪರ್ಕಿಸಿಲ್ಲ', 'Not Contacted')}</option>
                  <option value="agree">🟢 {t('ಒಪ್ಪಿಗೆ', 'Agree')}</option>
                  <option value="neutral">🟡 {t('ತಟಸ್ಥ', 'Neutral')}</option>
                  <option value="disagree">🔴 {t('ಅಸಮ್ಮತಿ', 'Disagree')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('ಟಿಪ್ಪಣಿಗಳು (Notes)', 'Notes')}
                </label>
                <textarea
                  rows={2}
                  placeholder={language === 'en' ? 'Context or local remarks...' : 'ವಿಷಯ ಅಥವಾ ಸ್ಥಳೀಯ ವಿವರಗಳು...'}
                  value={newContact.notes}
                  onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
                >
                  {t('ರದ್ದುಮಾಡಿ', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  {addLoading ? (
                    <span>{t('ಸೇರಿಸಲಾಗುತ್ತಿದೆ...', 'Saving...')}</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('ಸಂಪರ್ಕ ಉಳಿಸಿ', 'Save Contact')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. CLEAR ALL DATA CONFIRMATION MODAL                      */}
      {/* ======================================================== */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {t('ಎಲ್ಲಾ ಡೇಟಾ ತೆರವುಗೊಳಿಸಲು ಖಚಿತಪಡಿಸಿ', 'Confirm Clear All Data')}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t(
                'ಇದು ಎಲ್ಲಾ ಸಂಪರ್ಕಗಳು, ಕರೆ ದಾಖಲೆಗಳು, ಪ್ರಸಾರಗಳು ಮತ್ತು ಆಡಿಟ್ ಲಾಗ್‌ಗಳನ್ನು ಡೇಟಾಬೇಸ್‌ನಿಂದ ಶಾಶ್ವತವಾಗಿ ಅಳಿಸುತ್ತದೆ ಮತ್ತು ಕೌಂಟರ್‌ಗಳನ್ನು ಶೂನ್ಯಕ್ಕೆ (0) ಮರುಹೊಂದಿಸುತ್ತದೆ.',
                'This will permanently delete all contacts, call records, broadcasts, and audit logs from the database and reset all counters to zero.'
              )}
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="py-2 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {t('ರದ್ದುಮಾಡಿ', 'Cancel')}
              </button>
              <button
                onClick={handleClearAllData}
                className="py-2 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('ಹೌದು, ಎಲ್ಲಾ ಡೇಟಾ ಅಳಿಸಿ', 'Yes, Delete All Data')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD DISTRICT MODAL */}
      <AddDistrictModal
        isOpen={showAddDistrictModal}
        initialName={districtModalInitialName}
        onClose={() => setShowAddDistrictModal(false)}
        onSuccess={handleDistrictAdded}
      />
    </div>
  );
}
