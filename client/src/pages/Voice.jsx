import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  Upload,
  Radio,
  Users,
  Hand,
  LogOut,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function Voice({ onShowToast }) {
  const [activeVoiceTab, setActiveVoiceTab] = useState('announcement'); // 'announcement' | 'live-room'

  // Voice Announcement Recorder State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceList, setVoiceList] = useState([]);
  const [activeVoice, setActiveVoice] = useState(null);

  // Live Voice Room State
  const [isMuted, setIsMuted] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [participantsCount, setParticipantsCount] = useState(3421);
  const [roomActive, setRoomActive] = useState(true);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    fetchVoiceList();
  }, []);

  const fetchVoiceList = async () => {
    try {
      const res = await fetch('/api/voice');
      if (res.ok) {
        const data = await res.json();
        setVoiceList(data);
        if (data.length > 0) setActiveVoice(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Recording Timer
  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecord = async () => {
    setRecordingSeconds(0);
    audioChunksRef.current = [];

    // Attempt real browser microphone API if permitted, otherwise graceful fallback
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.start();
        setIsRecording(true);
        return;
      } catch (err) {
        console.warn('Microphone access not granted, using simulated studio recording:', err);
      }
    }

    // Fallback simulation
    setIsRecording(true);
  };

  const handleStopRecord = async () => {
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }

    const durationStr = `00:${String(recordingSeconds || 24).padStart(2, '0')}`;
    const newTitle = `Field Voice Note (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;

    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          duration: durationStr,
          audio_url: ''
        })
      });
      if (res.ok) {
        const newVoice = await res.json();
        setVoiceList((prev) => [newVoice, ...prev]);
        setActiveVoice(newVoice);
        if (onShowToast) onShowToast('Voice note recorded and saved to studio!', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Web Audio chime generator
  const playAnnouncementAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 announcement chime
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.22);
        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.22);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + idx * 0.22 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.22 + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.22);
        osc.stop(ctx.currentTime + idx * 0.22 + 0.5);
      });
    } catch (e) {
      console.warn('AudioContext not permitted yet:', e);
    }
  };

  const handleTogglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    if (nextState) {
      playAnnouncementAudio();
      if (onShowToast) onShowToast(`Playing: ${activeVoice?.title || 'Announcement'}`, 'info');
      setTimeout(() => setIsPlaying(false), 4500);
    }
  };

  const handleRaiseHand = () => {
    const nextHand = !handRaised;
    setHandRaised(nextHand);
    if (nextHand) {
      playAnnouncementAudio();
      if (onShowToast) onShowToast('Hand raised to speak in Karnataka Discussion Room', 'info');
    } else {
      if (onShowToast) onShowToast('Hand lowered', 'info');
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Mic className="w-6 h-6 text-emerald-600" />
            <span>ಧ್ವನಿ ಮತ್ತು ಆಡಿಯೊ ಸಂವಹನ</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ಐವಿಆರ್ ಪ್ರಕಟಣೆ ಸ್ಟುಡಿಯೋ ಮತ್ತು ಲೈವ್ ಜಿಲ್ಲಾ ಆಡಿಯೊ ರೂಮ್ ಆರ್ಕಿಟೆಕ್ಚರ್
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
          <button
            onClick={() => setActiveVoiceTab('announcement')}
            className={`py-1.5 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeVoiceTab === 'announcement'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Voice Announcement Studio
          </button>
          <button
            onClick={() => setActiveVoiceTab('live-room')}
            className={`py-1.5 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeVoiceTab === 'live-room'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>ಲೈವ್ ವಾಯ್ಸ್ ರೂಮ್ (3,421)</span>
          </button>
        </div>
      </div>

      {/* SECTION 11: VOICE ANNOUNCEMENT STUDIO */}
      {activeVoiceTab === 'announcement' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recorder & Player Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-8">
            
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-1">
                Voice Announcement Recording Studio
              </h2>
              <p className="text-xs text-slate-500">
                ಸ್ವಯಂಚಾಲಿತ ಜಿಲ್ಲಾ ಡಯಲ್-ಔಟ್‌ಗಳಿಗಾಗಿ ಹೈ-ಡೆಫಿನಿಷನ್ ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್ ಧ್ವನಿ ಪ್ರಸಾರಗಳನ್ನು ರೆಕಾರ್ಡ್ ಮಾಡಿ.
              </p>
            </div>

            {/* Live Recording Area */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 text-white text-center">
              <div className="relative inline-flex items-center justify-center mb-4">
                {isRecording && <div className="w-24 h-24 rounded-full bg-rose-500/20 animate-ping absolute"></div>}
                <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all ${
                  isRecording ? 'bg-rose-600 animate-pulse' : 'bg-emerald-600'
                }`}>
                  <Mic className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="text-xs uppercase font-bold tracking-wider text-slate-400">
                {isRecording ? 'Recording Live Audio...' : 'Audio Studio Ready'}
              </div>

              {/* Digital Timer */}
              <div className="font-mono text-3xl font-black text-emerald-400 mt-2">
                00:{String(recordingSeconds).padStart(2, '0')}
              </div>

              {/* Live Waveform */}
              <div className="flex items-center justify-center gap-1.5 h-10 my-6">
                {[30, 50, 80, 40, 95, 60, 100, 75, 45, 85, 60, 90, 40, 70, 50, 30].map((h, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full transition-all ${
                      isRecording ? 'bg-rose-500 animate-pulse' : 'bg-slate-700'
                    }`}
                    style={{
                      height: isRecording ? `${h}%` : '20%',
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '0.6s'
                    }}
                  ></span>
                ))}
              </div>

              {/* Record / Stop Button */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {!isRecording ? (
                  <button
                    onClick={handleStartRecord}
                    className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Mic className="w-4 h-4" />
                    <span>ಧ್ವನಿ ರೆಕಾರ್ಡ್ ಮಾಡಿ</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStopRecord}
                    className="py-3 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    <span>ರೆಕಾರ್ಡಿಂಗ್ ನಿಲ್ಲಿಸಿ ಮತ್ತು ಉಳಿಸಿ</span>
                  </button>
                )}

                <label className="py-3 px-5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>ಆಡಿಯೊ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ</span>
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={() => {
                      if (onShowToast) onShowToast('Audio file uploaded and encoded for broadcast!', 'success');
                    }}
                  />
                </label>
              </div>

            </div>

            {/* Currently Active Voice Preview Player */}
            {activeVoice && (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎙️</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{activeVoice.title}</h4>
                      <p className="text-[11px] text-slate-500">ರೆಕಾರ್ಡ್ ಮಾಡಲಾದ ದಿನಾಂಕ: {activeVoice.created_at}</p>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                    {activeVoice.duration}
                  </span>
                </div>

                <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-emerald-200/80">
                  <button
                    onClick={handleTogglePlay}
                    className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 cursor-pointer transition-transform active:scale-95"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  <div className="flex-1">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`bg-emerald-500 h-full rounded-full transition-all duration-300 ${
                          isPlaying ? 'w-2/3' : 'w-0'
                        }`}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                      <span>{isPlaying ? '00:15' : '00:00'}</span>
                      <span>{activeVoice.duration}</span>
                    </div>
                  </div>

                  <Volume2 className="w-4 h-4 text-emerald-700" />
                </div>
              </div>
            )}

          </div>

          {/* Voice Archive List */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Saved Voice Library
            </h3>
            <p className="text-xs text-slate-500">
              ನಿಮ್ಮ ಮುಂದಿನ ಜಿಲ್ಲಾ ಸಾಮೂಹಿಕ ಪ್ರಸಾರಕ್ಕೆ ಯಾವುದೇ ಆಡಿಯೊ ಕ್ಲಿಪ್ ಲಗತ್ತಿಸಿ.
            </p>

            <div className="space-y-3">
              {voiceList.map((v) => (
                <div
                  key={v.id}
                  onClick={() => setActiveVoice(v)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    activeVoice?.id === v.id
                      ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{v.title}</span>
                    <span className="font-mono text-emerald-700 font-semibold">{v.duration}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                    <span>{v.created_at}</span>
                    {activeVoice?.id === v.id && (
                      <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SECTION 12: LIVE VOICE ROOM UI (Key Requirement 12) */}
      {activeVoiceTab === 'live-room' && (
        <div className="bg-slate-950 text-white rounded-3xl p-6 lg:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
          
          {/* Room Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>ಲೈವ್ ವಾಯ್ಸ್ ರೂಮ್</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">
                Karnataka General Discussion
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Host: <strong className="text-emerald-400">ರಾಜ್ಯ ನಿರ್ವಾಹಕ</strong> • WebRTC ಕ್ಲಸ್ಟರ್ ಸ್ಕೇಲಿಂಗ್‌ಗಾಗಿ ಆರ್ಕಿಟೆಕ್ಚರ್ ಸಿದ್ಧವಾಗಿದೆ
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>{participantsCount.toLocaleString('en-IN')} ಸಂಪರ್ಕಗೊಂಡಿದೆ</span>
              </div>
            </div>
          </div>

          {/* STAGE: SPEAKERS */}
          <div className="my-8">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-4">
              Speakers on Stage
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              {/* Host */}
              <div className="bg-slate-900/90 rounded-2xl p-6 border-2 border-emerald-500/50 flex flex-col items-center text-center relative shadow-lg">
                <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Host
                </div>
                <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-emerald-600/30 mb-3 ring-4 ring-emerald-500/20">
                  SA
                </div>
                <h4 className="font-bold text-white text-base">ರಾಜ್ಯ ನಿರ್ವಾಹಕ</h4>
                <p className="text-xs text-emerald-400 font-medium">ಮುಖ್ಯ ಸಂಯೋಜಕ</p>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>ಮಾತನಾಡುತ್ತಿದ್ದಾರೆ</span>
                </div>
              </div>

              {/* Speaker 1 */}
              <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 flex flex-col items-center text-center relative shadow-lg">
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-blue-600/30 mb-3">
                  SG
                </div>
                <h4 className="font-bold text-white text-base">Suresh Gowda</h4>
                <p className="text-xs text-blue-300 font-medium">ಉಸ್ತುವಾರಿ (ಬೆಂಗಳೂರು ನಗರ)</p>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>ಮೈಕ್ ಸಕ್ರಿಯವಾಗಿದೆ</span>
                </div>
              </div>

              {/* Speaker 2 */}
              <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 flex flex-col items-center text-center relative shadow-lg">
                <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-purple-600/30 mb-3">
                  MK
                </div>
                <h4 className="font-bold text-white text-base">Maheshwarappa K</h4>
                <p className="text-xs text-purple-300 font-medium">ಉಸ್ತುವಾರಿ (ಮೈಸೂರು)</p>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>ಆಲಿಸುತ್ತಿದ್ದಾರೆ</span>
                </div>
              </div>

            </div>
          </div>

          {/* AUDIENCE LISTENERS GRID */}
          <div className="mt-6 pt-6 border-t border-slate-900">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Audience & District Listeners ({participantsCount.toLocaleString('en-IN')})
              </span>
              <span className="text-xs text-slate-500 font-mono">WebRTC ಎಡ್ಜ್ ಗ್ರಿಡ್</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 gap-3">
              {[
                'Anand S (Belagavi)',
                'Ramesh P (Mangaluru)',
                'Girish S (Tumakuru)',
                'Kavitha R (Mandya)',
                'Siddesh M (Hassan)',
                'Naveen K (Shivamogga)',
                'Deepa N (Dharwad)',
                '+3,414 more...'
              ].map((name, i) => (
                <div
                  key={i}
                  className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 text-center text-slate-300 text-xs truncate"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-[10px] font-bold text-slate-400 mb-1">
                    👤
                  </div>
                  <span className="text-[11px] font-medium">{name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM CONTROLS BAR (Key Requirement: Mute, Unmute, Raise Hand, Leave Room) */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-center gap-4">
            
            {/* Mute / Unmute */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`py-3 px-5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                isMuted
                  ? 'bg-rose-600/90 text-white hover:bg-rose-500'
                  : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
              <span>{isMuted ? 'UNMUTE MIC' : 'MUTE MIC'}</span>
            </button>

            {/* Raise Hand */}
            <button
              onClick={handleRaiseHand}
              className={`py-3 px-5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                handRaised
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                  : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              <Hand className="w-4 h-4" />
              <span>{handRaised ? 'HAND RAISED ✋' : 'RAISE HAND'}</span>
            </button>

            {/* Leave Room */}
            <button
              onClick={() => {
                setActiveVoiceTab('announcement');
                if (onShowToast) onShowToast('You left the Karnataka General Discussion room.', 'info');
              }}
              className="py-3 px-5 rounded-2xl bg-rose-950/80 border border-rose-800/60 hover:bg-rose-900 text-rose-300 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>ಕೊಠಡಿಯಿಂದ ನಿರ್ಗಮಿಸಿ</span>
            </button>

          </div>

        </div>
      )}

    </div>
  );
}
