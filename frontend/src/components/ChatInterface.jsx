import React, { useState, useEffect, useRef } from 'react';
import { Send, Volume2, User, Users, Package, UserPlus, PackagePlus, Sparkles, Camera, X, Compass, Mic, MicOff, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CameraView from './CameraView';

// Resilient image source normalizer: prevents double 'data:image/...' prefixes
const normalizeImageSrc = (img) => {
    if (!img || typeof img !== 'string') return null;
    const trimmed = img.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
        return trimmed;
    }
    return `data:image/jpeg;base64,${trimmed}`;
};

function ChatInterface({
    messages,
    onSendMessage,
    suggestions = [],
    onSuggestionClick,
    onPlayAudio,
    onCapture,
    onScanFace,
    onScanObject,
    onEnroll,
    onEnrollObject,
    onOpenGPS,
    onOpenMemoryBank,
    onEnrollWithPhoto,
    onSpeakResponse,
    language = 'en',
    onLanguageChange,
    isTyping,
    typingStatus,
    captureTrigger,
    enrollType
}) {
    const [input, setInput] = useState("");
    const [showCamera, setShowCamera] = useState(false);
    const [cameraMode, setCameraMode] = useState('person');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    const activeLanguage = language || 'en';

    const endRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping, showCamera]);

    // Handle External Capture Trigger (e.g. Enrollment)
    useEffect(() => {
        if (captureTrigger && captureTrigger > 0) {
            setCameraMode(enrollType || 'person');
            setShowCamera(true);
        }
    }, [captureTrigger, enrollType]);

    const handleSend = () => {
        if (!input.trim()) return;
        onSendMessage(input);
        setInput("");
    };

    const handleCameraCapture = (blob) => {
        onCapture(blob);
        setShowCamera(false);
    };

    const openCamera = (mode) => {
        if (mode === 'person') onScanFace();
        else onScanObject();
        setCameraMode(mode);
        setShowCamera(true);
    };

    // Speech-to-Text Microphone for Patient Voice Queries
    const toggleSpeechRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition is supported in Google Chrome, Microsoft Edge, and Safari.");
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;

            // Set speech recognition language based on active language
            if (activeLanguage === 'kn') {
                recognition.lang = 'kn-IN'; // Kannada (Karnataka)
            } else if (activeLanguage === 'hi') {
                recognition.lang = 'hi-IN'; // Hindi (India)
            } else {
                recognition.lang = 'en-IN'; // Indian English
            }

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (transcript) {
                    setInput(transcript);
                    onSendMessage(transcript);
                    setInput("");
                }
            };

            recognition.onerror = (event) => {
                console.warn("Speech recognition error:", event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (e) {
            console.error("Speech recognition error:", e);
            setIsListening(false);
        }
    };

    const handleSpeakAloud = (text) => {
        if (onSpeakResponse) {
            onSpeakResponse(text);
        }
    };

    const getPlaceholderText = () => {
        if (isListening) {
            if (activeLanguage === 'kn') return "ಮಾತನಾಡಿ, ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ... 🎙️";
            if (activeLanguage === 'hi') return "बोलिए, मैं सुन रहा हूँ... 🎙️";
            return "Listening to your voice... 🎙️";
        }
        if (activeLanguage === 'kn') return "ಮಾವೋರಾ ಅವರ ಬಳಿ ಕೇಳಿ ಅಥವಾ ಮೈಕ್ ಒತ್ತಿ ಮಾತನಾಡಿ...";
        if (activeLanguage === 'hi') return "मावोरा से पूछें या माइक दबाकर बोलें...";
        return "Ask Mavora, or tap mic to speak...";
    };

    return (
        <div className="flex flex-col h-full w-full bg-slate-900/60 backdrop-blur-xl border-l border-white/5 relative">
            {/* Header with 3 Language Options */}
            <div className="p-3.5 px-6 border-b border-white/5 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-purple-400" size={18} />
                    <h2 className="font-bold text-slate-200 text-xs tracking-wider uppercase">Voice & Memory Assistant</h2>
                </div>

                {/* 3 Indian Languages Switcher (English, Kannada Karnataka, Hindi) */}
                <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700/80 p-1 rounded-xl">
                    <button
                        onClick={() => onLanguageChange && onLanguageChange('en')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            activeLanguage === 'en'
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                        }`}
                        title="English (Indian Accent)"
                    >
                        English
                    </button>
                    <button
                        onClick={() => onLanguageChange && onLanguageChange('kn')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            activeLanguage === 'kn'
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                        }`}
                        title="ಕನ್ನಡ (Karnataka Accent)"
                    >
                        ಕನ್ನಡ
                    </button>
                    <button
                        onClick={() => onLanguageChange && onLanguageChange('hi')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            activeLanguage === 'hi'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                        }`}
                        title="हिन्दी (Indian Accent)"
                    >
                        हिन्दी
                    </button>
                </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-700" ref={containerRef}>
                {messages.length === 0 && !showCamera && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3 opacity-60">
                        <div className="p-3.5 bg-slate-800 rounded-full mb-1 animate-pulse">
                            <Sparkles size={32} className="text-purple-400" />
                        </div>
                        <h2 className="text-sm font-medium">
                            {activeLanguage === 'kn' ? "ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?" : activeLanguage === 'hi' ? "मैं आपकी क्या मदद कर सकता हूँ?" : "How can I assist you right now?"}
                        </h2>
                    </div>
                )}

                <AnimatePresence mode="popLayout">
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 15, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.25 }}
                            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex max-w-[85%] md:max-w-[78%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${msg.role === 'user'
                                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                                    : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                                    }`}>
                                    {msg.role === 'user' ? <User size={13} className="text-white" /> : <Sparkles size={13} className="text-white" />}
                                </div>

                                {/* Content Bubble */}
                                <div className={`flex flex-col space-y-2 p-3.5 shadow-lg backdrop-blur-sm border border-white/5 ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none'
                                    : 'bg-slate-800/90 text-slate-200 rounded-2xl rounded-tl-none'
                                    }`}>
                                    
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap flex-1">{msg.text}</p>
                                        
                                        {/* VOICE ICON TO READ ALOUD BOT ANSWER IF PATIENT CANNOT READ */}
                                        {msg.role === 'bot' && (
                                            <button
                                                onClick={() => handleSpeakAloud(msg.text)}
                                                className="p-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 hover:text-white transition-all active:scale-90 flex-shrink-0 cursor-pointer border border-purple-500/30"
                                                title="Read answer aloud in your language (Tap if you cannot read)"
                                            >
                                                <Volume2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Interactive In-Chat Enrollment Card for Unknown Persons or Objects */}
                                    {msg.actionPrompt && (
                                        <div className="mt-2.5 pt-2.5 border-t border-white/10 flex flex-col gap-2">
                                            {msg.actionPrompt.type === 'enroll_person_prompt' && (
                                                <button
                                                    onClick={() => onEnrollWithPhoto ? onEnrollWithPhoto(msg.actionPrompt.blob, 'person') : onEnroll()}
                                                    className="w-full py-2.5 px-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40 transition-all active:scale-95 cursor-pointer"
                                                >
                                                    <UserPlus size={15} />
                                                    <span>
                                                        {activeLanguage === 'kn' ? '➕ ಈ ವ್ಯಕ್ತಿಯನ್ನು ನೆನಪಿಡಿ' : activeLanguage === 'hi' ? '➕ इस व्यक्ति को याद रखें' : '➕ Remember This Person Now'}
                                                    </span>
                                                </button>
                                            )}

                                            {msg.actionPrompt.type === 'enroll_object_prompt' && (
                                                <button
                                                    onClick={() => onEnrollWithPhoto ? onEnrollWithPhoto(msg.actionPrompt.blob, 'object') : onEnrollObject()}
                                                    className="w-full py-2.5 px-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-900/40 transition-all active:scale-95 cursor-pointer"
                                                >
                                                    <PackagePlus size={15} />
                                                    <span>
                                                        {activeLanguage === 'kn' ? '➕ ಈ ವಸ್ತುವನ್ನು ನೆನಪಿಡಿ' : activeLanguage === 'hi' ? '➕ इस वस्तु को याद रखें' : '➕ Remember This Item Now'}
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Prominent Listen Button for Patients who cannot read */}
                                    {msg.role === 'bot' && (
                                        <button
                                            onClick={() => handleSpeakAloud(msg.text)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-200 hover:text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer w-fit mt-1 shadow-sm"
                                        >
                                            <Volume2 size={14} className="text-purple-400" />
                                            <span>
                                                {activeLanguage === 'kn' ? '🔊 ಉತ್ತರಿಸು / ಕೇಳಿ' : activeLanguage === 'hi' ? '🔊 उत्तर सुनें' : '🔊 Listen to Answer'}
                                            </span>
                                        </button>
                                    )}

                                    {/* Optional Audio Playback for Enrolled Family Voice */}
                                    {msg.audioUrl && (
                                        <button
                                            onClick={() => onPlayAudio(msg.audioUrl)}
                                            className="flex items-center gap-2 text-xs bg-black/25 hover:bg-black/40 p-2 rounded-lg transition-colors w-fit text-slate-300 hover:text-white cursor-pointer"
                                        >
                                            <Volume2 size={14} /> Play Family Voice Sample
                                        </button>
                                    )}

                                    {/* Image Preview if available */}
                                    {msg.image && normalizeImageSrc(msg.image) && (
                                        <img
                                            src={normalizeImageSrc(msg.image)}
                                            alt="Captured"
                                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                                            className="rounded-xl max-h-48 object-cover mt-2 border border-white/15 shadow-md"
                                        />
                                    )}

                                    {/* Gallery Preview if available */}
                                    {msg.gallery && msg.gallery.length > 0 && (
                                        <div className="flex gap-2 overflow-x-auto py-1.5 mt-2">
                                            {msg.gallery.map((imgBase64, idx) => {
                                                const src = normalizeImageSrc(imgBase64);
                                                if (!src) return null;
                                                return (
                                                    <img
                                                        key={idx}
                                                        src={src}
                                                        alt={`Gallery ${idx}`}
                                                        className="w-16 h-16 rounded-xl object-cover border border-white/15 shadow-sm flex-shrink-0"
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Camera View Overlay inside Chat */}
                    {showCamera && (
                        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
                            <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
                                <div className="p-3.5 bg-slate-950/80 border-b border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-white">
                                        <Camera size={16} className="text-purple-400" />
                                        <span className="text-xs font-bold uppercase tracking-wider">
                                            {cameraMode === 'person' ? "Face Scanner" : "Object Scanner"}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setShowCamera(false)}
                                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-hidden relative">
                                    <CameraView onCapture={handleCameraCapture} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Typing Status Indicator */}
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 text-slate-400 text-xs py-2 px-3 bg-slate-800/40 rounded-xl w-fit border border-white/5"
                        >
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></span>
                            </div>
                            <span>{typingStatus || (activeLanguage === 'kn' ? "ಸ್ಮೃತಿಯನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ..." : activeLanguage === 'hi' ? "स्मृति खोजी जा रही है..." : "Thinking...")}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={endRef} />


            </div>

            {/* Input Footer */}
            <div className="p-3 md:px-4 md:py-3 bg-slate-900/95 border-t border-white/5 space-y-2.5 z-20 flex-shrink-0">
                {/* 1. Suggestions Row */}
                {suggestions.length > 0 && !showCamera && (
                    <div className="flex gap-2 overflow-x-auto pb-1 noscroll scroll-smooth">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => onSuggestionClick(s)}
                                className="whitespace-nowrap px-3.5 py-1.5 bg-slate-800/90 hover:bg-purple-900/40 hover:border-purple-500/50 text-slate-300 hover:text-purple-200 text-xs font-medium rounded-full border border-slate-700/80 transition-all flex-shrink-0 cursor-pointer shadow-sm active:scale-95"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* 2. Text & Voice Input Bar */}
                <div className="flex items-center gap-2 bg-slate-800/90 rounded-2xl p-1.5 px-3 border border-slate-700/80 focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all shadow-md">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={getPlaceholderText()}
                        disabled={showCamera}
                        className="flex-1 bg-transparent text-white py-1.5 text-sm outline-none placeholder:text-slate-500 disabled:opacity-50"
                    />

                    {/* Speech Recognition Voice Button for Patient */}
                    <button
                        onClick={toggleSpeechRecognition}
                        disabled={showCamera}
                        className={`p-2 rounded-xl transition-all active:scale-95 cursor-pointer ${
                            isListening
                                ? 'bg-red-500 text-white animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                                : 'bg-slate-700/70 hover:bg-purple-600/40 text-slate-300 hover:text-white'
                        }`}
                        title={isListening ? "Listening... (Tap to stop)" : "Speak question aloud (Tap if you can't type)"}
                    >
                        {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>

                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
                    >
                        <Send size={16} />
                    </button>
                </div>

                {/* 3. Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                    <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/70 shadow-sm">
                        <ActionButton icon={<User size={14} />} label="Scan Face" onClick={() => openCamera('person')} />
                        <ActionButton icon={<Package size={14} />} label="Scan Item" onClick={() => openCamera('object')} />
                        <div className="w-px h-4 bg-slate-700 mx-0.5" />
                        <ActionButton icon={<UserPlus size={14} />} label="Enroll Person" onClick={onEnroll} color="text-purple-400" />
                        <ActionButton icon={<PackagePlus size={14} />} label="Enroll Item" onClick={onEnrollObject} color="text-orange-400" />

                    </div>

                    <p className="text-[10px] text-slate-500 font-medium hidden sm:block">MAVORA AI Companion</p>
                </div>
            </div>
        </div>
    );
}

const ActionButton = ({ icon, onClick, color = "text-slate-300", label }) => (
    <button
        onClick={onClick}
        title={label}
        className={`px-2.5 py-1.5 hover:bg-slate-700/90 rounded-lg ${color} transition-all active:scale-95 cursor-pointer flex items-center gap-1.5`}
    >
        {icon}
        <span className="text-[11px] font-semibold">{label}</span>
    </button>
);

export default ChatInterface;
