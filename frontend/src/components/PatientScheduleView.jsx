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
    X,
    Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStoredSchedule, saveStoredSchedule } from '../services/scheduleStore';

const PatientScheduleView = () => {
    const [schedule, setSchedule] = useState(getStoredSchedule());
    const [activeFilter, setActiveFilter] = useState('all');
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

    // 1. First time clicking: marks tablet as taken quietly
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
        setReassuranceMessage(null);
    };

    // 2. Repeated tap on ALREADY TAKEN button: reassurance notification + calming speech
    const handleAlreadyTakenClick = (item) => {
        const msg = `You already took your ${item.title} at ${item.takenAt || 'earlier today'}. You do not need to take it again. You are safe!`;
        setReassuranceMessage(msg);

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(msg);
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }

        setTimeout(() => {
            setReassuranceMessage(null);
        }, 7000);
    };

    const filteredItems = activeFilter === 'all' 
        ? schedule 
        : schedule.filter(s => s.slot === activeFilter);

    const todayStr = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
    });

    return (
        <div className="w-full h-full bg-[#000000] text-[#f4f4f2] flex flex-col p-4 md:p-8 overflow-y-auto">
            {/* Reality Orientation Banner - Minimal Black with Editorial Typography */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl w-full mx-auto mb-8 bg-[#0a0a0c] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
                {/* Subtle sheen highlight */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/[0.03] via-transparent to-transparent pointer-events-none" />

                <div className="relative z-10">
                    <span className="text-[11px] font-mono font-medium tracking-widest text-zinc-400 uppercase flex items-center gap-2 mb-2">
                        <Calendar size={13} className="text-zinc-300" /> Reality Orientation
                    </span>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                        Today is <span className="font-editorial italic font-normal text-zinc-100">{todayStr}</span>
                    </h1>
                    <p className="font-handwritten text-2xl text-zinc-300 mt-2 flex items-center gap-2 leading-relaxed">
                        <Heart size={16} className="text-zinc-400 flex-shrink-0" />
                        “You are safe at home. Your family has prepared your care schedule with love.”
                    </p>
                </div>

                <div className="bg-zinc-950 border border-white/10 px-6 py-4 rounded-2xl text-center shadow-md flex-shrink-0 relative z-10">
                    <p className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-widest">Current Time</p>
                    <p className="text-2xl md:text-3xl font-bold text-white font-mono mt-0.5 tracking-tight">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </motion.div>

            {/* Reassurance Popup Notification - Minimal Matte Toast */}
            <AnimatePresence>
                {reassuranceMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: -15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="max-w-4xl w-full mx-auto mb-6 bg-zinc-900 border border-white/20 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-2xl"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/10 rounded-xl text-white">
                                <Volume2 size={20} />
                            </div>
                            <div>
                                <p className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                                    Medicine Already Taken
                                </p>
                                <p className="font-handwritten text-xl text-zinc-100 mt-0.5">
                                    {reassuranceMessage}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setReassuranceMessage(null)}
                            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Slot Filter Buttons - Minimalist Monochrome Segmented Pills */}
            <div className="max-w-4xl w-full mx-auto mb-6 flex flex-wrap items-center gap-2">
                {[
                    { id: 'all', label: `All Events (${schedule.length})`, icon: Clock },
                    { id: 'morning', label: 'Morning', icon: Sun },
                    { id: 'afternoon', label: 'Afternoon', icon: SunMedium },
                    { id: 'night', label: 'Night', icon: Moon }
                ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeFilter === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveFilter(tab.id)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                                isActive 
                                    ? 'bg-white text-black shadow-sm' 
                                    : 'bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-white hover:border-white/25'
                            }`}
                        >
                            <Icon size={14} className={isActive ? 'text-black' : 'text-zinc-400'} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* List of Schedule & Medication Cards */}
            <div className="max-w-4xl w-full mx-auto space-y-3.5 pb-12">
                {filteredItems.map((item, index) => (
                    <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.04 }}
                        className={`p-5 rounded-2xl border transition-all ${
                            item.completed 
                                ? 'bg-[#0b0b0d] border-white/10 opacity-80' 
                                : 'bg-[#0e0e11] border-white/10 hover:border-white/20 shadow-lg'
                        }`}
                    >
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-start gap-3.5">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-zinc-300 flex-shrink-0 mt-0.5">
                                    {item.category === 'medicine' ? <Pill size={22} /> : <Clock size={22} />}
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-zinc-900 border border-white/10 text-zinc-300">
                                            {item.time}
                                        </span>
                                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                                            {item.slot} • {item.category}
                                        </span>
                                    </div>
                                    <h2 className="text-base md:text-lg font-bold text-white mt-1">
                                        {item.title}
                                    </h2>
                                    <p className="font-handwritten text-xl text-zinc-400 mt-1 max-w-xl leading-relaxed">
                                        “{item.notes}”
                                    </p>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="w-full md:w-auto flex flex-col items-end gap-1 flex-shrink-0">
                                {item.completed ? (
                                    <button
                                        onClick={() => handleAlreadyTakenClick(item)}
                                        className="w-full md:w-auto px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-emerald-500/40 rounded-xl flex items-center justify-center gap-2 text-emerald-400 font-semibold text-xs transition-all active:scale-95 cursor-pointer shadow-sm"
                                        title="Click to hear reassurance"
                                    >
                                        <CheckCircle2 size={16} className="text-emerald-400" />
                                        <span>Taken at {item.takenAt || 'Earlier'}</span>
                                    </button>
                                ) : item.category === 'medicine' ? (
                                    <button
                                        onClick={() => handleMarkTaken(item)}
                                        className="w-full md:w-auto px-5 py-2.5 bg-white hover:bg-zinc-200 text-black font-semibold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                                    >
                                        <CheckCircle2 size={16} />
                                        <span>Mark as Taken</span>
                                    </button>
                                ) : (
                                    <span className="text-xs text-zinc-500 font-mono px-3 py-1.5 bg-zinc-900 border border-white/5 rounded-lg">
                                        Routine Activity
                                    </span>
                                )}
                                {item.completed && (
                                    <span className="text-[10px] text-zinc-500 mr-1 font-mono">
                                        Confirmed by: {item.takenBy === 'family' ? 'Family Member' : 'Patient'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default PatientScheduleView;
