import React, { useState, useEffect } from 'react';
import { ShieldCheck, Phone, Navigation, Home, Volume2, ArrowLeft, Heart, MapPin, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const PatientLostView = ({ onSpeakText, onBack }) => {
    const [patientLoc, setPatientLoc] = useState({ lat: 12.9725, lng: 77.5955 });
    const [homeLocation, setHomeLocation] = useState(() => {
        try {
            const saved = localStorage.getItem('mavora_home_loc') || localStorage.getItem('masthishq_home_loc');
            return saved ? JSON.parse(saved) : { lat: 12.9716, lng: 77.5946, address: "Home: 4th Cross, Green Park, Bangalore" };
        } catch (e) {
            return { lat: 12.9716, lng: 77.5946, address: "Home: 4th Cross, Green Park, Bangalore" };
        }
    });

    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setPatientLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.log("GPS err:", err)
            );
        }
    }, []);

    const calmingMessage = "Please take a deep breath. You are completely safe. Your family has been notified and knows your exact location. Stay right where you are or follow the walking directions home.";

    const handleSpeakCalm = () => {
        if (onSpeakText) onSpeakText(calmingMessage);
    };

    const handleOpenDirections = () => {
        const url = `https://www.google.com/maps/dir/?api=1&origin=${patientLoc.lat},${patientLoc.lng}&destination=${homeLocation.lat},${homeLocation.lng}&travelmode=walking`;
        window.open(url, '_blank');
        if (onSpeakText) onSpeakText("Opening walking directions home. Walk carefully and stay on the sidewalk.");
    };

    return (
        <div className="h-full w-full overflow-y-auto px-4 py-6 md:p-8 flex flex-col items-center select-none bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="w-full max-w-3xl space-y-6">

                {/* Back button */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
                    >
                        <ArrowLeft size={16} />
                        <span>Back to Dashboard</span>
                    </button>
                    <span className="text-xs font-bold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <AlertTriangle size={14} />
                        Assistance Mode Active
                    </span>
                </div>

                {/* Main Comfort Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-indigo-950/60 border border-emerald-500/30 backdrop-blur-xl shadow-2xl text-center space-y-4"
                >
                    <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                        <ShieldCheck size={36} />
                    </div>

                    <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                        You Are Completely Safe.
                    </h1>

                    <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                        Do not worry if you feel disoriented. MAVORA knows where you are and your family is watching over you.
                    </p>

                    <button
                        onClick={handleSpeakCalm}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-sm font-bold inline-flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all active:scale-95 cursor-pointer"
                    >
                        <Volume2 size={18} />
                        <span>Listen to Reassuring Voice</span>
                    </button>
                </motion.div>

                {/* Action Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Guide Me Home Card */}
                    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 flex flex-col justify-between shadow-lg">
                        <div className="space-y-2">
                            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit border border-indigo-500/20">
                                <Navigation size={24} />
                            </div>
                            <h3 className="text-base font-bold text-white">Guide Me Home</h3>
                            <p className="text-xs text-slate-400">
                                {homeLocation.address}
                            </p>
                        </div>
                        <button
                            onClick={handleOpenDirections}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-900/40 transition-all active:scale-95 cursor-pointer"
                        >
                            <MapPin size={16} />
                            <span>Start Walking Navigation</span>
                        </button>
                    </div>

                    {/* Emergency Family Call Card */}
                    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 flex flex-col justify-between shadow-lg">
                        <div className="space-y-2">
                            <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl w-fit border border-pink-500/20">
                                <Phone size={24} />
                            </div>
                            <h3 className="text-base font-bold text-white">Call Family Caregiver</h3>
                            <p className="text-xs text-slate-400">
                                Primary Contact: Rahul (Son) • +91 98765 43210
                            </p>
                        </div>
                        <a
                            href="tel:+919876543210"
                            className="w-full py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-pink-900/40 transition-all active:scale-95 cursor-pointer text-center"
                        >
                            <Phone size={16} />
                            <span>One-Tap Call Family</span>
                        </a>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 text-center">
                    <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                        <Heart size={14} className="text-pink-400" />
                        MAVORA Safety Monitoring is running live in the background.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PatientLostView;

