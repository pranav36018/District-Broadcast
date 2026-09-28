import React, { useEffect, useState } from 'react';
import { Phone, Clock, Calendar, User, MapPin, X, FileText, CheckCircle, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function ContactDetailModal({ contactId, isOpen, onClose, onCallNow }) {
  const { t, language, formatDistrictName } = useLanguage();

  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && contactId) {
      fetchContactDetails(contactId);
    }
  }, [isOpen, contactId]);

  const fetchContactDetails = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/contacts/${id}`);
      if (res.ok) {
        const data = await res.json();
        setContact(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'agree':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span>🟢</span> {t('ಒಪ್ಪಿಗೆ', 'Agree')}
          </span>
        );
      case 'neutral':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <span>🟡</span> {t('ತಟಸ್ಥ', 'Neutral')}
          </span>
        );
      case 'disagree':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <span>🔴</span> {t('ಅಸಮ್ಮತಿ', 'Disagree')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <span>⚪</span> {t('ಸಂಪರ್ಕಿಸಿಲ್ಲ', 'Not Contacted')}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base tracking-tight">
              {t('ನಾಗರಿಕ ಸಂಪರ್ಕ ಪ್ರೊಫೈಲ್', 'Citizen Contact Profile')}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading || !contact ? (
          <div className="p-8 text-center text-slate-500">
            {t('ಸಂಪರ್ಕ ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...', 'Loading contact details...')}
          </div>
        ) : (
          <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
            
            {/* Profile Overview Card */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xl font-extrabold text-slate-900">{contact.name}</h4>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-slate-600">
                  <span className="font-mono font-medium">{contact.phone}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {formatDistrictName(contact.district)}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  {t('ನಿಯೋಜಿತ ಉಸ್ತುವಾರಿ:', 'Assigned In-Charge:')} <span className="font-semibold text-slate-800">Suresh Gowda</span>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-2">
                <div>{renderStatusBadge(contact.status)}</div>
                <button
                  onClick={() => {
                    onClose();
                    onCallNow(contact);
                  }}
                  className="mt-1 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t('ಈಗ ಕರೆ ಮಾಡಿ', 'Call Now')}</span>
                </button>
              </div>
            </div>

            {/* Notes */}
            {contact.notes && (
              <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200/80">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                  {t('ಇತ್ತೀಚಿನ ಸಂವಾದ ಟಿಪ್ಪಣಿ', 'Latest Interaction Note')}
                </span>
                <p className="text-sm text-slate-700 italic">“{contact.notes}”</p>
              </div>
            )}

            {/* Call History */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{t('ಕರೆ ಇತಿಹಾಸ', 'Call History')} ({contact.history?.length || 0})</span>
              </h5>

              {contact.history?.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-sm">
                  {t('ಈ ಸಂಪರ್ಕಕ್ಕೆ ಇನ್ನೂ ಯಾವುದೇ ಹಿಂದಿನ ಕರೆ ದಾಖಲೆಗಳಿಲ್ಲ.', 'No previous call logs recorded for this contact yet.')}
                </div>
              ) : (
                <div className="space-y-3">
                  {contact.history.map((call) => (
                    <div key={call.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-slate-300 transition-colors">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{call.date} {language === 'en' ? 'at' : 'ಸಮಯ'} {call.time}</span>
                          <span>•</span>
                          <span className="font-mono font-semibold text-slate-700">{t('ಅವಧಿ:', 'Duration:')} {call.duration}</span>
                        </div>
                        <div>{renderStatusBadge(call.response)}</div>
                      </div>
                      
                      <div className="text-xs text-slate-500 mb-1">
                        {t('ಕರೆ ಮಾಡಿದವರು:', 'Caller:')} <span className="font-semibold text-slate-700">{call.caller_name}</span> • {t('ಫಲಿತಾಂಶ:', 'Outcome:')} <span className="font-semibold text-slate-700">{t(call.outcome)}</span>
                      </div>

                      <div className="mt-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-800">
                        <span className="font-semibold text-slate-600">{t('ವಿವರಣೆ:', 'Notes:')} </span>
                        “{call.description}”
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
