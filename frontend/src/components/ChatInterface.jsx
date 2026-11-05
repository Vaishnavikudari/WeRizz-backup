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

            if (activeLanguage === 'kn') {
                recognition.lang = 'kn-IN';
            } else if (activeLanguage === 'hi') {
                recognition.lang = 'hi-IN';
            } else {
                recognition.lang = 'en-IN';
            }

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (transcript) {
                    onSendMessage(transcript);
                }
                setIsListening(false);
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
        <div className="flex flex-col h-full w-full bg-[#000000] border-l border-white/10 relative">
            {/* Header with Cursive Subtitle & Minimalist Language Segmented Control */}
            <div className="p-3.5 px-6 border-b border-white/10 flex items-center justify-between bg-[#08080a] sticky top-0 z-10 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                    <Sparkles className="text-zinc-300" size={16} />
                    <div className="flex items-baseline gap-2">
                        <h2 className="font-bold text-white text-xs tracking-wider uppercase font-mono">
                            Voice & Memory Assistant
                        </h2>
                        <span className="font-handwritten text-lg text-zinc-400 normal-case hidden sm:inline">
                            “always here beside you”
                        </span>
                    </div>
                </div>

                {/* Minimalist 3 Languages Segmented Switcher */}
                <div className="flex items-center gap-1 bg-zinc-950 border border-white/10 p-1 rounded-xl">
                    <button
                        onClick={() => onLanguageChange && onLanguageChange('en')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            activeLanguage === 'en'
                                ? 'bg-white text-black shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                        title="English"
                    >
                        English
                    </button>
                    <button
                        onClick={() => onLanguageChange && onLanguageChange('kn')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            activeLanguage === 'kn'
                                ? 'bg-white text-black shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                        title="ಕನ್ನಡ (Kannada)"
                    >
                        ಕನ್ನಡ
                    </button>
                    <button
                        onClick={() => onLanguageChange && onLanguageChange('hi')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            activeLanguage === 'hi'
                                ? 'bg-white text-black shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                        title="हिन्दी (Hindi)"
                    >
                        हिन्दी
                    </button>
                </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4" ref={containerRef}>
                {messages.length === 0 && !showCamera && (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-3 opacity-80">
                        <div className="p-4 bg-zinc-900 border border-white/10 rounded-full mb-1">
                            <Sparkles size={28} className="text-zinc-300" />
                        </div>
                        <p className="font-handwritten text-2xl text-zinc-300 text-center">
                            {activeLanguage === 'kn' ? "“ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?”" : activeLanguage === 'hi' ? "“मैं आपकी क्या मदद कर सकता हूँ?”" : "“How can I assist you today?”"}
                        </p>
                    </div>
                )}

                <AnimatePresence mode="popLayout">
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex max-w-[85%] md:max-w-[78%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar Icon */}
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border border-white/10 ${msg.role === 'user'
                                    ? 'bg-zinc-800 text-white'
                                    : 'bg-zinc-900 text-zinc-300'
                                    }`}>
                                    {msg.role === 'user' ? <User size={13} /> : <Sparkles size={13} />}
                                </div>

                                {/* Content Bubble */}
                                <div className={`flex flex-col space-y-2 p-4 shadow-md border ${msg.role === 'user'
                                    ? 'bg-zinc-800 text-white rounded-2xl rounded-tr-none border-white/10'
                                    : 'bg-[#0f0f13] text-zinc-100 rounded-2xl rounded-tl-none border-white/10'
                                    }`}>
                                    
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap flex-1">{msg.text}</p>
                                        
                                        {/* Spoken Voice Button */}
                                        {msg.role === 'bot' && (
                                            <button
                                                onClick={() => handleSpeakAloud(msg.text)}
                                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all active:scale-90 flex-shrink-0 cursor-pointer border border-white/10"
                                                title="Listen aloud"
                                            >
                                                <Volume2 size={15} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Enrolled Person Photo Card */}
                                    {msg.image && (
                                        <div className="mt-2 rounded-xl overflow-hidden border border-white/10 max-w-sm bg-black">
                                            <img 
                                                src={normalizeImageSrc(msg.image)} 
                                                alt="Memory photo"
                                                className="w-full h-44 object-cover" 
                                            />
                                        </div>
                                    )}

                                    {/* Interactive In-Chat Enrollment Card */}
                                    {msg.actionPrompt && (
                                        <div className="mt-2.5 pt-2.5 border-t border-white/10 flex flex-col gap-2">
                                            {msg.actionPrompt.type === 'enroll_person_prompt' && (
                                                <button
                                                    onClick={() => onEnrollWithPhoto ? onEnrollWithPhoto(msg.actionPrompt.blob, 'person') : onEnroll()}
                                                    className="w-full py-2.5 px-4 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
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
                                                    className="w-full py-2.5 px-4 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
                                                >
                                                    <PackagePlus size={15} />
                                                    <span>
                                                        {activeLanguage === 'kn' ? '➕ ಈ ವಸ್ತುವನ್ನು ನೆನಪಿಡಿ' : activeLanguage === 'hi' ? '➕ इस वस्तु को याद रखें' : '➕ Remember This Item Now'}
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isTyping && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-zinc-400 text-xs pl-10"
                    >
                        <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
                        </div>
                        <span className="font-handwritten text-lg text-zinc-400">
                            {typingStatus || "Thinking with care..."}
                        </span>
                    </motion.div>
                )}

                <div ref={endRef} />
            </div>

            {/* Input Footer - Minimal Black */}
            <div className="p-3 md:px-5 md:py-3.5 bg-[#08080a] border-t border-white/10 space-y-2.5 z-20 flex-shrink-0">
                {/* 1. Suggestions Row */}
                {suggestions.length > 0 && !showCamera && (
                    <div className="flex gap-2 overflow-x-auto pb-1 noscroll scroll-smooth">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => onSuggestionClick(s)}
                                className="whitespace-nowrap px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 hover:border-white/20 text-zinc-300 hover:text-white text-xs font-medium rounded-full border border-white/10 transition-all flex-shrink-0 cursor-pointer shadow-sm active:scale-95"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* 2. Text & Voice Input Bar */}
                <div className="flex items-center gap-2 bg-[#101013] rounded-2xl p-1.5 px-3 border border-white/10 focus-within:border-white/30 transition-all shadow-md">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={getPlaceholderText()}
                        disabled={showCamera}
                        className="flex-1 bg-transparent text-white py-1.5 text-sm outline-none placeholder:text-zinc-500 disabled:opacity-50"
                    />

                    {/* Speech Recognition Voice Button for Patient */}
                    <button
                        onClick={toggleSpeechRecognition}
                        disabled={showCamera}
                        className={`p-2 rounded-xl transition-all active:scale-95 cursor-pointer ${
                            isListening
                                ? 'bg-white text-black ring-2 ring-white/50 animate-pulse'
                                : 'bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white'
                        }`}
                        title={isListening ? "Listening... (Tap to stop)" : "Speak question aloud"}
                    >
                        {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>

                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="p-2 bg-white hover:bg-zinc-200 text-black rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
                    >
                        <Send size={16} />
                    </button>
                </div>

                {/* 3. Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                    <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-white/10 shadow-sm">
                        <ActionButton icon={<User size={14} />} label="Scan Face" onClick={() => openCamera('person')} />
                        <ActionButton icon={<Package size={14} />} label="Scan Item" onClick={() => openCamera('object')} />
                        <div className="w-px h-4 bg-white/10 mx-0.5" />
                        <ActionButton icon={<UserPlus size={14} />} label="Enroll Person" onClick={onEnroll} />
                        <ActionButton icon={<PackagePlus size={14} />} label="Enroll Item" onClick={onEnrollObject} />
                    </div>

                    <p className="text-[11px] font-handwritten text-zinc-400 hidden sm:block">
                        Mavora Memory Companion
                    </p>
                </div>
            </div>

            {/* Embedded Camera Modal */}
            {showCamera && (
                <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md flex flex-col p-4">
                    <div className="flex items-center justify-between mb-3 text-white">
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider">
                            {cameraMode === 'person' ? "Face Scanner" : "Object Scanner"}
                        </h3>
                        <button 
                            onClick={() => setShowCamera(false)}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 bg-black">
                        <CameraView onCapture={handleCameraCapture} />
                    </div>
                </div>
            )}
        </div>
    );
}

const ActionButton = ({ icon, onClick, label }) => (
    <button
        onClick={onClick}
        title={label}
        className="px-2.5 py-1.5 hover:bg-white/10 rounded-lg text-zinc-300 hover:text-white transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
    >
        {icon}
        <span className="text-[11px] font-medium">{label}</span>
    </button>
);

export default ChatInterface;
