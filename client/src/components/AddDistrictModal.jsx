import React, { useState } from 'react';
import { MapPin, Plus, X, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, Building2, User, Mail, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function AddDistrictModal({ isOpen, onClose, onSuccess, initialName = '' }) {
  const { t, language } = useLanguage();

  const [name, setName] = useState(initialName || '');
  const [nameKn, setNameKn] = useState('');
  const [division, setDivision] = useState('Bengaluru Division');
  const [inchargeName, setInchargeName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  // Preset suggestions based on directories
  const presets = [
    { en: 'Dakshina Kannada', kn: 'ದಕ್ಷಿಣ ಕನ್ನಡ', div: 'Mysuru Division' },
    { en: 'Bengaluru', kn: 'ಬೆಂಗಳೂರು', div: 'Bengaluru Division' },
    { en: 'Dharwad', kn: 'ಧಾರವಾಡ', div: 'Belagavi Division' },
    { en: 'Kannada Sahitya Sammelana', kn: 'ಕನ್ನಡ ಸಾಹಿತ್ಯ ಸಮ್ಮೇಳನ', div: 'Special Directory' },
    { en: 'KASP Master Directory', kn: 'ಕಸಾಪ ಮಾಸ್ಟರ್ ನಿರ್ದೇಶಿಕೆ', div: 'Special Directory' },
  ];

  const handleApplyPreset = (preset) => {
    setName(preset.en);
    setNameKn(preset.kn);
    setDivision(preset.div);
    const slug = preset.en.toLowerCase().replace(/[^a-z0-9]/g, '');
    setEmail(`${slug}@connectkarnataka.demo`);
    setInchargeName(`${preset.en} Coordinator`);
    setError(null);
  };

  const handleNameChange = (val) => {
    setName(val);
    if (!email || email.endsWith('@connectkarnataka.demo')) {
      const slug = val.toLowerCase().replace(/[^a-z0-9]/g, '');
      setEmail(slug ? `${slug}@connectkarnataka.demo` : '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('ದಯವಿಟ್ಟು ಜಿಲ್ಲೆಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.', 'Please enter the district name.'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/districts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          name_kn: nameKn.trim(),
          division: division.trim(),
          incharge_name: inchargeName.trim() || `${name.trim()} Coordinator`,
          email: email.trim(),
          phone: phone.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t('ಜಿಲ್ಲೆ ಸೇರಿಸಲು ವಿಫಲವಾಗಿದೆ.', 'Failed to create district.'));
      }

      if (onSuccess) {
        onSuccess(data.district);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t('ಹೊಸ ಜಿಲ್ಲೆ ಸೇರಿಸಿ', 'Add New District')}
              </h3>
              <p className="text-xs text-slate-500">
                {t(
                  'ಡೇಟಾ ಅಪ್ಲೋಡ್ ಮಾಡಲು ಹೊಸ ಜಿಲ್ಲೆ ಅಥವಾ ವಿಶೇಷ ನಿರ್ದೇಶಿಕೆಯನ್ನು ರಚಿಸಿ',
                  'Register a new district or special directory to upload data'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          
          {/* Quick presets pills */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('ಸಾಮಾನ್ಯ ಆಯ್ಕೆಗಳು (ತ್ವರಿತ ಆಯ್ಕೆ):', 'Quick Presets / Suggestions:')}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p) => (
                <button
                  type="button"
                  key={p.en}
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 font-medium text-slate-700 transition-colors cursor-pointer"
                >
                  {language === 'kn' ? p.kn : p.en}
                </button>
              ))}
            </div>
          </div>

          {/* District Name (English / Primary) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {t('ಜಿಲ್ಲೆಯ ಹೆಸರು (ಇಂಗ್ಲಿಷ್ / ಮುಖ್ಯ ಹೆಸರು) *', 'District Name (English / Primary) *')}
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                placeholder={language === 'en' ? 'e.g. Dakshina Kannada, Bengaluru 1' : 'ಉದಾ. ದಕ್ಷಿಣ ಕನ್ನಡ, ಬೆಂಗಳೂರು 1'}
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Kannada Name (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {t('ಕನ್ನಡದಲ್ಲಿ ಹೆಸರು (ಐಚ್ಛಿಕ)', 'District Name in Kannada (Optional)')}
            </label>
            <input
              type="text"
              placeholder="ಉದಾ. ದಕ್ಷಿಣ ಕನ್ನಡ, ಬೆಂಗಳೂರು ೧"
              value={nameKn}
              onChange={(e) => setNameKn(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Administrative Division */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {t('ಆಡಳಿತ ವಿಭಾಗ / ವರ್ಗ', 'Administrative Division / Category')}
            </label>
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Bengaluru Division">{t('ಬೆಂಗಳೂರು ವಿಭಾಗ', 'Bengaluru Division')}</option>
              <option value="Mysuru Division">{t('ಮೈಸೂರು ವಿಭಾಗ', 'Mysuru Division')}</option>
              <option value="Belagavi Division">{t('ಬೆಳಗಾವಿ ವಿಭಾಗ', 'Belagavi Division')}</option>
              <option value="Kalaburagi Division">{t('ಕಲಬುರಗಿ ವಿಭಾಗ', 'Kalaburagi Division')}</option>
              <option value="Special Directory">{t('ವಿಶೇಷ ನಿರ್ದೇಶಿಕೆ / ಸಂಸ್ಥೆ (Special Directory)', 'Special Directory / Organization')}</option>
              <option value="Other">{t('ಇತರೆ (Other)', 'Other')}</option>
            </select>
          </div>

          {/* Coordinator / In-Charge Name */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              {t('ಉಸ್ತುವಾರಿ ಮಾಹಿತಿ (ಐಚ್ಛಿಕ)', 'In-Charge Information (Optional)')}
            </span>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t('ನಿಯೋಜಿತ ಸಮನ್ವಯಕರ ಹೆಸರು', 'Coordinator / In-Charge Name')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder={language === 'en' ? 'e.g. Ramesh Poojary or Leave default' : 'ಉದಾ. ರಮೇಶ್ ಪೂಜಾರಿ'}
                    value={inchargeName}
                    onChange={(e) => setInchargeName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {t('ಪೋರ್ಟಲ್ ಇಮೇಲ್', 'Portal Email')}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      placeholder="incharge@connectkarnataka.demo"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {t('ದೂರವಾಣಿ ಸಂಖ್ಯೆ', 'Phone Number')}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="+91 98450 12345"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {t('ರದ್ದುಮಾಡಿ', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{t('ಉಳಿಸಲಾಗುತ್ತಿದೆ...', 'Saving...')}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{t('ಉಳಿಸಿ & ಜಿಲ್ಲೆ ಸೇರಿಸಿ', 'Save & Create District')}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
