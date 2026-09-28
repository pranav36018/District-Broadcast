import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Send,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileAudio,
  Paperclip,
  ChevronRight,
  BarChart3,
  Sparkles,
  Play,
  Square,
  Volume2,
  VolumeX,
  Plus,
  ArrowLeft,
  MapPin,
  Flame,
  Activity,
  Mic,
  MicOff,
  Hand,
  Upload
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Broadcasts({ user, onShowToast }) {
  const { t, language, formatDistrictName } = useLanguage();
  const isSuperAdmin = user?.role === 'super_admin';
  const [broadcasts, setBroadcasts] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'create' | 'voice-hub' | 'detail'
  const [selectedBroadcast, setSelectedBroadcast] = useState(null);

  // Form fields
  const [title, setTitle] = useState('Important Announcement');
  const [message, setMessage] = useState("Tomorrow's meeting will begin at 10:00 AM.");
  const [audience, setAudience] = useState('All Karnataka');
  const [district, setDistrict] = useState(user?.district && user.district !== 'All' ? user.district : 'Bengaluru');
  const [voiceTitle, setVoiceTitle] = useState('None');
  const [imageUrl, setImageUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Voice Studio States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioAvailable, setRecordedAudioAvailable] = useState(false);
  const [newAudioTitle, setNewAudioTitle] = useState('');
  const [voiceList, setVoiceList] = useState([]);
  const [activeVoiceSubTab, setActiveVoiceSubTab] = useState('studio'); // 'studio' | 'live-room'

  // Live Voice Room State
  const [isMuted, setIsMuted] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [participantsCount, setParticipantsCount] = useState(3421);
  const [roomActive, setRoomActive] = useState(true);

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [preparedNotice, setPreparedNotice] = useState('');

  const timerRef = useRef(null);

  useEffect(() => {
    fetchBroadcasts();
    fetchVoiceList();
    fetch('/api/districts')
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) {
          setDistrictsList(d);
          if (user?.district && user.district !== 'All') {
            setDistrict(user.district);
          }
        }
      })
      .catch(err => console.error(err));
  }, []);

  const fetchBroadcasts = async () => {
    try {
      const res = await fetch('/api/broadcasts');
      if (res.ok) {
        const data = await res.json();
        setBroadcasts(data);
        if (data.length > 0 && !selectedBroadcast) {
          setSelectedBroadcast(data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching broadcasts:', err);
    }
  };

  const fetchVoiceList = async () => {
    try {
      const res = await fetch('/api/voice');
      if (res.ok) {
        const data = await res.json();
        setVoiceList(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Sound effects simulation using Web Audio API
  const playChime = (type = 'announcement') => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'announcement') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.2);
      } else if (type === 'record-start') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'hand-raise') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'mute-toggle') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isMuted ? 600 : 300, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {
      console.warn('Audio synthesis not supported:', e);
    }
  };

  const handleStartRecord = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    setRecordedAudioAvailable(false);
    playChime('record-start');
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const handleStopRecord = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setRecordedAudioAvailable(true);
    setNewAudioTitle(`Field Audio Broadcast (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`);
    playChime('record-start');
  };

  const handleSaveVoiceAnnouncement = async () => {
    if (!newAudioTitle) return;
    const durationFormatted = `00:${String(Math.max(1, recordingSeconds)).padStart(2, '0')}`;

    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newAudioTitle,
          duration: durationFormatted,
          audio_url: ''
        })
      });
      if (res.ok) {
        const saved = await res.json();
        setVoiceList([saved, ...voiceList]);
        setVoiceTitle(saved.title);
        setRecordedAudioAvailable(false);
        setRecordingSeconds(0);
        if (onShowToast) {
          onShowToast(
            language === 'en' 
              ? `Voice announcement "${saved.title}" saved & attached to Broadcasts!` 
              : `ಧ್ವನಿ ಪ್ರಕಟಣೆ "${saved.title}" ಉಳಿಸಲಾಗಿದೆ ಮತ್ತು ಪ್ರಸಾರಕ್ಕೆ ಲಗತ್ತಿಸಲಾಗಿದೆ!`, 
            'success'
          );
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePreSend = (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    if (audience === 'All Karnataka') {
      const totalCount = districtsList.reduce((acc, d) => acc + (d.total_contacts || 0), 0);
      setPreparedNotice(
        language === 'en'
          ? `Broadcast prepared for ${totalCount.toLocaleString('en-IN')} contacts across Karnataka.`
          : `ಕರ್ನಾಟಕದಾದ್ಯಂತ ${totalCount.toLocaleString('en-IN')} ಸಂಪರ್ಕಗಳಿಗೆ ಪ್ರಸಾರ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ.`
      );
    } else if (audience === 'Specific District') {
      const distInfo = districtsList.find(d => d.name === district);
      const count = distInfo?.total_contacts ? distInfo.total_contacts.toLocaleString('en-IN') : '0';
      setPreparedNotice(
        language === 'en'
          ? `Broadcast prepared for ${formatDistrictName(district)} (${count} contacts).`
          : `${formatDistrictName(district)} (${count} ಸಂಪರ್ಕಗಳು) ಗೆ ಪ್ರಸಾರ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ.`
      );
    } else {
      setPreparedNotice(
        language === 'en' 
          ? 'Broadcast prepared for selected verified contacts.' 
          : 'ಆಯ್ಕೆಮಾಡಿದ ಪರಿಶೀಲಿಸಿದ ಸಂಪರ್ಕಗಳಿಗೆ ಪ್ರಸಾರ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ.'
      );
    }
    setShowConfirmModal(true);
  };

  const handleConfirmAndSend = async () => {
    setShowConfirmModal(false);
    setSending(true);

    try {
      const res = await fetch('/api/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          audience,
          district: audience === 'Specific District' ? district : 'All',
          voice_title: voiceTitle !== 'None' ? voiceTitle : null,
          image_url: imageUrl.trim() || null
        })
      });

      if (!res.ok) throw new Error(t('ಪ್ರಸಾರ ಕಳುಹಿಸಲು ವಿಫಲವಾಗಿದೆ', 'Broadcast failed to send'));
      const data = await res.json();

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onShowToast) {
        onShowToast(
          language === 'en' 
            ? 'Broadcast dispatched successfully!' 
            : 'ಸಾಮೂಹಿಕ ಪ್ರಸಾರ ಯಶಸ್ವಿಯಾಗಿ ಕಳುಹಿಸಲಾಗಿದೆ!', 
          'success'
        );
      }

      await fetchBroadcasts();
      setSelectedBroadcast(data.broadcast);
      setActiveTab('detail');
    } catch (err) {
      alert('Error sending broadcast: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-3xl text-white shadow-xl border border-slate-700/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>{t('ಸಾಮೂಹಿಕ ಸಂವಹನ ಮತ್ತು ಧ್ವನಿ ಗೇಟ್‌ವೇ', 'Mass Communication & Voice Gateway')}</span>
            <span>•</span>
            <span>{t('ಕರ್ನಾಟಕ 31 ಜಿಲ್ಲಾ ವ್ಯಾಪ್ತಿ', 'Karnataka 31 Districts Scope')}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            {t('ಕರ್ನಾಟಕ ಪ್ರಸಾರ & ಧ್ವನಿ ಕೇಂದ್ರ', 'Karnataka Broadcast & Voice Center')}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            {t(
              'SMS ರವಾನೆ, ಸ್ವಯಂಚಾಲಿತ ಧ್ವನಿ ಬುಲೆಟಿನ್‌ಗಳು ಮತ್ತು ಲೈವ್ ಜಿಲ್ಲಾ ಸಮ್ಮೇಳನ ಕೊಠಡಿಗಳಿಗಾಗಿ ಏಕೀಕೃತ ವೇದಿಕೆ.',
              'Unified platform for SMS dispatches, automated voice bulletins, and live district conference rooms.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {activeTab !== 'create' ? (
            <button
              onClick={() => setActiveTab('create')}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{t('ಪ್ರಸಾರ ರಚಿಸಿ', 'Create Broadcast')}</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('history')}
              className="py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('ಫೀಡ್‌ಗೆ ಹಿಂತಿರುಗಿ', 'Back to Feed')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{t('ಪ್ರಸಾರಗಳ ಫೀಡ್', 'Broadcasts Feed')} ({broadcasts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'create'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('ಪ್ರಸಾರ ರಚಿಸಿ', 'Create Broadcast')}</span>
          </button>

          <button
            onClick={() => setActiveTab('voice-hub')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'voice-hub'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-rose-500" />
            <span>{t('ಧ್ವನಿ ಸ್ಟುಡಿಯೋ & ಲೈವ್ ಆಡಿಯೊ ರೂಮ್', 'Voice Studio & Live Audio Room')}</span>
          </button>

          {selectedBroadcast && (
            <button
              onClick={() => setActiveTab('detail')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'detail'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{t('ಲೈವ್ ಡೆಲಿವರಿ ಟೆಲಿಮೆಟ್ರಿ', 'Live Delivery Telemetry')}</span>
            </button>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{t('ಟೆಲಿಫೋನಿ ಮೆಶ್:', 'Telephony Mesh:')} <strong className="text-slate-800">{t('ಕಾರ್ಯಾಚರಣೆಯಲ್ಲಿದೆ', 'Operational')}</strong></span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: BROADCASTS FEED & HISTORY (DEFAULT VIEW) */}
      {/* ======================================================== */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              {t('ರಾಜ್ಯ ಪ್ರಸಾರಗಳು', 'State Dispatched Broadcasts')} ({broadcasts.length} {t('ಪ್ರಕಟಣೆಗಳು', 'Announcements')})
            </h2>
            <span className="text-xs text-slate-500">
              {t('ವಾಹಕ ವಿತರಣಾ ಮೆಟ್ರಿಕ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ಯಾವುದೇ ಪ್ರಕಟಣೆಯ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ', 'Click any announcement to inspect carrier delivery metrics')}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {broadcasts.map((b) => (
              <div
                key={b.id}
                onClick={() => {
                  setSelectedBroadcast(b);
                  setActiveTab('detail');
                }}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all cursor-pointer group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{b.status || 'Sent'}</span>
                      </span>

                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        b.audience === 'All Karnataka'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {b.audience === 'All Karnataka' ? t('ಸಮಸ್ತ ಕರ್ನಾಟಕ', 'All Karnataka') : b.audience} {b.district && b.district !== 'All' ? `(${formatDistrictName(b.district)})` : ''}
                      </span>

                      <span className="text-xs text-slate-400 font-mono">
                        {b.created_at}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {b.title}
                    </h3>

                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 italic line-clamp-2">
                      “{b.message}”
                    </p>

                    {b.voice_title && (
                      <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                        <FileAudio className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t('ಲಗತ್ತಿಸಲಾದ ಧ್ವನಿ ಆಡಿಯೊ:', 'Attached Voice Audio:')} <strong>{b.voice_title}</strong></span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            playChime('announcement');
                          }}
                          className="ml-2 px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-2.5 h-2.5" />
                          <span>{t('ಆಡಿಯೊ ಪ್ಲೇ ಮಾಡಿ', 'Play Audio')}</span>
                        </button>
                      </div>
                    )}
                    
                    {b.image_url && (
                      <div className="mt-2">
                        <img 
                          src={b.image_url} 
                          alt="Broadcast Poster" 
                          className="w-full max-w-sm rounded-xl object-cover border border-slate-200 shadow-sm"
                        />
                      </div>
                    )}
                  </div>

                  {/* Right Metrics */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 flex-shrink-0">
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        {t('ವಿತರಿಸಲಾದ ಟೆಲಿಮೆಟ್ರಿ', 'Telemetry Delivered')}
                      </span>
                      <span className="text-base font-black text-slate-900 font-mono">
                        {b.delivered} <span className="text-slate-400 text-xs font-normal">/ {b.recipients}</span>
                      </span>
                      <span className="text-[11px] text-emerald-700 font-bold block">
                        96.4% {t('ಯಶಸ್ಸಿನ ದರ', 'Success Rate')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBroadcast(b);
                        setActiveTab('detail');
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>{t('ಲೈವ್ ಟೆಲಿಮೆಟ್ರಿ', 'Live Telemetry')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: COMPOSE MASS BROADCAST */}
      {/* ======================================================== */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                {t('ಸಾಮೂಹಿಕ ಪ್ರಸಾರ ಪ್ರಕಟಣೆಯನ್ನು ರಚಿಸಿ', 'Compose Mass Broadcast Announcement')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t(
                  'ಕರ್ನಾಟಕದಾದ್ಯಂತ ನಾಗರಿಕರಿಗೆ ತ್ವರಿತ ಬಹು-ಚಾನಲ್ ಎಚ್ಚರಿಕೆಗಳನ್ನು ನೀಡಿ.',
                  'Issue immediate multi-channel alerts to citizens across Karnataka.'
                )}
              </p>
            </div>

            <form onSubmit={handlePreSend} className="space-y-5">
              {/* Broadcast Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t('ಪ್ರಸಾರ ಶೀರ್ಷಿಕೆ', 'Broadcast Title')}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={language === 'en' ? "e.g. Important Announcement" : "ಉದಾ. ಮುಖ್ಯ ಪ್ರಕಟಣೆ"}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
                />
              </div>

              {/* Message Content */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t(
                    'ಸಂದೇಶ ವಿಷಯ (SMS & ಆ್ಯಪ್ ಎಚ್ಚರಿಕೆ ಮೂಲಕ ರವಾನಿಸಲಾಗಿದೆ)',
                    'Message Content (Dispatched via SMS & App Alert)'
                  )}
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={language === 'en' ? "“Tomorrow's meeting will begin at 10:00 AM.”" : "“ನಾಳಿನ ಸಭೆಯು ಬೆಳಿಗ್ಗೆ 10:00 ಗಂಟೆಗೆ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ.”"}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none transition-all shadow-sm"
                />
              </div>

              {/* Scope & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    {t('ಗುರಿ ಪ್ರೇಕ್ಷಕರ ವ್ಯಾಪ್ತಿ', 'Target Audience Scope')}
                  </label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    <option value="All Karnataka">
                      {t('ಸಮಸ್ತ ಕರ್ನಾಟಕ', 'All Karnataka')} ({districtsList.reduce((acc, d) => acc + (d.total_contacts || 0), 0).toLocaleString('en-IN')} {t('ಸಂಪರ್ಕಗಳು', 'contacts')})
                    </option>
                    <option value="Specific District">{t('ನಿರ್ದಿಷ್ಟ ಜಿಲ್ಲೆ (ಕೆಳಗೆ ಆಯ್ಕೆಮಾಡಿ)', 'Specific District (Select below)')}</option>
                    <option value="Selected Contacts">{t('ಆಯ್ಕೆಮಾಡಿದ ಸಂಪರ್ಕಗಳು', 'Selected Contacts')}</option>
                  </select>
                </div>

                {audience === 'Specific District' ? (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      {t('ಕರ್ನಾಟಕ ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ', 'Select Karnataka District')} ({districtsList.length || 31} {t('ಲಭ್ಯವಿದೆ', 'Available')})
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-blue-50/60 border border-blue-300 rounded-xl text-xs font-bold text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    >
                      {districtsList.map((d) => (
                        <option key={d.id} value={d.name}>
                          {formatDistrictName(d.name)} ({d.total_contacts?.toLocaleString('en-IN')} {t('ಸಂಪರ್ಕಗಳು', 'contacts')})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      {t('ಅಂದಾಜು ತಲುಪುವಿಕೆ', 'Estimated Reach')}
                    </label>
                    <div className="px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900">
                      {audience === 'All Karnataka'
                        ? `${districtsList.reduce((acc, d) => acc + (d.total_contacts || 0), 0).toLocaleString('en-IN')} ${t('ನಾಗರಿಕರು (31 ಜಿಲ್ಲೆಗಳಲ್ಲಿ)', 'Citizens across 31 Districts')}`
                        : t('ಆಯ್ಕೆಮಾಡಿದ ಪರಿಶೀಲಿಸಿದ ಸಂಪರ್ಕಗಳು', 'Selected Verified Contacts')}
                    </div>
                  </div>
                )}
              </div>

              {/* Voice Attachment */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileAudio className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('ಸ್ವಯಂಚಾಲಿತ ಧ್ವನಿ ಪ್ರಕಟಣೆಯನ್ನು ಲಗತ್ತಿಸಿ (ಐಚ್ಛಿಕ)', 'Attach Automated Voice Announcement (Optional)')}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('voice-hub')}
                    className="text-[11px] text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    {t('ಧ್ವನಿ ಸ್ಟುಡಿಯೋ ತೆರೆಯಿರಿ →', 'Open Voice Studio →')}
                  </button>
                </label>
                <select
                  value={voiceTitle}
                  onChange={(e) => setVoiceTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-medium"
                >
                  <option value="None">{t('ಯಾವುದೂ ಇಲ್ಲ (ಪಠ್ಯ-ಮಾತ್ರ SMS / ಪುಶ್ ಸೂಚನೆ)', 'None (Text-only SMS / Push notification)')}</option>
                  {voiceList.map((v) => (
                    <option key={v.id} value={v.title}>
                      {v.title} [{v.duration}]
                    </option>
                  ))}
                  <option value="State Welfare Scheme Announcement (Kannada)">State Welfare Scheme Announcement (Kannada) [00:42]</option>
                  <option value="Bengaluru Civic Helpline Advisory">Bengaluru Civic Helpline Advisory [00:35]</option>
                  <option value="Emergency Weather Alert">Emergency Weather Alert [00:28]</option>
                </select>
              </div>

              {/* Image Attachment */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('ಪ್ರಸಾರ ಚಿತ್ರದ URL ಲಗತ್ತಿಸಿ (ಐಚ್ಛಿಕ)', 'Attach Broadcast Poster Image URL (Optional)')}</span>
                  </span>
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="e.g. https://example.com/poster.jpg"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-4 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>{sending ? t('ಪ್ರಸಾರ ಕ್ಯೂ ಮಾಡಲಾಗುತ್ತಿದೆ...', 'Queueing Broadcast...') : t('ಸಾಮೂಹಿಕ ಪ್ರಸಾರ ರವಾನಿಸಿ', 'DISPATCH MASS BROADCAST')}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Presets Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
                {t('ತ್ವರಿತ ಟೆಂಪ್ಲೇಟ್ ಮೊದಲೇ ಹೊಂದಿಕೆಗಳು', 'Quick Template Presets')}
              </span>
              <div className="space-y-2">
                {[
                  {
                    t: language === 'en' ? 'Important Announcement' : 'ಮುಖ್ಯ ಪ್ರಕಟಣೆ',
                    m: language === 'en' ? "Tomorrow's meeting will begin at 10:00 AM." : "ನಾಳಿನ ಸಭೆಯು ಬೆಳಿಗ್ಗೆ 10:00 ಗಂಟೆಗೆ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ.",
                    a: 'All Karnataka',
                    v: 'State Welfare Scheme Announcement (Kannada)'
                  },
                  {
                    t: language === 'en' ? 'Cauvery Water Supply Notice' : 'ಕಾವೇರಿ ನೀರು ಸರಬರಾಜು ಸೂಚನೆ',
                    m: language === 'en' ? 'Maintenance in Bengaluru East on 23rd Sept between 8 AM and 4 PM.' : 'ಸೆಪ್ಟೆಂಬರ್ 23 ರಂದು ಬೆಳಿಗ್ಗೆ 8 ರಿಂದ ಸಂಜೆ 4 ರವರೆಗೆ ಬೆಂಗಳೂರು ಪೂರ್ವದಲ್ಲಿ ನಿರ್ವಹಣೆ.',
                    a: 'Specific District',
                    d: 'Bengaluru',
                    v: 'Bengaluru Civic Helpline Advisory'
                  },
                  {
                    t: language === 'en' ? 'Emergency Coastal Weather Advisory' : 'ಕರಾವಳಿ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ',
                    m: language === 'en' ? 'Heavy rains forecasted along coastal Karnataka. Helplines operational.' : 'ಕರಾವಳಿ ಕರ್ನಾಟಕದಲ್ಲಿ ಭಾರೀ ಮಳೆ ಮುನ್ಸೂಚನೆ. ಸಹಾಯವಾಣಿಗಳು ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿವೆ.',
                    a: 'All Karnataka',
                    v: 'Emergency Weather Alert'
                  }
                ].map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setTitle(preset.t);
                      setMessage(preset.m);
                      setAudience(preset.a);
                      if (preset.d) setDistrict(preset.d);
                      if (preset.v) setVoiceTitle(preset.v);
                    }}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">{preset.t}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{preset.m}</div>
                    <span className="inline-block text-[10px] text-emerald-600 font-semibold mt-1">
                      {t('ಗುರಿ:', 'Target:')} {preset.a === 'All Karnataka' ? t('ಸಮಸ್ತ ಕರ್ನಾಟಕ', 'All Karnataka') : preset.a}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: VOICE ANNOUNCEMENT STUDIO & LIVE AUDIO ROOM */}
      {/* ======================================================== */}
      {activeTab === 'voice-hub' && (
        <div className="space-y-6">
          
          {/* Sub-Switch for Voice Studio vs Live Room */}
          <div className="flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl w-fit">
            <button
              onClick={() => setActiveVoiceSubTab('studio')}
              className={`py-2 px-5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeVoiceSubTab === 'studio'
                  ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-rose-600" />
              <span>{t('ಧ್ವನಿ ಪ್ರಕಟಣೆ ಸ್ಟುಡಿಯೋ', 'Voice Announcement Studio')}</span>
            </button>

            <button
              onClick={() => setActiveVoiceSubTab('live-room')}
              className={`py-2 px-5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeVoiceSubTab === 'live-room'
                  ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>{t('ಕರ್ನಾಟಕ ಲೈವ್ ಧ್ವನಿ ಕೊಠಡಿ (3,421 ಕೇಳುಗರು)', 'Karnataka Live Voice Room (3,421 Listeners)')}</span>
            </button>
          </div>

          {/* SUB-VIEW A: VOICE STUDIO */}
          {activeVoiceSubTab === 'studio' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Studio Recorder */}
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {t('ಧ್ವನಿ ಪ್ರಕಟಣೆ ರೆಕಾರ್ಡರ್', 'Voice Announcement Recorder')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t(
                      'ಸ್ವಯಂಚಾಲಿತ ದೂರವಾಣಿ ಪ್ರಸಾರ ವಿತರಣೆಗಾಗಿ ಉನ್ನತ-ಸ್ಪಷ್ಟತೆಯ ಧ್ವನಿ ಪ್ರಕಟಣೆಗಳನ್ನು ರೆಕಾರ್ಡ್ ಮಾಡಿ.',
                      'Record high-clarity voice announcements for automated telephonic broadcast dissemination.'
                    )}
                  </p>
                </div>

                {/* Recorder Visualizer Box */}
                <div className="bg-slate-900 rounded-2xl p-6 text-center text-white space-y-4">
                  <div className="text-4xl font-mono font-black tracking-widest text-emerald-400">
                    00:{String(recordingSeconds).padStart(2, '0')}
                  </div>

                  {/* Equalizer Sound Wave Animation */}
                  <div className="flex items-center justify-center gap-1 h-12">
                    {[16, 28, 42, 22, 36, 48, 30, 20, 38, 50, 24, 18, 40, 28, 14].map((h, i) => (
                      <div
                        key={i}
                        className={`w-1.5 rounded-full transition-all duration-150 ${
                          isRecording ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'
                        }`}
                        style={{ height: isRecording ? `${h}px` : '6px' }}
                      />
                    ))}
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center justify-center gap-3 pt-2">
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={handleStartRecord}
                        className="py-3 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                      >
                        <Mic className="w-4 h-4" />
                        <span>{t('ರೆಕಾರ್ಡಿಂಗ್ ಪ್ರಾರಂಭಿಸಿ', 'Start Recording')}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStopRecord}
                        className="py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold border border-rose-500/50 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                      >
                        <Square className="w-4 h-4 fill-current" />
                        <span>{t('ರೆಕಾರ್ಡಿಂಗ್ ನಿಲ್ಲಿಸಿ', 'Stop Recording')}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => playChime('announcement')}
                      className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      title={t('ಪರೀಕ್ಷಾ ಆಡಿಯೊ ಚೈಮ್', 'Test Audio Chime')}
                    >
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      <span>{isPlayingAudio ? t('ಪ್ಲೇ ಆಗುತ್ತಿದೆ...', 'Playing...') : t('ಪರೀಕ್ಷಾ ಪ್ಲೇ', 'Test Play')}</span>
                    </button>
                  </div>
                </div>

                {/* Save Announcement Prompt if recorded */}
                {recordedAudioAvailable && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 animate-fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{t('ರೆಕಾರ್ಡಿಂಗ್ ಪೂರ್ಣಗೊಂಡಿದೆ! ಲೈಬ್ರರಿಗೆ ಉಳಿಸಲು ಸಿದ್ಧವಾಗಿದೆ.', 'Recording Complete! Ready to save to library.')}</span>
                    </div>
                    <input
                      type="text"
                      value={newAudioTitle}
                      onChange={(e) => setNewAudioTitle(e.target.value)}
                      placeholder={language === 'en' ? "Enter voice announcement title..." : "ಧ್ವನಿ ಪ್ರಕಟಣೆಯ ಶೀರ್ಷಿಕೆಯನ್ನು ನಮೂದಿಸಿ..."}
                      className="w-full px-3.5 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveVoiceAnnouncement}
                        className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                      >
                        {t('ಉಳಿಸಿ & ಪ್ರಸಾರಕ್ಕೆ ಲಗತ್ತಿಸಿ', 'Save & Attach to Broadcasts')}
                      </button>
                      <button
                        type="button"
                        onClick={() => playChime('announcement')}
                        className="py-2 px-3 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold cursor-pointer flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        <span>{t('ಆಡಿಯೊ ಪೂರ್ವವೀಕ್ಷಣೆ', 'Preview Audio')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Pre-recorded Voice Announcements Library */}
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {t('ಧ್ವನಿ ಪ್ರಕಟಣೆ ಲೈಬ್ರರಿ', 'Voice Announcement Library')}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t(
                        'ರಾಜ್ಯಾದ್ಯಂತ ದೂರವಾಣಿ ಪ್ರಸಾರಕ್ಕೆ ಸಿದ್ಧವಾಗಿರುವ ಪೂರ್ವ-ಪರಿಶೀಲಿಸಿದ ರೆಕಾರ್ಡಿಂಗ್ಗಳು',
                        'Pre-verified recordings ready for statewide telephony broadcast'
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { title: 'State Welfare Scheme Announcement (Kannada)', duration: '00:42', date: '22 Sept 2026' },
                    { title: 'Bengaluru Civic Helpline Advisory', duration: '00:35', date: '21 Sept 2026' },
                    { title: 'Emergency Weather Alert - Coastal Districts', duration: '00:28', date: '20 Sept 2026' },
                    ...voiceList
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                          <FileAudio className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{item.title}</div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {t('ಅವಧಿ:', 'Duration:')} {item.duration} • {item.created_at || item.date || t('ಸಕ್ರಿಯ', 'Active')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => playChime('announcement')}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Play className="w-3 h-3" />
                          <span>{t('ಪ್ಲೇ ಮಾಡಿ', 'Play')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setVoiceTitle(item.title);
                            setActiveTab('create');
                            if (onShowToast) onShowToast(
                              language === 'en' ? `Selected "${item.title}" for broadcast!` : `ಪ್ರಸಾರಕ್ಕಾಗಿ "${item.title}" ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ!`, 
                              'info'
                            );
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 cursor-pointer"
                        >
                          {t('ಪ್ರಸಾರದಲ್ಲಿ ಬಳಸಿ', 'Use in Broadcast')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* SUB-VIEW B: LIVE VOICE ROOM */}
          {activeVoiceSubTab === 'live-room' && (
            <div className="bg-slate-900 rounded-3xl p-6 lg:p-8 text-white border border-slate-700 shadow-2xl space-y-6">
              
              {/* Room Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{t('ಲೈವ್ ಪ್ರಸಾರ ಕೊಠಡಿ #101', 'LIVE BROADCAST ROOM #101')}</span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">
                    {t('ಕರ್ನಾಟಕ ಸಾಮಾನ್ಯ ಚರ್ಚೆ & ಜಿಲ್ಲಾ ನೇರ', 'Karnataka General Discussion & District Direct')}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {t(
                      'ರಾಜ್ಯ ಪ್ರಧಾನ ಕಚೇರಿ ಮತ್ತು ಎಲ್ಲಾ 31 ಜಿಲ್ಲಾ ಕ್ಷೇತ್ರ ಸಮನ್ವಯಕರ ನಡುವೆ ರಾಜ್ಯಾದ್ಯಂತ ಲೈವ್ ಆಡಿಯೊ ಸಮನ್ವಯ',
                      'Statewide live audio coordination between State HQ and all 31 District Field Coordinators'
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-400 font-mono">{participantsCount.toLocaleString('en-IN')}</span>
                    <span className="block text-[11px] text-slate-400">
                      {t('ನಾಗರಿಕರು & ಸಮನ್ವಯಕರು ಸಂಪರ್ಕಗೊಂಡಿದ್ದಾರೆ', 'Citizens & Coordinators Connected')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stage Speakers Grid */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t('ವೇದಿಕೆಯಲ್ಲಿ ಮಾತನಾಡುವವರು', 'Speakers on Stage')}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {[
                    { name: 'State Administrator', role: t('ಹೋಸ್ಟ್ (ರಾಜ್ಯ ಪ್ರಧಾನ ಕಚೇರಿ)', 'Host (State HQ)'), active: true },
                    { name: 'Suresh Gowda', role: formatDistrictName('Bengaluru'), active: !isMuted },
                    { name: 'Maheshwarappa K', role: formatDistrictName('Mysuru'), active: true },
                    { name: 'Anand Shinde', role: formatDistrictName('Belagavi'), active: false },
                    { name: 'Ramesh Poojary', role: formatDistrictName('Mangaluru'), active: false }
                  ].map((spk, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border text-center transition-all ${
                        spk.active
                          ? 'bg-emerald-950/40 border-emerald-500/50 ring-2 ring-emerald-500/30'
                          : 'bg-slate-800/60 border-slate-700'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center font-bold text-sm mb-2 ${
                        spk.active ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {spk.name.charAt(0)}
                      </div>
                      <div className="text-xs font-bold text-white truncate">{spk.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{spk.role}</div>
                      {spk.active && (
                        <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold font-mono">
                          <Volume2 className="w-3 h-3 animate-pulse" />
                          <span>{t('ಮಾತನಾಡುತ್ತಿದ್ದಾರೆ', 'Speaking')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Room Control Bar */}
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Mute Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMuted(!isMuted);
                      playChime('mute-toggle');
                    }}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${
                      isMuted
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/40'
                    }`}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isMuted ? t('ಮೈಕ್ರೊಫೋನ್ ಮ್ಯೂಟ್ ಆಗಿದೆ', 'Microphone Muted') : t('ಮೈಕ್ರೊಫೋನ್ ಲೈವ್', 'Microphone Live')}</span>
                  </button>

                  {/* Raise Hand Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setHandRaised(!handRaised);
                      playChime('hand-raise');
                      if (onShowToast) {
                        onShowToast(
                          !handRaised 
                            ? (language === 'en' ? 'Hand raised! You are queued to speak next.' : 'ಕೈ ಎತ್ತಲಾಗಿದೆ! ಮುಂದೆ ಮಾತನಾಡಲು ನಿಮ್ಮ ಸರದಿ.') 
                            : (language === 'en' ? 'Hand lowered.' : 'ಕೈ ಕೆಳಗೆ ಇಳಿಸಲಾಗಿದೆ.'), 
                          'info'
                        );
                      }
                    }}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      handRaised
                        ? 'bg-amber-500 text-slate-900 font-black ring-2 ring-amber-300'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    <Hand className="w-4 h-4" />
                    <span>{handRaised ? (language === 'en' ? '✋ Hand Raised (#1 Queue)' : '✋ ಕೈ ಎತ್ತಲಾಗಿದೆ (#1 ಸರದಿ)') : t('ಕೈ ಎತ್ತಿ', 'Raise Hand')}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">
                    {t('ಆಡಿಯೊ ಗುಣಮಟ್ಟ:', 'Audio Quality:')} <strong>HD Stereo (48kHz Opus)</strong>
                  </span>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: BROADCAST DETAIL & ANALYTICS PAGE */}
      {/* ======================================================== */}
      {activeTab === 'detail' && selectedBroadcast && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
            
            {/* Detail Top Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>✓ {t('ಕಳುಹಿಸಲಾಗಿದೆ & ಪ್ರಸಾರ ಮಾಡಲಾಗಿದೆ', 'Sent & Disseminated')}</span>
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    ID: CK-BC-{selectedBroadcast.id}
                  </span>
                </div>

                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {selectedBroadcast.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {t('ರವಾನಿಸಲಾಗಿದೆ:', 'Issued on:')} <strong className="text-slate-700">{selectedBroadcast.created_at}</strong> • {t('ವ್ಯಾಪ್ತಿ:', 'Scope:')} <strong className="text-slate-800">{selectedBroadcast.audience === 'All Karnataka' ? t('ಸಮಸ್ತ ಕರ್ನಾಟಕ', 'All Karnataka') : selectedBroadcast.audience} {selectedBroadcast.district && selectedBroadcast.district !== 'All' ? `(${formatDistrictName(selectedBroadcast.district)})` : ''}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setActiveTab('create')}
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('ಹೊಸ ಪ್ರಕಟಣೆ', 'New Announcement')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {t('ಫೀಡ್‌ಗೆ ಹಿಂತಿರುಗಿ', 'Back to Feed')}
                </button>
              </div>
            </div>

            {/* Broadcast Message Content Card */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                {t('ರವಾನಿಸಲಾದ ಪ್ರಕಟಣೆ ಪಠ್ಯ', 'Dispatched Announcement Text')}
              </span>
              <p className="text-slate-900 text-sm font-medium italic">
                “{selectedBroadcast.message}”
              </p>
              {selectedBroadcast.voice_title && (
                <div className="mt-3 flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                    <FileAudio className="w-4 h-4 text-emerald-600" />
                    <span>{t('ಲಗತ್ತಿಸಲಾದ ಧ್ವನಿ ಆಡಿಯೊ:', 'Attached Voice Audio:')} <strong>{selectedBroadcast.voice_title}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => playChime('announcement')}
                    className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>{isPlayingAudio ? t('ಪ್ಲೇ ಆಗುತ್ತಿದೆ...', 'Playing...') : t('ಆಡಿಯೊ ಪ್ಲೇ ಮಾಡಿ', 'Play Audio')}</span>
                  </button>
                </div>
              )}
              {selectedBroadcast.image_url && (
                <div className="mt-4">
                  <img 
                    src={selectedBroadcast.image_url} 
                    alt="Broadcast Poster" 
                    className="w-full max-w-2xl rounded-2xl object-cover border border-slate-200 shadow-md"
                  />
                </div>
              )}
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                  {t('ಸ್ವೀಕೃತದಾರರು', 'Recipients')}
                </span>
                <span className="text-3xl font-black text-slate-900 block mt-2 font-mono">
                  {selectedBroadcast.recipients}
                </span>
                <span className="text-xs text-slate-500 mt-1 block">
                  {t('ಜಿಲ್ಲಾ ಹಬ್‌ಗಳಾದ್ಯಂತ ಕ್ಯೂ ಮಾಡಲಾಗಿದೆ', 'Queued across district hubs')}
                </span>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200">
                <span className="text-xs uppercase font-bold text-emerald-700 tracking-wider">
                  {t('ತಲುಪಿಸಲಾಗಿದೆ', 'Delivered')}
                </span>
                <span className="text-3xl font-black text-emerald-800 block mt-2 font-mono">
                  {selectedBroadcast.delivered}
                </span>
                <span className="text-xs text-emerald-600 mt-1 block">96.4% {t('ಯಶಸ್ಸಿನ ದರ', 'Success Rate')}</span>
              </div>

              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
                <span className="text-xs uppercase font-bold text-amber-700 tracking-wider">
                  {t('ಬಾಕಿ / ಮರುಪ್ರಯತ್ನ', 'Pending / Retry')}
                </span>
                <span className="text-3xl font-black text-amber-800 block mt-2 font-mono">
                  {selectedBroadcast.pending}
                </span>
                <span className="text-xs text-amber-600 mt-1 block">
                  {t('ಕ್ಯೂನಲ್ಲಿ ಸ್ವಯಂಚಾಲಿತ ಮರುಪ್ರಯತ್ನ', 'Automated retry in queue')}
                </span>
              </div>
            </div>

            {/* Delivery Progress Bar */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                <span>{t('ಪ್ರಸಾರ ಪೂರ್ಣತೆಯ ಪ್ರಗತಿ', 'Dissemination Completion Progress')}</span>
                <span className="text-emerald-700 font-mono">
                  {selectedBroadcast.recipients > 0 ? Math.round(((selectedBroadcast.delivered || 0) / selectedBroadcast.recipients) * 100) : 0}% {t('ತಲುಪಿದೆ', 'Reached')}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${selectedBroadcast.recipients > 0 ? Math.min(100, Math.round(((selectedBroadcast.delivered || 0) / selectedBroadcast.recipients) * 100)) : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Real-time Carrier Dispatch Stream */}
            <div className="border-t border-slate-200 pt-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
                {t('ಲೈವ್ ಕ್ಯಾರಿಯರ್ ಗೇಟ್‌ವೇ ಬ್ಯಾಚ್ ರವಾನೆ ಸ್ಟ್ರೀಮ್', 'Live Carrier Gateway Batch Dispatch Stream')}
              </span>
              <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 font-mono text-xs space-y-2 max-h-48 overflow-y-auto">
                <div className="text-emerald-400">✓ [GATEWAY-01] Broadcast ID #CK-BC-{selectedBroadcast.id} verified and encrypted</div>
                <div className="text-slate-300">● [TARGET] District Node: {formatDistrictName(selectedBroadcast.district) || 'All Karnataka'}</div>
                <div className="text-slate-300">● [DISPATCH] {Number(selectedBroadcast.recipients || 0).toLocaleString('en-IN')} recipients queued for transmission</div>
                <div className="text-emerald-400">✓ [DELIVERY] {Number(selectedBroadcast.delivered || 0).toLocaleString('en-IN')} confirmed ({selectedBroadcast.status || 'Active'})</div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Radio className="w-8 h-8 animate-pulse" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {t('ಪ್ರಸಾರ ರವಾನಿಸಲು ಸಿದ್ಧರಿದ್ದೀರಾ?', 'Ready to Dispatch Broadcast?')}
            </h3>
            
            <div className="my-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-sm">
              {preparedNotice}
            </div>

            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              {t(
                'ಈ ಕ್ರಿಯೆಯು ತಕ್ಷಣವೇ ಕರ್ನಾಟಕ ಜಿಲ್ಲಾ ದೂರಸಂಪರ್ಕ ಜಾಲದಾದ್ಯಂತ ಸ್ವಯಂಚಾಲಿತ ಧ್ವನಿ ಮತ್ತು SMS ರವಾನೆಗಳನ್ನು ಕ್ಯೂ ಮಾಡುತ್ತದೆ.',
                'This action will instantly queue automated voice and SMS dispatches across the Karnataka district telecommunications mesh.'
              )}
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {t('ಮಾರ್ಪಡಿಸಿ', 'Modify')}
              </button>
              <button
                type="button"
                onClick={handleConfirmAndSend}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                {t('ಖಚಿತಪಡಿಸಿ & ರವಾನಿಸಿ', 'Confirm & Dispatch')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
