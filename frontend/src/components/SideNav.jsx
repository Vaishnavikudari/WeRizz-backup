import React from 'react';
import { Home, Users, Settings, MapPin, Brain, Calendar, LogOut, Compass } from 'lucide-react';

const NavBar = ({ onViewChange, currentView, onOpenVoiceSettings }) => {
    // Check if currently inside Patient Mode or Family Mode
    const isPatientSession = currentView === 'patient' || currentView === 'greeting' || currentView === 'patient_schedule' || currentView === 'patient_lost' || currentView === 'patient_gps';
    const isFamilySession = currentView === 'caregiver' || currentView === 'tracking';

    return (
        <>
            <header className="topnav">
                <div className="nav-brand" onClick={() => onViewChange('landing')} style={{ cursor: 'pointer' }}>
                    <Brain size={22} color="#f4f4f2" strokeWidth={1.75} />
                    <span className="brand-text">Mavora</span>
                    {isPatientSession && (
                        <span className="mode-badge">Patient Space</span>
                    )}
                    {isFamilySession && (
                        <span className="mode-badge">Caregiver Portal</span>
                    )}
                </div>

                <nav className="nav-links">
                    {/* 1. If in Patient Mode: ONLY SHOW PATIENT SAFE PAGES */}
                    {isPatientSession && (
                        <>
                            <button 
                                className={`nav-item ${currentView === 'patient' ? 'active' : ''}`} 
                                onClick={() => onViewChange('patient')}
                            >
                                <Users size={16} strokeWidth={1.5} />
                                <span>Voice Assistant & Chat</span>
                            </button>

                            <button 
                                className={`nav-item ${currentView === 'patient_schedule' ? 'active' : ''}`} 
                                onClick={() => onViewChange('patient_schedule')}
                            >
                                <Calendar size={16} strokeWidth={1.5} />
                                <span>My Day & Medicine</span>
                            </button>

                            <button 
                                className={`nav-item ${currentView === 'patient_gps' || currentView === 'patient_lost' ? 'active' : ''}`} 
                                onClick={() => onViewChange('patient_gps')}
                                title="Patient Live GPS & Take Me Home"
                            >
                                <Compass size={16} strokeWidth={1.5} />
                                <span>Live GPS & Safety</span>
                            </button>

                            <button 
                                className="nav-item exit-item" 
                                onClick={() => onViewChange('landing')}
                                title="Exit to Home"
                            >
                                <LogOut size={15} strokeWidth={1.5} />
                                <span>Exit</span>
                            </button>
                        </>
                    )}

                    {/* 2. If in Family Mode: ONLY SHOW FAMILY CONTROLS */}
                    {isFamilySession && (
                        <>
                            <button 
                                className={`nav-item ${currentView === 'caregiver' ? 'active' : ''}`} 
                                onClick={() => onViewChange('caregiver')}
                            >
                                <Settings size={16} strokeWidth={1.5} />
                                <span>Family Dashboard</span>
                            </button>

                            <button 
                                className={`nav-item ${currentView === 'tracking' ? 'active' : ''}`} 
                                onClick={() => onViewChange('tracking')}
                            >
                                <MapPin size={16} strokeWidth={1.5} />
                                <span>GPS Tracker</span>
                            </button>

                            <button 
                                className="nav-item exit-item" 
                                onClick={() => onViewChange('landing')}
                                title="Exit to Home"
                            >
                                <LogOut size={15} strokeWidth={1.5} />
                                <span>Exit</span>
                            </button>
                        </>
                    )}

                    {/* 3. If on Landing/Login: Standard Entry Nav */}
                    {!isPatientSession && !isFamilySession && (
                        <>
                            <button 
                                className={`nav-item ${currentView === 'landing' ? 'active' : ''}`} 
                                onClick={() => onViewChange('landing')}
                            >
                                <Home size={16} strokeWidth={1.5} />
                                <span>Home</span>
                            </button>

                            <button 
                                className="nav-item patient-launch" 
                                onClick={() => onViewChange('patient')}
                            >
                                <Users size={15} strokeWidth={1.75} />
                                <span>Enter Patient Mode</span>
                            </button>

                            <button 
                                className="nav-item family-launch" 
                                onClick={() => onViewChange('caregiver')}
                            >
                                <Settings size={15} strokeWidth={1.5} />
                                <span>Family Login</span>
                            </button>
                        </>
                    )}
                </nav>
            </header>

            <style>{`
        .topnav {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 70px;
            background: #0b0b0c;
            border-bottom: 1px solid rgba(244, 244, 242, 0.10);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 32px;
            z-index: 1000;
        }
        .nav-brand {
            display: flex;
            align-items: center;
            gap: 10px;
            user-select: none;
        }
        .brand-text {
            font-size: 1.15rem;
            font-weight: 600;
            letter-spacing: -0.01em;
            color: #f4f4f2;
        }
        .mode-badge {
            font-size: 0.68rem;
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            padding: 2px 8px;
            border-radius: 4px;
            color: #8d8d92;
            border: 1px solid rgba(244, 244, 242, 0.12);
            background: #141415;
        }
        
        .nav-links {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .nav-item {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 7px 14px;
            border-radius: 6px;
            cursor: pointer;
            color: #8d8d92;
            font-weight: 500;
            transition: color 150ms ease-out, background-color 150ms ease-out;
            font-size: 0.82rem;
            border: 1px solid transparent;
            background: transparent;
            white-space: nowrap;
        }
        .nav-item:hover {
            background: rgba(244, 244, 242, 0.05);
            color: #f4f4f2;
        }
        .nav-item.active {
            background: #18181b;
            color: #f4f4f2;
            border-color: rgba(244, 244, 242, 0.12);
        }
        .patient-launch {
            background: #f4f4f2;
            color: #0b0b0c;
            font-weight: 500;
            border: 1px solid #f4f4f2;
        }
        .patient-launch:hover {
            background: #e2e2e0;
            color: #0b0b0c;
        }
        .family-launch {
            background: transparent;
            color: #f4f4f2;
            border: 1px solid rgba(244, 244, 242, 0.18);
        }
        .family-launch:hover {
            background: rgba(244, 244, 242, 0.05);
            color: #f4f4f2;
            border-color: rgba(244, 244, 242, 0.30);
        }
        .exit-item {
            color: #8d8d92;
        }
        .exit-item:hover {
            color: #f87171;
            background: rgba(239, 68, 68, 0.08);
        }
      `}</style>
        </>
    );
};

export default NavBar;
