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
        <div className="w-full h-full bg-[#0b0b0c] text-[#f4f4f2] flex flex-col p-4 md:p-8 overflow-y-auto">
            {/* Reality Orientation Banner - The Seasons & Instrument Serif Typography */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl w-full mx-auto mb-8 bg-[#121214] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
                <div className="relative z-10">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[#8d8d92] mb-3 flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#8d8d92]" /> Memory care companion • Reality orientation
                    </span>
                    <h1 
                        className="font-serif text-3xl sm:text-4xl md:text-[44px] text-[#f4f4f2] tracking-[-0.025em] leading-[1.08] mb-3"
                        style={{ fontFamily: '"The Seasons", "Instrument Serif", Georgia, serif' }}
                    >
                        Today is <span className="italic text-[#9b8afb]">{todayStr}</span>
                    </h1>
                    <p className="text-[#8d8d92] text-sm sm:text-base leading-[1.6] max-w-xl">
                        Mavora is keeping track of your daily routine. You are safe at home with your loved ones.
                    </p>
                </div>

                <div className="bg-[#0b0b0c] border border-white/10 px-6 py-4 rounded-xl text-center shadow-md flex-shrink-0 relative z-10">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-[#8d8d92]">Current Time</p>
                    <p className="text-2xl sm:text-3xl font-mono font-medium text-[#f4f4f2] mt-0.5 tracking-tight">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </motion.div>

            {/* Reassurance Popup Notification */}
            <AnimatePresence>
                {reassuranceMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: -15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="max-w-4xl w-full mx-auto mb-6 bg-[#16161a] border border-[#9b8afb]/30 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-2xl"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-[#9b8afb]/10 rounded-xl text-[#9b8afb]">
                                <Volume2 size={20} />
                            </div>
                            <div>
                                <p className="font-mono text-[10px] uppercase tracking-wider text-[#9b8afb]">
                                    Already Recorded
                                </p>
                                <p 
                                    className="font-serif text-lg text-[#f4f4f2] mt-0.5"
                                    style={{ fontFamily: '"The Seasons", "Instrument Serif", Georgia, serif' }}
                                >
                                    <span className="italic text-[#9b8afb]">“{reassuranceMessage}”</span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setReassuranceMessage(null)}
                            className="text-[#8d8d92] hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Slot Filter Buttons */}
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
                            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                                isActive 
                                    ? 'bg-[#f4f4f2] text-[#0b0b0c] shadow-sm font-semibold' 
                                    : 'bg-[#121214] border border-white/10 text-[#8d8d92] hover:text-[#f4f4f2] hover:border-white/20'
                            }`}
                        >
                            <Icon size={13} className={isActive ? 'text-[#0b0b0c]' : 'text-[#8d8d92]'} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* List of Schedule Cards */}
            <div className="max-w-4xl w-full mx-auto space-y-3 pb-12">
                {filteredItems.map((item, index) => (
                    <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.04 }}
                        className={`p-5 rounded-2xl border transition-all ${
                            item.completed 
                                ? 'bg-[#0f0f11] border-white/5 opacity-80' 
                                : 'bg-[#121214] border-white/10 hover:border-white/20 shadow-md'
                        }`}
                    >
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-start gap-3.5">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[#f4f4f2] flex-shrink-0 mt-0.5">
                                    {item.category === 'medicine' ? <Pill size={20} /> : <Clock size={20} />}
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-[#0b0b0c] border border-white/10 text-[#8d8d92]">
                                            {item.time}
                                        </span>
                                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#8d8d92]">
                                            {item.slot} • {item.category}
                                        </span>
                                    </div>
                                    <h2 
                                        className="font-serif text-xl font-normal text-[#f4f4f2] mt-1"
                                        style={{ fontFamily: '"The Seasons", "Instrument Serif", Georgia, serif' }}
                                    >
                                        {item.title}
                                    </h2>
                                    <p 
                                        className="font-serif text-base text-[#9b8afb] mt-0.5 italic"
                                        style={{ fontFamily: '"The Seasons", "Instrument Serif", Georgia, serif' }}
                                    >
                                        “{item.notes}”
                                    </p>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="w-full md:w-auto flex flex-col items-end gap-1 flex-shrink-0">
                                {item.completed ? (
                                    <button
                                        onClick={() => handleAlreadyTakenClick(item)}
                                        className="w-full md:w-auto px-4 py-2 bg-[#0b0b0c] hover:bg-[#141416] border border-[#9b8afb]/30 rounded-xl flex items-center justify-center gap-2 text-[#9b8afb] font-medium text-xs transition-all active:scale-95 cursor-pointer shadow-sm"
                                    >
                                        <CheckCircle2 size={15} />
                                        <span>Taken at {item.takenAt || 'Earlier'}</span>
                                    </button>
                                ) : item.category === 'medicine' ? (
                                    <button
                                        onClick={() => handleMarkTaken(item)}
                                        className="w-full md:w-auto px-5 py-2.5 bg-[#f4f4f2] hover:bg-[#e2e2e0] text-[#0b0b0c] font-medium text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                                    >
                                        <CheckCircle2 size={15} />
                                        <span>Mark as Taken</span>
                                    </button>
                                ) : (
                                    <span className="font-mono text-[10px] text-[#8d8d92] px-3 py-1.5 bg-[#0b0b0c] border border-white/5 rounded-lg">
                                        Scheduled Routine
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
