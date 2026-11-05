import React, { useState, useEffect } from 'react';
import { 
    Clock, 
    Pill, 
    CheckCircle2, 
    Sun, 
    SunMedium, 
    Moon, 
    Heart, 
    Calendar,
    AlertCircle,
    Info,
    X
} from 'lucide-react';
import { getStoredSchedule, saveStoredSchedule } from '../services/scheduleStore';

const PatientScheduleView = () => {
    const [schedule, setSchedule] = useState(getStoredSchedule());
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'morning', 'afternoon', 'night'
    const [reassuranceMessage, setReassuranceMessage] = useState(null);

    // Sync on updates from Family mode
    useEffect(() => {
        const handleUpdate = () => setSchedule(getStoredSchedule());
        window.addEventListener('storage_schedule_updated', handleUpdate);
        window.addEventListener('storage', handleUpdate);
        return () => {
            window.removeEventListener('storage_schedule_updated', handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, []);

    // 1. First time clicking: Quietly marks tablet as taken without popup annoyance
    const handleMarkTaken = (item) => {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const updated = schedule.map(s => {
            if (s.id === item.id) {
                return {
                    ...s,
                    completed: true,
                    takenAt: now,
                    takenBy: 'patient'
                };
            }
            return s;
        });

        saveStoredSchedule(updated);
        setSchedule(updated);
        // Clear any old popups
        setReassuranceMessage(null);
    };

    // 2. ONLY when patient taps on the ALREADY TAKEN button again: trigger reassurance notification!
    const handleAlreadyTakenClick = (item) => {
        const msg = `You already took your ${item.title} at ${item.takenAt || 'earlier today'}. You do not need to take it again. You are safe!`;
        setReassuranceMessage(msg);

        // Friendly soothing voice feedback
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop any pending speech
            const utterance = new SpeechSynthesisUtterance(msg);
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }

        // Auto dismiss after 6 seconds
        setTimeout(() => {
            setReassuranceMessage(null);
        }, 6000);
    };

    // Filter items
    const filteredItems = activeFilter === 'all' 
        ? schedule 
        : schedule.filter(s => s.slot === activeFilter);

    // Today's formatted date
    const todayStr = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
    });

    return (
        <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col p-4 md:p-8 overflow-y-auto">
            {/* Reality Orientation Banner */}
            <div className="max-w-4xl w-full mx-auto mb-8 bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase flex items-center gap-1.5 mb-1.5">
                        <Calendar size={15} /> Reality Orientation
                    </span>
                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                        Today is {todayStr}
                    </h1>
                    <p className="text-sm text-indigo-200/80 mt-2 flex items-center gap-2">
                        <Heart size={16} className="text-rose-400 flex-shrink-0" />
                        You are safe at home. Your family has prepared your care schedule below.
                    </p>
                </div>
                <div className="bg-indigo-950/90 border border-indigo-500/50 px-6 py-4 rounded-2xl text-center shadow-lg flex-shrink-0">
                    <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Current Time</p>
                    <p className="text-2xl md:text-3xl font-black text-white font-mono mt-0.5">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>

            {/* Reassurance Popup Notification - ONLY SHOWS ON REPEATED CLICK */}
            {reassuranceMessage && (
                <div className="max-w-4xl w-full mx-auto mb-8 bg-emerald-950 border-2 border-emerald-400 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-[0_0_25px_rgba(52,211,153,0.3)] animate-in fade-in slide-in-from-top duration-300">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-full text-emerald-400">
                            <Info size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                                Medicine Already Recorded
                            </p>
                            <p className="text-sm font-semibold text-emerald-100 mt-0.5">
                                {reassuranceMessage}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setReassuranceMessage(null)}
                        className="text-emerald-400 hover:text-white p-1"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Slot Filter Buttons with clean spacing and wrapping */}
            <div className="max-w-4xl w-full mx-auto mb-8 flex flex-wrap items-center gap-3 py-1">
                <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        activeFilter === 'all' 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                >
                    <Clock size={16} /> All Events ({schedule.length})
                </button>
                <button
                    onClick={() => setActiveFilter('morning')}
                    className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        activeFilter === 'morning' 
                            ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' 
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                >
                    <Sun size={16} className="text-amber-400" /> Morning
                </button>
                <button
                    onClick={() => setActiveFilter('afternoon')}
                    className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        activeFilter === 'afternoon' 
                            ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30' 
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                >
                    <SunMedium size={16} className="text-orange-400" /> Afternoon
                </button>
                <button
                    onClick={() => setActiveFilter('night')}
                    className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        activeFilter === 'night' 
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' 
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                >
                    <Moon size={16} className="text-purple-400" /> Night
                </button>
            </div>

            {/* List of Schedule & Medication Cards */}
            <div className="max-w-4xl w-full mx-auto space-y-4 pb-12">
                {filteredItems.map((item) => (
                    <div 
                        key={item.id}
                        className={`p-6 rounded-2xl border transition-all ${
                            item.completed 
                                ? 'bg-slate-900/60 border-emerald-500/40 opacity-90' 
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-xl'
                        }`}
                    >
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className={`p-3.5 rounded-2xl flex-shrink-0 ${
                                    item.category === 'medicine' 
                                        ? (item.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400')
                                        : 'bg-indigo-500/20 text-indigo-400'
                                }`}>
                                    {item.category === 'medicine' ? <Pill size={28} /> : <Clock size={28} />}
                                </div>

                                <div>
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                                            {item.time}
                                        </span>
                                        <span className={`text-xs font-bold uppercase tracking-wider ${
                                            item.category === 'medicine' ? 'text-rose-400' : 'text-indigo-400'
                                        }`}>
                                            {item.category}
                                        </span>
                                    </div>
                                    <h2 className="text-lg md:text-xl font-bold text-white mt-1.5">
                                        {item.title}
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                                        {item.notes}
                                    </p>
                                </div>
                            </div>

                            {/* Action Button: Took / Already Taken */}
                            <div className="w-full md:w-auto flex flex-col items-end gap-1 flex-shrink-0">
                                {item.completed ? (
                                    /* CLICKING THIS ALREADY TAKEN BADGE TRIGGERS THE REASSURANCE POPUP + VOICE */
                                    <button
                                        onClick={() => handleAlreadyTakenClick(item)}
                                        className="w-full md:w-auto px-5 py-3 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/60 rounded-2xl flex items-center justify-center gap-2 text-emerald-300 font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                                        title="Click to check details"
                                    >
                                        <CheckCircle2 size={20} className="text-emerald-400" />
                                        <span>
                                            Already Taken at {item.takenAt || 'Earlier'}
                                        </span>
                                    </button>
                                ) : item.category === 'medicine' ? (
                                    /* FIRST CLICK: TAKES THE TABLET SILENTLY WITHOUT ANNOYING POPUP */
                                    <button
                                        onClick={() => handleMarkTaken(item)}
                                        className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
                                    >
                                        <CheckCircle2 size={18} />
                                        Yes, I Took This Pill
                                    </button>
                                ) : (
                                    <span className="text-xs text-slate-500 font-semibold px-4 py-2 bg-slate-800/60 rounded-xl">
                                        Scheduled Routine
                                    </span>
                                )}
                                {item.completed && (
                                    <span className="text-[10px] text-slate-500 mr-2">
                                        Confirmed by: {item.takenBy === 'family' ? 'Family Member' : 'Patient'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PatientScheduleView;
