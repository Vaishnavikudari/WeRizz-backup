import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft,
    MapPin, 
    Navigation, 
    AlertTriangle, 
    ShieldCheck, 
    PhoneCall, 
    Compass, 
    Home, 
    RefreshCw,
    Volume2,
    Heart
} from 'lucide-react';

const PatientTracking = ({ userRole = 'family', onBack, onSpeakText }) => {
    const isPatient = userRole === 'patient';

    // Default safe home location (persisted in localStorage)
    const [homeLocation, setHomeLocation] = useState(() => {
        try {
            const saved = localStorage.getItem('mavora_home_loc') || localStorage.getItem('masthishq_home_loc');
            return saved ? JSON.parse(saved) : { lat: 12.9716, lng: 77.5946, address: "Home: 4th Cross, Green Park, Bangalore" };
        } catch (e) {
            return { lat: 12.9716, lng: 77.5946, address: "Home: 4th Cross, Green Park, Bangalore" };
        }
    });

    const [safeRadius, setSafeRadius] = useState(() => {
        const saved = localStorage.getItem('mavora_safe_radius');
        return saved ? parseInt(saved) : 150; // 150 meters default
    });

    // Patient current live location
    const [patientLoc, setPatientLoc] = useState({
        lat: 12.9725,
        lng: 77.5955,
        accuracy: 10,
        lastUpdated: new Date().toLocaleTimeString()
    });

    const [isSimulated, setIsSimulated] = useState(false);
    const [alertMuted, setAlertMuted] = useState(false);

    // Calculate distance between two coordinates in meters (Haversine formula)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // Earth radius in meters
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
    };

    const currentDistance = calculateDistance(
        homeLocation.lat,
        homeLocation.lng,
        patientLoc.lat,
        patientLoc.lng
    );

    const isWandering = currentDistance > safeRadius;

    // Browser Geolocation Live Tracking
    useEffect(() => {
        if ('geolocation' in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    if (!isSimulated) {
                        setPatientLoc({
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude,
                            accuracy: Math.round(pos.coords.accuracy),
                            lastUpdated: new Date().toLocaleTimeString()
                        });
                    }
                },
                (err) => console.log("Geolocation tracking notice:", err.message),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );

            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, [isSimulated]);

    // Set current position as Home (Caregiver only)
    const handleSetCurrentAsHome = () => {
        const newHome = {
            lat: patientLoc.lat,
            lng: patientLoc.lng,
            address: `Saved Home (${patientLoc.lat.toFixed(4)}, ${patientLoc.lng.toFixed(4)})`
        };
        setHomeLocation(newHome);
        localStorage.setItem('mavora_home_loc', JSON.stringify(newHome));
    };

    // Simulate wandering outside safe zone for demo (Caregiver only)
    const toggleSimulateWander = () => {
        if (!isSimulated) {
            setIsSimulated(true);
            setPatientLoc({
                lat: homeLocation.lat + 0.0032,
                lng: homeLocation.lng + 0.0035,
                accuracy: 5,
                lastUpdated: new Date().toLocaleTimeString()
            });
        } else {
            setIsSimulated(false);
            setPatientLoc({
                lat: homeLocation.lat + 0.0002,
                lng: homeLocation.lng + 0.0002,
                accuracy: 8,
                lastUpdated: new Date().toLocaleTimeString()
            });
        }
    };

    // Guide Me Home Action for Patient
    const handleGuideHome = () => {
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${patientLoc.lat},${patientLoc.lng}&destination=${homeLocation.lat},${homeLocation.lng}&travelmode=walking`;
        window.open(mapsUrl, '_blank');
        
        const spoken = "Opening walking directions to take you safely back home. Please follow the map and walk carefully. You are completely safe.";
        if (onSpeakText) {
            onSpeakText(spoken);
        } else if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(spoken);
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    // Patient Calming Audio Reassurance
    const handleCalmingVoice = () => {
        const reassurance = `Please take a deep breath. You are completely safe. Your family is aware of your location. You are only ${currentDistance} meters from home. You can tap Guide Me Home to walk back or call your family anytime.`;
        if (onSpeakText) {
            onSpeakText(reassurance);
        } else if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(reassurance);
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col p-4 md:p-8 overflow-y-auto">
            {/* Top Header */}
            <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    {isPatient && onBack && (
                        <button
                            onClick={onBack}
                            className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 border border-white/10 transition-colors mr-2 cursor-pointer"
                            title="Return to Voice Assistant"
                        >
                            <ArrowLeft size={16} />
                            <span>Back to Assistant</span>
                        </button>
                    )}
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl border ${isPatient ? 'bg-purple-500/20 border-purple-500/40 text-purple-400' : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'}`}>
                            {isPatient ? <Compass size={28} /> : <ShieldCheck size={28} />}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">
                                {isPatient ? "Patient Live Location & Safety Guide" : "Family GPS Tracker & Safety Geofence"}
                            </h1>
                            <p className="text-xs text-slate-400">
                                {isPatient 
                                    ? "Real-time location, safe zone status, and one-tap walking directions to your home." 
                                    : "Real-time location monitoring, geofence radius settings, and autonomous wandering alerts."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Pill (No toggle buttons!) */}
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3.5 py-1.5 rounded-full border flex items-center gap-2 ${
                        isPatient 
                            ? 'bg-purple-900/40 border-purple-500/40 text-purple-300' 
                            : 'bg-indigo-900/40 border-indigo-500/40 text-indigo-300'
                    }`}>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {isPatient ? "Patient Mode" : "Caregiver Portal"}
                    </span>
                </div>
            </div>

            {/* CRITICAL WANDERING ALERT BANNER */}
            {isWandering && !alertMuted && (
                <div className="max-w-6xl w-full mx-auto mb-6 bg-red-950/80 border-2 border-red-500/80 rounded-2xl p-4 md:p-6 shadow-[0_0_30px_rgba(239,68,68,0.35)] animate-pulse flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-500/20 rounded-full text-red-400 flex-shrink-0">
                            <AlertTriangle size={36} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-red-200">
                                {isPatient 
                                    ? "⚠️ You are outside your usual home area" 
                                    : "⚠️ WANDERING ALERT: Patient has crossed safe perimeter!"}
                            </h2>
                            <p className="text-sm text-red-300/80">
                                {isPatient 
                                    ? `You are currently ${currentDistance} meters from home. Please stay calm. You can tap 'Guide Me Home' to walk back or call family.` 
                                    : `Patient is currently ${currentDistance} meters from Home (Safe limit is ${safeRadius}m). Immediate attention recommended.`}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        {isPatient ? (
                            <button
                                onClick={handleGuideHome}
                                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 text-sm shadow-md cursor-pointer"
                            >
                                <Navigation size={18} /> Guide Me Home
                            </button>
                        ) : (
                            <a 
                                href="tel:911"
                                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center gap-2 text-sm shadow-md"
                            >
                                <PhoneCall size={18} /> Call Caregiver
                            </a>
                        )}
                        <button
                            onClick={() => setAlertMuted(true)}
                            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl cursor-pointer"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT AREA */}
            <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT / CENTER: INTERACTIVE LIVE MAP & STATUS */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Embedded Live Map Display */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative shadow-xl min-h-[420px] flex flex-col">
                        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MapPin size={18} className={isWandering ? "text-red-400 animate-bounce" : "text-emerald-400"} />
                                <span className="font-semibold text-sm">
                                    {isPatient ? "Your Real-Time Location" : "Live GPS Map View"}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                                    Updated {patientLoc.lastUpdated}
                                </span>
                            </div>

                            {/* Demo Simulator button: ONLY SHOWN FOR FAMILY MODE */}
                            {!isPatient && (
                                <button
                                    onClick={toggleSimulateWander}
                                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                                        isSimulated 
                                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
                                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                                    }`}
                                >
                                    <RefreshCw size={12} className={isSimulated ? "animate-spin" : ""} />
                                    {isSimulated ? "Reset to Home" : "Simulate Wandering Away"}
                                </button>
                            )}
                        </div>

                        {/* OpenStreetMap Iframe showing patient live marker */}
                        <div className="relative flex-1 w-full h-[360px] bg-slate-950">
                            <iframe
                                title="Patient Live Location Map"
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                scrolling="no"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${patientLoc.lng - 0.005}%2C${patientLoc.lat - 0.003}%2C${patientLoc.lng + 0.005}%2C${patientLoc.lat + 0.003}&layer=mapnik&marker=${patientLoc.lat}%2C${patientLoc.lng}`}
                                style={{ filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
                            />

                            {/* Overlay Badge on Map */}
                            <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 p-3 rounded-xl shadow-lg flex items-center gap-3">
                                <div className={`w-3.5 h-3.5 rounded-full ${isWandering ? 'bg-red-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                                <div className="text-xs">
                                    <p className="font-bold text-slate-200">
                                        {isWandering ? "Outside Safe Zone" : "Inside Safe Zone"}
                                    </p>
                                    <p className="text-slate-400">
                                        {currentDistance}m from Home Base
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Map Footer Bar */}
                        <div className="p-3 bg-slate-900/80 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                            <span>Lat: {patientLoc.lat.toFixed(5)}, Lng: {patientLoc.lng.toFixed(5)}</span>
                            <span>GPS Accuracy: ±{patientLoc.accuracy}m</span>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${patientLoc.lat},${patientLoc.lng}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                            >
                                Open in Google Maps ↗
                            </a>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: DEDICATED ROLES */}
                <div className="flex flex-col gap-6">

                    {/* 1. ONLY PATIENT VIEW IN PATIENT MODE */}
                    {isPatient && (
                        <div className="bg-gradient-to-b from-purple-950/40 via-slate-900 to-slate-900 border-2 border-purple-500/40 rounded-2xl p-6 shadow-xl flex flex-col justify-between h-full space-y-6">
                            <div>
                                <div className="flex items-center gap-2 text-purple-400 mb-2">
                                    <Compass size={24} />
                                    <span className="font-bold text-sm tracking-wide uppercase">Patient Assistance</span>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">
                                    Are you feeling lost?
                                </h3>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    Don't worry. Your family is aware and you are completely safe. Tap below anytime and we will walk back home together step-by-step.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {/* Giant Guide Me Home Button */}
                                <button
                                    onClick={handleGuideHome}
                                    className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xl rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-3 transition-all transform active:scale-95 cursor-pointer"
                                >
                                    <Navigation size={28} />
                                    Guide Me Home
                                </button>

                                {/* Spoken Voice Reassurance Button */}
                                <button
                                    onClick={handleCalmingVoice}
                                    className="w-full py-3 bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 font-bold text-sm rounded-xl border border-purple-500/40 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                                >
                                    <Volume2 size={18} />
                                    Hear Calming Voice
                                </button>

                                {/* Quick Family Call */}
                                <a
                                    href="tel:911"
                                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <PhoneCall size={16} className="text-emerald-400" />
                                    Call Family / Caregiver
                                </a>

                                {/* Registered Home Address */}
                                <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                                    <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                                        <Home size={14} className="text-purple-400" />
                                        <span>Registered Home Address:</span>
                                    </div>
                                    <p className="text-slate-400">{homeLocation.address}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. ONLY FAMILY VIEW IN FAMILY MODE */}
                    {!isPatient && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                                    <ShieldCheck size={24} />
                                    <span className="font-bold text-sm tracking-wide uppercase">Caregiver Geofencing</span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">
                                    Safe Zone Settings
                                </h3>
                                <p className="text-xs text-slate-400 mb-4">
                                    Customize the safe radius around home. If the patient walks past this boundary, automatic wandering alerts trigger immediately.
                                </p>

                                {/* Safe Radius Slider */}
                                <div className="space-y-2 bg-slate-950/70 p-4 rounded-xl border border-slate-800 mb-4">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-slate-300">Safe Boundary Radius:</span>
                                        <span className="text-indigo-400 font-bold">{safeRadius} Meters</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="50"
                                        max="1000"
                                        step="25"
                                        value={safeRadius}
                                        onChange={(e) => {
                                            setSafeRadius(parseInt(e.target.value));
                                            localStorage.setItem('mavora_safe_radius', e.target.value);
                                        }}
                                        className="w-full accent-indigo-500 cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-500">
                                        <span>50m (House)</span>
                                        <span>500m (Neighbourhood)</span>
                                        <span>1000m (Subdistrict)</span>
                                    </div>
                                </div>

                                {/* Set Current Location as Home Base */}
                                <button
                                    onClick={handleSetCurrentAsHome}
                                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                                >
                                    <Home size={16} className="text-indigo-400" />
                                    Save Current Spot as "Home Base"
                                </button>
                            </div>

                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                                    <p className="text-[11px] text-slate-400">Current Status</p>
                                    <p className={`text-sm font-bold mt-1 ${isWandering ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {isWandering ? 'Wandering Alert' : 'Safe at Home'}
                                    </p>
                                </div>
                                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                                    <p className="text-[11px] text-slate-400">Distance from Home</p>
                                    <p className="text-sm font-bold text-slate-200 mt-1">
                                        {currentDistance} meters
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default PatientTracking;
