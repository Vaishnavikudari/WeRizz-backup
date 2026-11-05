import React, { useState, useEffect } from 'react';
import { 
    Clock, 
    Pill, 
    CheckCircle2, 
    PlusCircle, 
    Trash2, 
    Sun, 
    SunMedium, 
    Moon, 
    Calendar,
    Undo2,
    ShieldAlert
} from 'lucide-react';
import { getStoredSchedule, saveStoredSchedule } from '../services/scheduleStore';

const CaregiverScheduleManager = () => {
    const [schedule, setSchedule] = useState(getStoredSchedule());
    const [showAddModal, setShowAddModal] = useState(false);

    // New schedule form state
    const [newTitle, setNewTitle] = useState('');
    const [newTime, setNewTime] = useState('09:00 AM');
    const [newSlot, setNewSlot] = useState('morning');
    const [newCategory, setNewCategory] = useState('medicine');
    const [newNotes, setNewNotes] = useState('');

    useEffect(() => {
        const handleUpdate = () => setSchedule(getStoredSchedule());
        window.addEventListener('storage_schedule_updated', handleUpdate);
        window.addEventListener('storage', handleUpdate);
        return () => {
            window.removeEventListener('storage_schedule_updated', handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, []);

    // Caregiver toggles taken / untaken
    const handleToggleGiven = (id) => {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const updated = schedule.map(s => {
            if (s.id === id) {
                const nextState = !s.completed;
                return {
                    ...s,
                    completed: nextState,
                    takenAt: nextState ? now : null,
                    takenBy: nextState ? 'family' : null
                };
            }
            return s;
        });
        saveStoredSchedule(updated);
        setSchedule(updated);
    };

    // Caregiver deletes an item
    const handleDelete = (id) => {
        const updated = schedule.filter(s => s.id !== id);
        saveStoredSchedule(updated);
        setSchedule(updated);
    };

    // Add new routine or medicine
    const handleAddItem = (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        const newItem = {
            id: `sch-${Date.now()}`,
            time: newTime,
            slot: newSlot,
            title: newTitle,
            category: newCategory,
            notes: newNotes || "Follow usual care instructions.",
            completed: false,
            takenAt: null,
            takenBy: null
        };

        const updated = [...schedule, newItem];
        saveStoredSchedule(updated);
        setSchedule(updated);
        setNewTitle('');
        setNewNotes('');
        setShowAddModal(false);
    };

    return (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl mt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-400">
                        <Pill size={24} />
                        <h2 className="text-xl font-bold text-white">
                            Medication & Daily Routine Management
                        </h2>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        Changes made here immediately synchronize with the patient's tablet and screen in real-time.
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                >
                    <PlusCircle size={16} /> Add Schedule / Pill
                </button>
            </div>

            {/* Modal for adding new routine */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-lg w-full shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-4">Add Daily Schedule or Medication</h3>
                        <form onSubmit={handleAddItem} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-300">Title / Medicine Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Donepezil 10mg or Afternoon Walk"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-300">Time</label>
                                    <input
                                        type="text"
                                        placeholder="08:30 AM"
                                        value={newTime}
                                        onChange={(e) => setNewTime(e.target.value)}
                                        className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-300">Slot</label>
                                    <select
                                        value={newSlot}
                                        onChange={(e) => setNewSlot(e.target.value)}
                                        className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="morning">Morning (🌅)</option>
                                        <option value="afternoon">Afternoon (☀️)</option>
                                        <option value="night">Night (🌙)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-300">Category</label>
                                <select
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="medicine">💊 Prescription Medicine</option>
                                    <option value="routine">⏰ Routine Activity / Habit</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-300">Instructions / Notes</label>
                                <textarea
                                    rows="2"
                                    placeholder="e.g. Take 1 tablet with warm milk after dinner"
                                    value={newNotes}
                                    onChange={(e) => setNewNotes(e.target.value)}
                                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500"
                                >
                                    Save to Schedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Caregiver Schedule Table */}
            <div className="space-y-3">
                {schedule.map((item) => (
                    <div 
                        key={item.id}
                        className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                            item.completed 
                                ? 'bg-slate-950/40 border-emerald-500/30' 
                                : 'bg-slate-950/80 border-slate-800'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${
                                item.category === 'medicine' ? 'bg-rose-500/10 text-rose-400' : 'bg-indigo-500/10 text-indigo-400'
                            }`}>
                                {item.category === 'medicine' ? <Pill size={20} /> : <Clock size={20} />}
                            </div>

                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                                        {item.time}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        {item.slot} • {item.category}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-white mt-0.5">
                                    {item.title}
                                </h4>
                                <p className="text-xs text-slate-400">
                                    {item.notes}
                                </p>
                            </div>
                        </div>

                        {/* Status & Overrides */}
                        <div className="flex items-center gap-3 self-end md:self-center">
                            {item.completed ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                                        <CheckCircle2 size={16} />
                                        Given at {item.takenAt} ({item.takenBy === 'family' ? 'Caregiver' : 'Patient'})
                                    </span>
                                    <button
                                        onClick={() => handleToggleGiven(item.id)}
                                        title="Mark as un-taken (undo)"
                                        className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800"
                                    >
                                        <Undo2 size={16} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleToggleGiven(item.id)}
                                    className="px-3 py-1.5 bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl hover:bg-emerald-600/40"
                                >
                                    Mark as Given by Family
                                </button>
                            )}

                            <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CaregiverScheduleManager;

