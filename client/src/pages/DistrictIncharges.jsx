import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Mail, MapPin, CheckCircle2, Phone, TrendingUp, Users, ArrowUpRight, Plus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import AddDistrictModal from '../components/AddDistrictModal.jsx';

export default function DistrictIncharges({ onSelectDistrict }) {
  const { t, language, formatDistrictName } = useLanguage();

  const [districts, setDistricts] = useState([]);
  const [search, setSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showAddDistrict, setShowAddDistrict] = useState(false);

  // Administrative Divisions of Karnataka
  const divisions = {
    'Bengaluru Division': ['Bengaluru', 'Ramanagara', 'Kolar', 'Chikkaballapura', 'Tumakuru', 'Shivamogga', 'Chitradurga', 'Davanagere'],
    'Mysuru Division': ['Mysuru', 'Mandya', 'Hassan', 'Chamarajanagar', 'Kodagu', 'Chikkamagaluru', 'Udupi', 'Mangaluru', 'Dakshina Kannada'],
    'Belagavi Division': ['Belagavi', 'Vijayapura', 'Bagalkote', 'Hubballi-Dharwad', 'Dharwad', 'Gadag', 'Haveri', 'Uttara Kannada'],
    'Kalaburagi Division': ['Kalaburagi', 'Bidar', 'Raichur', 'Koppal', 'Ballari', 'Vijayanagara', 'Yadgir']
  };

  const getDivision = (dist) => {
    if (dist.division && dist.division !== 'Karnataka General') return dist.division;
    for (const [div, list] of Object.entries(divisions)) {
      if (list.includes(dist.name)) return div;
    }
    return dist.division || 'Special Directory';
  };

  const fetchDistricts = () => {
    fetch('/api/districts')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setDistricts(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDistricts();
  }, []);

  const enrichedIncharges = districts.map(d => {
    const slug = d.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const email = d.incharge_email || (d.name === 'Bengaluru' ? 'bengaluru@connectkarnataka.demo' : `${slug}@connectkarnataka.demo`);
    const division = getDivision(d);
    const progress = Math.round((d.called / (d.total_contacts || 1)) * 100);

    return {
      ...d,
      email,
      division,
      progress
    };
  });

  const filtered = enrichedIncharges.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      formatDistrictName(item.name).toLowerCase().includes(search.toLowerCase()) ||
      (item.incharge_name && item.incharge_name.toLowerCase().includes(search.toLowerCase())) ||
      item.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesDivision = divisionFilter === 'All' || item.division === divisionFilter;

    return matchesSearch && matchesDivision;
  });

  const formatDivisionName = (div) => {
    if (div === 'Bengaluru Division') return t('ಬೆಂಗಳೂರು ವಿಭಾಗ', 'Bengaluru Division');
    if (div === 'Mysuru Division') return t('ಮೈಸೂರು ವಿಭಾಗ', 'Mysuru Division');
    if (div === 'Belagavi Division') return t('ಬೆಳಗಾವಿ ವಿಭಾಗ', 'Belagavi Division');
    if (div === 'Kalaburagi Division') return t('ಕಲಬುರಗಿ ವಿಭಾಗ', 'Kalaburagi Division');
    return div;
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-6 rounded-3xl text-white shadow-xl border border-slate-700/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>{t('ರಾಜ್ಯ ನಿರ್ದೇಶನಾಲಯ', 'State Directorate')}</span>
            <span>•</span>
            <span>{t('ಎಲ್ಲಾ 31 ಆಡಳಿತ ಜಿಲ್ಲೆಗಳು', 'All 31 Administrative Districts')}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            {t('ಕರ್ನಾಟಕ ಜಿಲ್ಲಾ ಉಸ್ತುವಾರಿ ನಿರ್ದೇಶನಾಲಯ', 'Karnataka District In-Charge Directorate')}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            {t(
              'ನೆಲ-ಮಟ್ಟದ ಕರೆ, ನಾಗರಿಕ ಪ್ರಚಾರ ಮತ್ತು ಟೆಲಿಮೆಟ್ರಿ ನಿರ್ವಹಿಸುವ ನಿಯೋಜಿತ ಜಿಲ್ಲಾ ಸಮನ್ವಯಕರ ಸಂಪೂರ್ಣ ಪಟ್ಟಿ.',
              'Complete directory of assigned district coordinators managing ground-level calling, citizen outreach and telemetry.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowAddDistrict(true)}
            className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>{t('ಹೊಸ ಜಿಲ್ಲೆ / ಉಸ್ತುವಾರಿ ಸೇರಿಸಿ', 'Add District & In-Charge')}</span>
          </button>
          <div className="text-right pl-4 border-l border-slate-700/60">
            <span className="text-2xl font-black text-emerald-400 font-mono">{districts.length} / {districts.length}</span>
            <span className="block text-[11px] text-slate-300 uppercase tracking-wider font-semibold">
              {t('ಉಸ್ತುವಾರಿಗಳು ಆನ್ಲೈನ್', 'In-Charges Online')}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={t(
              'ಜಿಲ್ಲೆ (ಉದಾ. ಮೈಸೂರು, ಬೆಳಗಾವಿ) ಅಥವಾ ಸಮನ್ವಯಕ ಹೆಸರು ಹುಡುಕಿ...',
              'Search district (e.g. Mysuru, Belagavi) or coordinator name...'
            )}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        {/* Division Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
          {['All', 'Bengaluru Division', 'Mysuru Division', 'Belagavi Division', 'Kalaburagi Division', 'Special Directory'].map((div) => {
            const displayMapKn = {
              'All': `ಎಲ್ಲಾ (${districts.length})`,
              'Bengaluru Division': 'ಬೆಂಗಳೂರು',
              'Mysuru Division': 'ಮೈಸೂರು',
              'Belagavi Division': 'ಬೆಳಗಾವಿ',
              'Kalaburagi Division': 'ಕಲಬುರಗಿ',
              'Special Directory': 'ವಿಶೇಷ ನಿರ್ದೇಶಿಕೆ'
            };
            const displayMapEn = {
              'All': `All (${districts.length})`,
              'Bengaluru Division': 'Bengaluru',
              'Mysuru Division': 'Mysuru',
              'Belagavi Division': 'Belagavi',
              'Kalaburagi Division': 'Kalaburagi',
              'Special Directory': 'Special'
            };
            return (
              <button
                key={div}
                onClick={() => setDivisionFilter(div)}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  divisionFilter === div
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {language === 'en' ? displayMapEn[div] : displayMapKn[div]}
              </button>
            );
          })}
        </div>
      </div>

      {/* In-Charge Roster Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {t('ನಿಯೋಜಿತ ಜಿಲ್ಲಾ ಉಸ್ತುವಾರಿ ನಿರ್ದೇಶಿಕೆ', 'Assigned District In-Charge Directory')} ({filtered.length} {t('ಸಮನ್ವಯಕರು', 'Coordinators')})
            </h2>
            <p className="text-xs text-slate-500">
              {t(
                'ವ್ಯಾಪ್ತಿ ಕರೆ ಕೋಟಾ ಮತ್ತು ಮಾಪನ ಸಹಿತ ಅಧಿಕೃತ ಕ್ಷೇತ್ರ ಸಂಪರ್ಕಗಳು',
                'Official field points of contact with jurisdiction calling quotas and metrics'
              )}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] uppercase font-bold tracking-wider">
                <th className="py-3.5 px-6">{t('ಜಿಲ್ಲೆ & ವಿಭಾಗ', 'District & Division')}</th>
                <th className="py-3.5 px-4">{t('ನಿಯೋಜಿತ ಉಸ್ತುವಾರಿ', 'Assigned In-Charge')}</th>
                <th className="py-3.5 px-4">{t('ಪೋರ್ಟಲ್ ಇಮೇಲ್', 'Portal Email')}</th>
                <th className="py-3.5 px-4 text-right">{t('ವ್ಯಾಪ್ತಿ ಸಂಪರ್ಕಗಳು', 'Contacts')}</th>
                <th className="py-3.5 px-4 text-right">{t('ಪೂರ್ಣಗೊಂಡ ಕರೆಗಳು', 'Completed')}</th>
                <th className="py-3.5 px-4 text-center">{t('ಪ್ರಗತಿ', 'Progress')}</th>
                <th className="py-3.5 px-4 text-center">{t('ಅಭಿಪ್ರಾಯ', 'Sentiment')}</th>
                <th className="py-3.5 px-6 text-center">{t('ಸ್ಥಿತಿ', 'Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-blue-50/40 transition-colors"
                >
                  <td className="py-3.5 px-6">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span>{formatDistrictName(item.name)}</span>
                      {item.name === 'Bengaluru' && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          {t('ರಾಜಧಾನಿ', 'Capital')}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium pl-5">
                      {formatDivisionName(item.division)}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                        {item.incharge_name ? item.incharge_name.charAt(0) : 'D'}
                      </div>
                      <div>
                        <div>{item.incharge_name || t('ಜಿಲ್ಲಾ ಸಮನ್ವಯಕ', 'District Coordinator')}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {t('ಕ್ಷೇತ್ರ ಆಜ್ಞಾ ಅಧಿಕಾರಿ', 'Field Command Officer')}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-xs text-blue-700">
                    {item.email}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                    {item.total_contacts?.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-bold">
                    {item.called?.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1 font-mono text-xs font-bold text-slate-700">
                      <span>{item.progress}%</span>
                    </div>
                    <div className="w-16 bg-slate-200 h-1.5 rounded-full mx-auto mt-1 overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${item.progress}%` }}></div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1 text-[11px] font-mono">
                      <span className="text-emerald-700 font-bold" title="Agree">{item.agree}</span>
                      <span className="text-slate-300">/</span>
                      <span className="text-amber-700" title="Neutral">{item.neutral}</span>
                      <span className="text-slate-300">/</span>
                      <span className="text-rose-700" title="Disagree">{item.disagree}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-6 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{t('ಸಕ್ರಿಯ', 'Active')}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD DISTRICT MODAL */}
      <AddDistrictModal
        isOpen={showAddDistrict}
        onClose={() => setShowAddDistrict(false)}
        onSuccess={() => fetchDistricts()}
      />

    </div>
  );
}
