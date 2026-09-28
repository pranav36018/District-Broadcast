import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Clock, User, CheckCircle2, AlertCircle, X, Check, Volume2, Mic } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function CallModal({ contact, isOpen, onClose, onCallSaved, callerUser }) {
  const { t, language, formatDistrictName } = useLanguage();

  const [callState, setCallState] = useState('calling'); // 'calling' | 'completed'
  const [seconds, setSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  // Form fields for Call Completed phase
  const [outcome, setOutcome] = useState('Connected');
  const [response, setResponse] = useState('agree'); // 'agree' | 'neutral' | 'disagree'
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const outcomesList = [
    { id: 'Connected', labelKn: 'ಸಂಪರ್ಕಿತ', labelEn: 'Connected' },
    { id: 'No Answer', labelKn: 'ಉತ್ತರವಿಲ್ಲ', labelEn: 'No Answer' },
    { id: 'Busy', labelKn: 'ಕಾರ್ಯನಿರತ', labelEn: 'Busy' },
    { id: 'Failed', labelKn: 'ವಿಫಲ', labelEn: 'Failed' },
    { id: 'Call Back Later', labelKn: 'ನಂತರ ಕರೆ ಮಾಡಿ', labelEn: 'Call Back Later' }
  ];

  const playRingtone = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.frequency.setValueAtTime(440, ctx.currentTime);
      osc2.frequency.setValueAtTime(480, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 1.2);
      osc2.stop(ctx.currentTime + 1.2);
    } catch (e) {}
  };

  // Reset state when a contact is selected or modal opens
  useEffect(() => {
    if (isOpen && contact) {
      setCallState('calling');
      setSeconds(0);
      setTimerActive(true);
      setOutcome('Connected');
      setResponse('agree');
      setDescription('');
      playRingtone();
    }
  }, [isOpen, contact]);

  // Live timer tick
  useEffect(() => {
    let interval = null;
    if (isOpen && callState === 'calling' && timerActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, callState, timerActive]);

  if (!isOpen || !contact) return null;

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setTimerActive(false);
    // If ended too fast, give at least a realistic demo duration like 00:12
    if (seconds < 3) {
      setSeconds(12);
    }
    setCallState('completed');
  };

  const handleSaveCallRecord = async () => {
    setIsSubmitting(true);
    const finalDuration = formatTimer(seconds);

    try {
      const res = await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id: contact.id,
          duration: finalDuration,
          outcome,
          response,
          description: description || (language === 'en' ? 'Citizen conversation successfully logged.' : 'ಸಂಪರ್ಕ ಸಂಭಾಷಣೆ ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಿಸಲಾಗಿದೆ.'),
          caller_name: callerUser?.name || 'Suresh Gowda',
          caller_id: callerUser?.id || 2
        })
      });

      if (!res.ok) throw new Error(t('ಕರೆ ದಾಖಲೆ ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ', 'Failed to save call record'));
      const data = await res.json();

      if (response === 'agree') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      }

      onCallSaved(data);
      onClose();
    } catch (err) {
      console.error(err);
      alert(t('ಕರೆ ದಾಖಲೆ ಉಳಿಸುವಲ್ಲಿ ದೋಷ: ', 'Error saving call record: ') + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 transition-all transform scale-100">
        
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
              {callState === 'calling' 
                ? t('ಲೈವ್ ಟೆಲಿಫೋನಿ ಸೆಷನ್', 'Live Telephony Session') 
                : t('ಕರೆ ಸಾರಾಂಶ & ಪ್ರತಿಕ್ರಿಯೆ', 'Call Summary & Feedback')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PHASE 1: CALLING SCREEN */}
        {callState === 'calling' && (
          <div className="p-8 text-center bg-gradient-to-b from-slate-900 to-slate-950 text-white">
            
            {/* Calling Pulse Indicator */}
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="w-28 h-28 rounded-full bg-emerald-500/20 animate-ping absolute"></div>
              <div className="w-24 h-24 rounded-full bg-emerald-500/30 flex items-center justify-center relative">
                <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                  <Phone className="w-8 h-8 text-white animate-bounce" />
                </div>
              </div>
            </div>

            <div className="inline-block px-3 py-1 bg-emerald-950/80 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-semibold mb-3">
              📞 {t('ಕರೆ ಮಾಡಲಾಗುತ್ತಿದೆ', 'Calling...')}
            </div>

            <h3 className="text-2xl font-extrabold text-white tracking-tight">{contact.name}</h3>
            <p className="text-base text-slate-300 font-mono tracking-widest mt-1">{contact.phone}</p>
            <p className="text-xs text-slate-400 mt-1">{formatDistrictName(contact.district)} • {t('ಕರ್ನಾಟಕ', 'Karnataka')}</p>

            {/* Timer Display */}
            <div className="mt-6 mb-8 py-3 px-6 bg-slate-800/80 rounded-xl inline-flex items-center gap-3 border border-slate-700/60 shadow-inner">
              <Clock className="w-5 h-5 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="font-mono text-3xl font-bold tracking-wider text-emerald-400">
                {formatTimer(seconds)}
              </span>
            </div>

            {/* Waveform graphic */}
            <div className="flex items-center justify-center gap-1.5 h-8 mb-8">
              {[40, 70, 90, 60, 100, 45, 80, 50, 95, 60, 85, 30].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-emerald-400 rounded-full animate-pulse"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: '0.8s'
                  }}
                ></span>
              ))}
            </div>

            {/* End Call Button */}
            <div>
              <button
                onClick={handleEndCall}
                className="w-full max-w-xs mx-auto py-3.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-rose-600/40 transition-all cursor-pointer"
              >
                <PhoneOff className="w-5 h-5" />
                <span>{t('ಕರೆ ಮುಗಿಸಿ', 'End Call')}</span>
              </button>
            </div>
          </div>
        )}

        {/* PHASE 2: CALL COMPLETED & RESPONSE CAPTURE */}
        {callState === 'completed' && (
          <div className="p-6 bg-slate-50 max-h-[85vh] overflow-y-auto">
            
            {/* Header info */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h4 className="text-lg font-bold text-slate-900">{contact.name}</h4>
                <p className="text-xs text-slate-500 font-mono">{contact.phone} • {formatDistrictName(contact.district)}</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                  {t('ಕರೆ ಅವಧಿ', 'Duration')}
                </span>
                <span className="font-mono text-base font-bold text-slate-800">{formatTimer(seconds)}</span>
              </div>
            </div>

            {/* Section 1: Call Outcome */}
            <div className="mt-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                {t('ಕರೆ ಫಲಿತಾಂಶ', 'Call Outcome')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {outcomesList.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setOutcome(item.id)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      outcome === item.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {language === 'en' ? item.labelEn : item.labelKn}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: TRAFFIC LIGHT RESPONSE SELECTOR */}
            <div className="mt-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                {t('ಪ್ರತಿಕ್ರಿಯೆ ವರ್ಗೀಕರಣ (ಟ್ರಾಫಿಕ್ ಲೈಟ್)', 'Response Categorization (Traffic Light)')}
              </label>
              <p className="text-xs text-slate-500 mb-3">
                {t(
                  'ಜಿಲ್ಲಾ ಪ್ರಚಾರ ಉಪಕ್ರಮದ ಬಗ್ಗೆ ನಾಗರಿಕರ ನಿಲುವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ:',
                  'Select the citizen\'s stance regarding the campaign initiative:'
                )}
              </p>

              <div className="grid grid-cols-3 gap-3">
                {/* 🟢 AGREE */}
                <button
                  type="button"
                  onClick={() => setResponse('agree')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    response === 'agree'
                      ? 'bg-emerald-50 border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <span className="text-xl">🟢</span>
                  </div>
                  <span className={`text-xs font-extrabold tracking-wider uppercase ${
                    response === 'agree' ? 'text-emerald-800' : 'text-slate-700'
                  }`}>
                    {t('ಒಪ್ಪಿಗೆ', 'Agree')}
                  </span>
                  {response === 'agree' && (
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> {t('ಆಯ್ಕೆಯಾಗಿದೆ', 'Selected')}
                    </span>
                  )}
                </button>

                {/* 🟡 NEUTRAL */}
                <button
                  type="button"
                  onClick={() => setResponse('neutral')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    response === 'neutral'
                      ? 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-500/20'
                      : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/30'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <span className="text-xl">🟡</span>
                  </div>
                  <span className={`text-xs font-extrabold tracking-wider uppercase ${
                    response === 'neutral' ? 'text-amber-800' : 'text-slate-700'
                  }`}>
                    {t('ತಟಸ್ಥ', 'Neutral')}
                  </span>
                  {response === 'neutral' && (
                    <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> {t('ಆಯ್ಕೆಯಾಗಿದೆ', 'Selected')}
                    </span>
                  )}
                </button>

                {/* 🔴 DISAGREE */}
                <button
                  type="button"
                  onClick={() => setResponse('disagree')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    response === 'disagree'
                      ? 'bg-rose-50 border-rose-600 shadow-md ring-2 ring-rose-500/20'
                      : 'bg-white border-slate-200 hover:border-rose-300 hover:bg-rose-50/30'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30">
                    <span className="text-xl">🔴</span>
                  </div>
                  <span className={`text-xs font-extrabold tracking-wider uppercase ${
                    response === 'disagree' ? 'text-rose-800' : 'text-slate-700'
                  }`}>
                    {t('ಅಸಮ್ಮತಿ', 'Disagree')}
                  </span>
                  {response === 'disagree' && (
                    <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> {t('ಆಯ್ಕೆಯಾಗಿದೆ', 'Selected')}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Section 3: Conversation Description */}
            <div className="mt-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                {t('ವಿವರಣೆ / ಸಂಭಾಷಣೆ ಟಿಪ್ಪಣಿಗಳು', 'Description / Conversation Notes')}
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={language === 'en' 
                  ? "Enter conversation details (e.g. contact agreed to campaign proposal)..."
                  : "ಸಂಭಾಷಣೆಯ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ (ಉದಾ. ಸಂಪರ್ಕವು ಪ್ರಸ್ತಾಪಕ್ಕೆ ಒಪ್ಪಿಗೆ ನೀಡಿದರು)..."}
                className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 resize-none shadow-inner"
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
              >
                {t('ರದ್ದು ಮಾಡಿ', 'Cancel')}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSaveCallRecord}
                className="flex-2 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isSubmitting 
                    ? t('ಉಳಿಸಲಾಗುತ್ತಿದೆ...', 'Saving...') 
                    : t('ಕರೆ ದಾಖಲೆ ಉಳಿಸಿ', 'Save Call Record')}
                </span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
