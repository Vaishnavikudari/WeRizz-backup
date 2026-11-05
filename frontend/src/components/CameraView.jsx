import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

export default function CameraView({ 
    onCapture, 
    isProcessing, 
    trigger, 
    isActive = true, 
    mode = 'person',
    onClose
}) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Watch for external programmatic trigger
    useEffect(() => {
        if (trigger && trigger > 0 && isActive) {
            capture();
        }
    }, [trigger, isActive]);

    useEffect(() => {
        if (isActive) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isActive]);

    const startCamera = async () => {
        setError(null);
        setIsLoading(true);
        try {
            // Modern WebRTC constraints for crisp visual capture
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user"
                },
                audio: false
            });

            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                try {
                    await videoRef.current.play();
                } catch (playErr) {
                    console.warn("Video autoplay prevented:", playErr);
                }
            }
            setIsLoading(false);
        } catch (err) {
            console.error("Camera access error:", err);
            setError("Could not access camera. Please allow camera permissions in your browser and try again.");
            setIsLoading(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capture = () => {
        if (!videoRef.current || !canvasRef.current) return;

        // Ensure video is playing and has data
        if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
            console.warn("Camera not ready for capture yet.");
            return;
        }

        const context = canvasRef.current.getContext('2d');
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        canvasRef.current.toBlob((blob) => {
            if (blob) {
                onCapture(blob);
            } else {
                console.error("Failed to create blob from canvas");
            }
        }, 'image/jpeg', 0.92);
    };

    return (
        <div className="relative w-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden rounded-3xl min-h-[460px] md:min-h-[540px]">
            {error ? (
                <div className="p-8 text-center flex flex-col items-center max-w-md mx-auto">
                    <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4">
                        <AlertCircle size={30} />
                    </div>
                    <h4 className="text-white text-base font-bold mb-2">Camera Access Required</h4>
                    <p className="text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
                        {error}
                    </p>
                    <button
                        onClick={startCamera}
                        className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/40 transition-all flex items-center gap-2"
                    >
                        <RefreshCw size={14} />
                        <span>Retry Camera Access</span>
                    </button>
                </div>
            ) : (
                <div className="relative w-full h-full min-h-[460px] md:min-h-[540px] flex items-center justify-center bg-black">
                    {/* Live Video Feed */}
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted
                        onLoadedMetadata={() => {
                            setIsLoading(false);
                            videoRef.current?.play().catch(() => {});
                        }}
                        className="w-full h-full object-cover min-h-[460px] md:min-h-[540px]" 
                    />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                    {/* Camera Loading Spinner */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-10 gap-3">
                            <RefreshCw className="animate-spin text-purple-400" size={32} />
                            <span className="text-xs font-semibold text-slate-300 tracking-wider uppercase">
                                Initializing Camera...
                            </span>
                        </div>
                    )}

                    {/* Futuristic HUD Scanning Reticle Overlay */}
                    {!isLoading && (
                        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                            <div className="w-64 h-64 sm:w-72 sm:h-72 border-2 border-emerald-400/40 rounded-3xl relative shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                                {/* Corner Brackets */}
                                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />

                                {/* Subtle Center Crosshair */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4">
                                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-emerald-400/60" />
                                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-emerald-400/60" />
                                </div>
                            </div>

                            <span className="mt-4 text-[11px] font-mono uppercase tracking-widest text-emerald-300 bg-slate-950/80 px-4 py-1.5 rounded-full border border-emerald-500/30 shadow-lg backdrop-blur-md">
                                {mode === 'person' ? 'Position Face In Focus Area' : 'Position Item In Focus Area'}
                            </span>
                        </div>
                    )}

                    {/* Controls Bar */}
                    <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center justify-center gap-2 z-20 pointer-events-auto">
                        <button
                            onClick={capture}
                            disabled={isProcessing || isLoading || !!error}
                            className="group relative flex items-center justify-center w-18 h-18 rounded-full bg-white text-slate-950 shadow-[0_0_35px_rgba(255,255,255,0.45)] hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Take Photo"
                        >
                            <span className="absolute inset-0 rounded-full border-4 border-slate-900/20 group-hover:border-emerald-500/50 transition-colors" />
                            {isProcessing ? (
                                <RefreshCw className="animate-spin text-slate-900" size={30} />
                            ) : (
                                <Camera size={32} className="text-slate-900 group-hover:scale-110 transition-transform" />
                            )}
                        </button>
                        <span className="text-[11px] font-semibold text-white/90 bg-slate-950/85 px-3.5 py-1 rounded-full border border-white/10 shadow-md backdrop-blur-md">
                            Tap to capture & scan
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
