import React, { useEffect, useState } from 'react';
import {
  Users,
  PhoneCall,
  Clock,
  UserCheck,
  TrendingUp,
  MapPin,
  ChevronRight,
  ArrowUpRight,
  Target,
  Sparkles,
  Phone,
  Radio
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Dashboard({ user, onNavigateToTab, onSelectDistrict }) {
  const { t, language, formatDistrictName } = useLanguage();
  const isSuperAdmin = user?.role === 'super_admin';
  const [stats, setStats] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [recentBroadcasts, setRecentBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const distParam = !isSuperAdmin && user?.district ? `?district=${encodeURIComponent(user.district)}` : '';
      const [statsRes, districtsRes, bcastRes] = await Promise.all([
        fetch(`/api/dashboard/stats${distParam}`),
        fetch('/api/districts'),
        fetch('/api/broadcasts')
      ]);
      const statsData = await statsRes.json();
      const districtsData = await districtsRes.json();
      const bcastData = await bcastRes.json();
      setStats(statsData);
      setDistricts(districtsData);
      if (Array.isArray(bcastData)) setRecentBroadcasts(bcastData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        {t('ಕನೆಕ್ಟ್ ಕರ್ನಾಟಕ ಕಮಾಂಡ್ ಸೆಂಟರ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ...', 'Connecting Karnataka Command Center loading...')}
      </div>
    );
  }

  const s = stats.superAdmin;
  const ic = stats.incharge;
  const userDistrictName = user?.district ? formatDistrictName(user.district) : (language === 'en' ? 'Bengaluru' : 'ಬೆಂಗಳೂರು');

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">

      {/* LATEST STATE BROADCAST NOTICE BANNER (VISIBLE TO BOTH ADMIN & DISTRICT IN-CHARGES) */}
      {recentBroadcasts && recentBroadcasts.length > 0 && (
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/40 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-white">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center flex-shrink-0 text-blue-400 mt-0.5">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  {t('ಸಕ್ರಿಯ ರಾಜ್ಯ ಪ್ರಸಾರ', 'Active State Broadcast')}
                </span>
                <span className="text-xs text-blue-300 font-semibold">
                  {t('ಪ್ರೇಕ್ಷಕರು:', 'Audience:')} {recentBroadcasts[0].audience} {recentBroadcasts[0].district && recentBroadcasts[0].district !== 'All' ? `(${recentBroadcasts[0].district})` : ''}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-400">
                  {recentBroadcasts[0].created_at}
                </span>
              </div>
              <h4 className="text-base font-bold text-white">
                {recentBroadcasts[0].title}
              </h4>
              <p className="text-slate-300 text-xs mt-0.5 line-clamp-1 max-w-2xl">
                “{recentBroadcasts[0].message}”
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 self-end md:self-center">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-emerald-400 font-mono">
                {recentBroadcasts[0].delivered} / {recentBroadcasts[0].recipients} {t('ಕಳುಹಿಸಲಾಗಿದೆ', 'Delivered')}
              </div>
              <div className="text-[10px] text-slate-400">
                {t('ಸ್ಥಿತಿ:', 'Status:')} {recentBroadcasts[0].status || 'Sent'} • {t('ಕರ್ನಾಟಕ ದೂರವಾಣಿ ಜಾಲ', 'Karnataka Telephony Mesh')}
              </div>
            </div>
            <button
              onClick={() => onNavigateToTab('broadcasts')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:shadow-blue-500/20"
            >
              <span>{t('ಪ್ರಸಾರದಲ್ಲಿ ವೀಕ್ಷಿಸಿ', 'View in Broadcasts')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* SUPER ADMIN VIEW */}
      {isSuperAdmin ? (
        <>
          {/* Top Headline Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-700/50">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold mb-2">
                <span>{t('ರಾಜ್ಯ ಕಾರ್ಯನಿರ್ವಾಹಕ ಮೇಲ್ವಿಚಾರಣೆ', 'State Executive Oversight')}</span>
                <span>•</span>
                <span>{t('ಎಲ್ಲಾ 31 ಜಿಲ್ಲೆಗಳು ಆನ್ಲೈನ್', 'All 31 Districts Online')}</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
                {t('ಕಸಾಪ ರಾಜ್ಯಾಧ್ಯಕ್ಷ ಚುನಾವಣೆ ಬದಲಾವಣೆಯ ಕಹಳೆ', 'State Election Campaign & Citizen Outreach')}
              </h1>
              <p className="text-slate-300 text-sm mt-1">
                {t(
                  'ರಾಜ್ಯ-ವ್ಯಾಪಿ ನೈಜ-ಸಮಯ ದೂರವಾಣಿ ಪ್ರಚಾರ, ಅಭಿಪ್ರಾಯ ಸಂಗ್ರಹ & ಪ್ರಸಾರ ಸಮನ್ವಯ.',
                  'State-wide real-time telephony outreach, sentiment collection & broadcast coordination.'
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigateToTab('broadcasts')}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-2"
              >
                <span>{t('ರಾಜ್ಯ ಪ್ರಸಾರ ರಚಿಸಿ', 'Create State Broadcast')}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 1. TOP CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Total Contacts */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                  {t('ಒಟ್ಟು ಸಂಪರ್ಕಗಳು', 'Total Contacts')}
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{s.totalContacts}</span>
                <span className="block text-xs font-medium text-emerald-600 mt-1">
                  {t('31 ಜಿಲ್ಲೆಗಳಲ್ಲಿ', 'Across 31 Districts')}
                </span>
              </div>
            </div>

            {/* Calls Completed */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                  {t('ಪೂರ್ಣಗೊಂಡ ಕರೆಗಳು', 'Calls Completed')}
                </span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <PhoneCall className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{s.callsCompleted}</span>
                <span className="block text-xs font-medium text-blue-600 mt-1">
                  {t('ನೇರ ನಾಗರಿಕ ಸಂಪರ್ಕಗಳು', 'Direct Citizen Outreach')}
                </span>
              </div>
            </div>

            {/* Pending */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                  {t('ಬಾಕಿ ಇದೆ', 'Pending')}
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{s.pending}</span>
                <span className="block text-xs font-medium text-amber-600 mt-1">
                  {t('ಕರೆ ಮಾಡುವವರ ಸರದಿಯಲ್ಲಿ', 'In Caller Queue')}
                </span>
              </div>
            </div>

            {/* Active Callers */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                  {t('ಸಕ್ರಿಯ ಕರೆ ಮಾಡುವವರು', 'Active Callers')}
                </span>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{s.activeCallers}</span>
                <span className="block text-xs font-medium text-purple-600 mt-1">
                  {t('ಆನ್ಲೈನ್ ದೂರವಾಣಿ ಸಿಬ್ಬಂದಿ', 'Online Telephony Staff')}
                </span>
              </div>
            </div>

          </div>

          {/* 2. RESPONSE DISTRIBUTION (TRAFFIC LIGHT VISUALIZATION) & CALLING PROGRESS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Traffic Light Sentiment Box */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    {t('ಪ್ರತಿಕ್ರಿಯೆ ವಿತರಣೆ', 'Response Sentiment Distribution')}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {t('ಪೂರ್ಣಗೊಂಡ ಕರೆಗಳಿಂದ ಸಂಗ್ರಹಿಸಿದ ನಾಗರಿಕ ಪ್ರತಿಕ್ರಿಯೆ', 'Aggregated citizen feedback from completed calls')}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {t('ಟ್ರಾಫಿಕ್ ಲೈಟ್ ಮಾಪನ', 'Traffic Light Metric')}
                </span>
              </div>

              {/* Three Traffic Light Columns */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                
                {/* 🟢 Agree */}
                <div className="bg-emerald-50/80 rounded-2xl p-5 border border-emerald-200 flex flex-col items-center text-center relative overflow-hidden group">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-3 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">🟢</span>
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                    {t('ಒಪ್ಪಿಗೆ', 'Agree')}
                  </span>
                  <span className="text-3xl font-black text-emerald-700 mt-1 tracking-tight">
                    {s.responseDistribution.agree.percent}%
                  </span>
                  <span className="text-xs text-emerald-600 font-semibold mt-0.5">
                    {s.responseDistribution.agree.count} {t('ಸಂಪರ್ಕಗಳು', 'contacts')}
                  </span>
                  <div className="w-full bg-emerald-200 h-2 rounded-full mt-4 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${s.responseDistribution.agree.percent}%` }}></div>
                  </div>
                </div>

                {/* 🟡 Neutral */}
                <div className="bg-amber-50/80 rounded-2xl p-5 border border-amber-200 flex flex-col items-center text-center relative overflow-hidden group">
                  <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 mb-3 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">🟡</span>
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
                    {t('ತಟಸ್ಥ', 'Neutral')}
                  </span>
                  <span className="text-3xl font-black text-amber-700 mt-1 tracking-tight">
                    {s.responseDistribution.neutral.percent}%
                  </span>
                  <span className="text-xs text-amber-600 font-semibold mt-0.5">
                    {s.responseDistribution.neutral.count} {t('ಸಂಪರ್ಕಗಳು', 'contacts')}
                  </span>
                  <div className="w-full bg-amber-200 h-2 rounded-full mt-4 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${s.responseDistribution.neutral.percent}%` }}></div>
                  </div>
                </div>

                {/* 🔴 Disagree */}
                <div className="bg-rose-50/80 rounded-2xl p-5 border border-rose-200 flex flex-col items-center text-center relative overflow-hidden group">
                  <div className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 mb-3 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">🔴</span>
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-rose-800">
                    {t('ಅಸಮ್ಮತಿ', 'Disagree')}
                  </span>
                  <span className="text-3xl font-black text-rose-700 mt-1 tracking-tight">
                    {s.responseDistribution.disagree.percent}%
                  </span>
                  <span className="text-xs text-rose-600 font-semibold mt-0.5">
                    {s.responseDistribution.disagree.count} {t('ಸಂಪರ್ಕಗಳು', 'contacts')}
                  </span>
                  <div className="w-full bg-rose-200 h-2 rounded-full mt-4 overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: `${s.responseDistribution.disagree.percent}%` }}></div>
                  </div>
                </div>

              </div>
            </div>

            {/* Calling Progress Box */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-bold text-slate-900">{t('ಕರೆ ಪ್ರಗತಿ', 'Calling Progress')}</h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {t('ರಾಜ್ಯ ಗುರಿ', 'State Target')}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{t('ಸಂಪರ್ಕಗಳ ಸಮಗ್ರ ಕರೆ ಪ್ರಗತಿ', 'Overall Contact Outreach Progress')}</p>

                <div className="mt-8 text-center">
                  <span className="text-5xl font-black text-slate-900 tracking-tight">
                    {s.callingProgress}%
                  </span>
                  <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                    {t('ರಾಜ್ಯಾದ್ಯಂತ ಪೂರ್ಣಗೊಂಡಿದೆ', 'Statewide Completion')}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-4 rounded-full mt-6 p-1 border border-slate-200">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${s.callingProgress}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{t('ಒಟ್ಟು:', 'Total:')} <strong className="text-slate-800">{s.totalContacts}</strong></span>
                <span>{t('ಬಾಕಿ:', 'Pending:')} <strong className="text-slate-800">{s.pending}</strong></span>
              </div>
            </div>

          </div>

          {/* 3. DISTRICT OVERVIEW TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  {t('ಜಿಲ್ಲಾ ಅವಲೋಕನ', 'District Overview')}
                </h2>
                <p className="text-xs text-slate-500">
                  {t('ಕರ್ನಾಟಕ ಜಿಲ್ಲಾವಾರು ಸಂವಹನ ಮಾಪನ ಮತ್ತು ಅಭಿಪ್ರಾಯ', 'Karnataka District-wise Communication Metrics & Sentiment')}
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('districts')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                <span>{t('ಎಲ್ಲಾ 31 ಜಿಲ್ಲೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ', 'View All 31 Districts')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
                    <th className="py-3.5 px-6">{t('ಜಿಲ್ಲೆ', 'District')}</th>
                    <th className="py-3.5 px-4 text-right">{t('ಸಂಪರ್ಕಗಳು', 'Contacts')}</th>
                    <th className="py-3.5 px-4 text-right">{t('ಕರೆ ಮಾಡಿದ', 'Called')}</th>
                    <th className="py-3.5 px-4 text-right">{t('ಬಾಕಿ', 'Pending')}</th>
                    <th className="py-3.5 px-4 text-center">🟢 {t('ಒಪ್ಪಿಗೆ', 'Agree')}</th>
                    <th className="py-3.5 px-4 text-center">🟡 {t('ತಟಸ್ಥ', 'Neutral')}</th>
                    <th className="py-3.5 px-4 text-center">🔴 {t('ಅಸಮ್ಮತಿ', 'Disagree')}</th>
                    <th className="py-3.5 px-4 text-center">{t('ಕ್ರಿಯೆ', 'Action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                  {districts.slice(0, 9).map((d) => (
                    <tr
                      key={d.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => onSelectDistrict(d.name)}
                    >
                      <td className="py-3.5 px-6 font-semibold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{formatDistrictName(d.name)}</span>
                        {d.name === 'Bengaluru' && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                            {t('ವೈಶಿಷ್ಟ್ಯ', 'Featured')}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">{d.total_contacts.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-bold">{d.called.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-500">{d.pending.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-xs font-semibold">
                          {d.agree.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-mono text-xs font-semibold">
                          {d.neutral.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-mono text-xs font-semibold">
                          {d.disagree.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDistrict(d.name);
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-emerald-600 hover:text-white hover:bg-emerald-600 rounded-lg border border-emerald-600/30 transition-all cursor-pointer"
                        >
                          {t('ಪರಿಶೀಲಿಸಿ', 'Inspect')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* DISTRICT IN-CHARGE VIEW */
        <>
          {/* Top In-charge Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-emerald-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-700/50">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold mb-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>{t('ನಿಯೋಜಿತ ವ್ಯಾಪ್ತಿ:', 'Assigned Jurisdiction:')} {userDistrictName}</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
                {userDistrictName} {t('ಜಿಲ್ಲಾ ಕಮಾಂಡ್', 'District Command')}
              </h1>
              <p className="text-slate-300 text-sm mt-1">
                {t('ಜಿಲ್ಲಾ ಉಸ್ತುವಾರಿ:', 'District In-Charge:')} <strong className="text-white">{user?.name}</strong> • {t('ಇಂದಿನ ಪ್ರಚಾರ ಗುರಿಗಳು ಮತ್ತು ಲೈವ್ ಡಯಲರ್', 'Today’s outreach targets & live dialer')}
              </p>
            </div>

            <button
              onClick={() => onNavigateToTab('my-contacts')}
              className="py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>{t('ನನ್ನ ಸಂಪರ್ಕಗಳಿಗೆ ಕರೆ ಮಾಡಲು ಪ್ರಾರಂಭಿಸಿ', 'Start Calling My Contacts')}</span>
            </button>
          </div>

          {/* In-charge Top Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* My Contacts */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                {t('ನನ್ನ ಸಂಪರ್ಕಗಳು', 'My Contacts')}
              </span>
              <div className="mt-2">
                <span className="text-2xl font-black text-slate-900">{ic.myContacts}</span>
                <span className="block text-[11px] font-medium text-slate-500 mt-0.5">
                  {t('ನಿಯೋಜಿತ ಜಿಲ್ಲೆ', 'Assigned District')}
                </span>
              </div>
            </div>

            {/* Completed */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                {t('ಪೂರ್ಣಗೊಂಡಿದೆ', 'Completed')}
              </span>
              <div className="mt-2">
                <span className="text-2xl font-black text-emerald-700">{ic.completed}</span>
                <span className="block text-[11px] font-medium text-emerald-600 mt-0.5">
                  {t('ದಾಖಲಿಸಿದ ಕರೆಗಳು', 'Logged Calls')}
                </span>
              </div>
            </div>

            {/* Pending */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                {t('ಬಾಕಿ ಇದೆ', 'Pending')}
              </span>
              <div className="mt-2">
                <span className="text-2xl font-black text-amber-700">{ic.pending}</span>
                <span className="block text-[11px] font-medium text-amber-600 mt-0.5">
                  {t('ಉಳಿದ ಸರದಿ', 'Remaining Queue')}
                </span>
              </div>
            </div>

            {/* Calls Today */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                {t('ಇಂದಿನ ಕರೆಗಳು', 'Calls Today')}
              </span>
              <div className="mt-2">
                <span className="text-2xl font-black text-blue-700">{ic.callsToday}</span>
                <span className="block text-[11px] font-medium text-blue-600 mt-0.5">
                  {t('ಇಂದು ಪೂರ್ಣಗೊಂಡಿದೆ', 'Completed Today')}
                </span>
              </div>
            </div>

            {/* Today's Target */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                {t('ಇಂದಿನ ಗುರಿ', 'Today\'s Target')}
              </span>
              <div className="mt-2">
                <span className="text-2xl font-black text-purple-700">{ic.todayTarget}</span>
                <span className="block text-[11px] font-medium text-purple-600 mt-0.5">
                  {t('ದೈನಂದಿನ ಗುರಿ', 'Daily Quota')}
                </span>
              </div>
            </div>

          </div>

          {/* Today's Target Progress Indicator */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  <span>
                    {t('ದೈನಂದಿನ ಕರೆ ಗುರಿ ಪ್ರಗತಿ', 'Daily Call Target Progress')} ({ic.callsToday} / {ic.todayTarget})
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('ಇಂದು ಪರಿಶೀಲಿಸಿದ ನಾಗರಿಕ ಸಂವಾದಗಳನ್ನು ತಲುಪಿ', 'Reach verified citizen interactions today in')} {userDistrictName}
                </p>
              </div>
              <span className="text-sm font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {ic.todayProgress}% {t('ಪೂರ್ಣಗೊಂಡಿದೆ', 'Completed')}
              </span>
            </div>

            <div className="w-full bg-slate-100 h-4 rounded-full p-0.5 border border-slate-200 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${ic.todayProgress}%` }}
              ></div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>
                {t('ಇಂದು ಉಳಿದಿದೆ:', 'Remaining Today:')} <strong className="text-slate-800">{Math.max(0, ic.todayTarget - ic.callsToday)} {t('ಕರೆಗಳು', 'calls')}</strong>
              </span>
              <button
                onClick={() => onNavigateToTab('my-contacts')}
                className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                <span>{t('ಮುಂದಿನ ಸಂಪರ್ಕ ತೆರೆಯಿರಿ', 'Open Next Contact')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* District Sentiment Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {userDistrictName} {t('ಅಭಿಪ್ರಾಯ', 'Sentiment')}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              {t('ನಿಮ್ಮ ನಿಯೋಜಿತ ಜಿಲ್ಲೆಯ ಸಂಪರ್ಕಗಳ ಪ್ರತಿಕ್ರಿಯೆ ವಿಭಜನೆ', 'Feedback breakdown of contacts in your assigned district')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-2xl">🟢</span>
                <span className="block text-xs font-extrabold uppercase tracking-wider text-emerald-800 mt-2">
                  {t('ಒಪ್ಪಿಗೆ', 'Agree')}
                </span>
                <span className="text-2xl font-black text-emerald-700 mt-1 block font-mono">{ic.responseBreakdown.agree}</span>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-2xl">🟡</span>
                <span className="block text-xs font-extrabold uppercase tracking-wider text-amber-800 mt-2">
                  {t('ತಟಸ್ಥ', 'Neutral')}
                </span>
                <span className="text-2xl font-black text-amber-700 mt-1 block font-mono">{ic.responseBreakdown.neutral}</span>
              </div>
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center">
                <span className="text-2xl">🔴</span>
                <span className="block text-xs font-extrabold uppercase tracking-wider text-rose-800 mt-2">
                  {t('ಅಸಮ್ಮತಿ', 'Disagree')}
                </span>
                <span className="text-2xl font-black text-rose-700 mt-1 block font-mono">{ic.responseBreakdown.disagree}</span>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
