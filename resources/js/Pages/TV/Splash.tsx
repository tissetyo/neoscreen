import { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';

interface SplashProps {
    hotel: {
        name: string;
        slug: string;
        startup_video_url: string | null;
        featured_image_url: string | null;
        default_background_url: string | null;
    };
    room: {
        code: string;
        guest_name: string | null;
        is_occupied: boolean;
    };
}

type Phase = 'video' | 'welcome' | 'pin';

const youtubeEmbedUrl = (url: string | null) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{6,})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}&controls=0&rel=0&modestbranding=1` : null;
};

export default function Splash({ hotel, room }: SplashProps) {
    // We start with null and set it in useEffect to avoid hydration mismatch
    const [phase, setPhase] = useState<Phase | null>(null);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [welcomeVisible, setWelcomeVisible] = useState(false);

    useEffect(() => {
        setPhase('pin');
    }, []);

    // After welcome card fades in, wait 15 seconds then redirect to main
    useEffect(() => {
        if (phase === 'welcome') {
            const t1 = setTimeout(() => setWelcomeVisible(true), 100);
            const t2 = setTimeout(() => {
                router.visit(`/d/${hotel.slug}/${room.code}/main`);
            }, 15000); // Show welcome for 15 seconds
            return () => { clearTimeout(t1); clearTimeout(t2); };
        }
    }, [phase, hotel.slug, room.code]);

    // Skip video on ANY key, click, or touch — go to welcome
    const skipVideo = useCallback(() => {
        if (phase === 'video') setPhase('welcome');
    }, [phase]);

    useEffect(() => {
        if (phase !== 'video') return;
        window.addEventListener('keydown', skipVideo);
        window.addEventListener('click', skipVideo);
        window.addEventListener('touchstart', skipVideo);
        return () => {
            window.removeEventListener('keydown', skipVideo);
            window.removeEventListener('click', skipVideo);
            window.removeEventListener('touchstart', skipVideo);
        };
    }, [phase, skipVideo]);

    // PIN keyboard handler
    useEffect(() => {
        if (phase !== 'pin') return;
        const handler = (e: KeyboardEvent) => {
            if (e.key >= '0' && e.key <= '9' && pin.length < 6) {
                setPin(prev => prev + e.key);
            } else if (e.key === 'Backspace') {
                setPin(prev => prev.slice(0, -1));
            } else if (e.key === 'Enter') {
                handlePinSubmit();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [phase, pin]);

    const handlePinSubmit = async () => {
        if (pin.length < 4) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/room/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hotel_slug: hotel.slug, room_code: room.code, pin }),
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Invalid PIN');
                setLoading(false);
                return;
            }
            
            const data = await res.json();
            localStorage.setItem(`neotiv_room_${hotel.slug}_${room.code}`, JSON.stringify(data));
            
            // Proceed to video or welcome
            if (hotel.startup_video_url) {
                setPhase('video');
            } else {
                setPhase('welcome');
            }
        } catch {
            setError('Connection error');
            setLoading(false);
        }
    };

    const appendPinDigit = (digit: string) => {
        setPin((current) => current.length < 6 ? `${current}${digit}` : current);
    };

    const bg = hotel.featured_image_url
        || 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1920&auto=format&fit=crop';
    const startupYoutubeUrl = youtubeEmbedUrl(hotel.startup_video_url);

    if (!phase) return <div style={{ width: '100vw', height: '100vh', background: '#000' }} />;

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#000', fontFamily: 'Montserrat, sans-serif', overflow: 'hidden' }}>

            {/* ═══════ PHASE 1: LOOPING STARTUP VIDEO ═══════ */}
            {phase === 'video' && hotel.startup_video_url && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
                    {startupYoutubeUrl ? (
                        <iframe
                            src={startupYoutubeUrl}
                            title="Startup video"
                            allow="autoplay; fullscreen; encrypted-media"
                            style={{ width: '100%', height: '100%', border: 0 }}
                        />
                    ) : (
                        <video
                            src={hotel.startup_video_url}
                            autoPlay loop muted playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    )}
                    {/* Skip hint */}
                    <div style={{
                        position: 'absolute', bottom: '4vh', left: '50%', transform: 'translateX(-50%)',
                        color: 'rgba(255,255,255,0.4)', fontSize: '0.9vw', fontWeight: 500,
                        animation: 'pulse 2s infinite',
                        whiteSpace: 'nowrap',
                    }}>
                        Press any key or tap to continue
                    </div>
                </div>
            )}

            {/* ═══════ PHASE 2: WELCOME CARD (matches screenshot) ═══════ */}
            {phase === 'welcome' && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 10,
                    backgroundImage: `url(${bg})`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {/* Room badge top-right */}
                    <div style={{
                        position: 'absolute', top: '3vh', right: '3vw',
                        color: '#fff', textAlign: 'right',
                    }}>
                        <div style={{ fontSize: '0.8vw', opacity: 0.6, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Room</div>
                        <div style={{ fontSize: '3.5vw', fontWeight: 800, lineHeight: 1, fontFamily: 'Cinzel, serif' }}>{room.code}</div>
                    </div>

                    {/* Welcome card — centered */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%', left: '50%',
                            transform: `translate(-50%, -50%) scale(${welcomeVisible ? 1 : 0.94})`,
                            opacity: welcomeVisible ? 1 : 0,
                            transition: 'opacity 0.7s ease, transform 0.7s ease',
                            background: 'rgba(30, 50, 70, 0.65)',
                            backdropFilter: 'blur(24px)',
                            borderRadius: '20px',
                            padding: '2.8vw 3vw',
                            color: '#fff',
                            minWidth: '26vw',
                            maxWidth: '36vw',
                            boxShadow: '0 8px 60px rgba(0,0,0,0.4)',
                            border: '1px solid rgba(255,255,255,0.12)',
                        }}
                    >
                        {/* Guest photo */}
                        {room.guest_name && (
                            <div style={{
                                width: '5vw', height: '5vw', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #d4af37, #6b9ec7)',
                                marginBottom: '1.2vw',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '2vw', fontWeight: 700, color: '#fff',
                                border: '3px solid rgba(255,255,255,0.3)',
                            }}>
                                {room.guest_name.charAt(0).toUpperCase()}
                            </div>
                        )}

                        <p style={{ fontSize: '1.1vw', opacity: 0.9, marginBottom: '0.4vw', fontWeight: 400 }}>
                            Welcome in {hotel.name}
                        </p>
                        <p style={{ fontSize: '1.6vw', fontWeight: 700, marginBottom: '1.2vw' }}>
                            {room.guest_name ? `${room.guest_name}` : `Room ${room.code}`}
                        </p>
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.2)', marginBottom: '1.2vw' }} />
                        <p style={{ fontSize: '0.9vw', opacity: 0.75, lineHeight: 1.6, marginBottom: '0.8vw' }}>
                            We hope you enjoy your stay! We are always ready whenever you want,
                            let us know what you need.
                        </p>
                        <p style={{ fontSize: '0.9vw', opacity: 0.75, lineHeight: 1.6, marginBottom: '1.8vw' }}>
                            Your comfort is our priority!
                        </p>

                        {/* 15-second Progress Bar */}
                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                width: welcomeVisible ? '100%' : '0%',
                                height: '100%',
                                background: 'linear-gradient(90deg, #d4af37, #aa8529)',
                                transition: 'width 15s linear',
                            }} />
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════ PHASE 3: PIN ENTRY ═══════ */}
            {phase === 'pin' && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 10,
                    backgroundImage: `url(${bg})`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <div style={{
                        background: 'rgba(0,0,0,0.72)',
                        backdropFilter: 'blur(24px)',
                        borderRadius: '24px',
                        padding: '4vw',
                        textAlign: 'center',
                        color: '#fff',
                        minWidth: '28vw',
                        border: '1px solid rgba(212,175,55,0.2)',
                    }}>
                        <h2 style={{ fontSize: '1.8vw', marginBottom: '0.5vw', fontWeight: 600, fontFamily: 'Cinzel, serif', color: '#d4af37' }}>
                            {hotel.name}
                        </h2>
                        <p style={{ color: '#94a3b8', marginBottom: '2.5vw', fontSize: '0.9vw' }}>
                            Room {room.code} — Enter your PIN
                        </p>
                        <div style={{ display: 'flex', gap: '1vw', justifyContent: 'center', marginBottom: '2vw' }}>
                            {[0, 1, 2, 3].map(i => (
                                <div key={i} style={{
                                    width: '3.5vw', height: '4vw', borderRadius: '12px',
                                    border: `2px solid ${pin.length > i ? '#d4af37' : 'rgba(212,175,55,0.2)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '2vw', fontWeight: 700,
                                    background: pin.length > i ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.04)',
                                    transition: 'all 0.2s',
                                }}>
                                    {pin[i] ? '•' : ''}
                                </div>
                            ))}
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                            gap: '0.65vw',
                            margin: '0 auto 1.4vw',
                            maxWidth: '14vw',
                        }}>
                            {['1','2','3','4','5','6','7','8','9'].map((digit) => (
                                <button
                                    key={digit}
                                    type="button"
                                    onClick={() => appendPinDigit(digit)}
                                    style={{
                                        height: '2.7vw',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(212,175,55,0.24)',
                                        background: 'rgba(255,255,255,0.08)',
                                        color: '#fff',
                                        fontSize: '1.15vw',
                                        fontWeight: 600,
                                    }}
                                >
                                    {digit}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => setPin(prev => prev.slice(0, -1))}
                                style={{
                                    height: '2.7vw',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.14)',
                                    background: 'rgba(255,255,255,0.06)',
                                    color: '#cbd5e1',
                                    fontSize: '0.85vw',
                                    fontWeight: 600,
                                }}
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                onClick={() => appendPinDigit('0')}
                                style={{
                                    height: '2.7vw',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(212,175,55,0.24)',
                                    background: 'rgba(255,255,255,0.08)',
                                    color: '#fff',
                                    fontSize: '1.15vw',
                                    fontWeight: 600,
                                }}
                            >
                                0
                            </button>
                            <button
                                type="button"
                                onClick={() => setPin('')}
                                style={{
                                    height: '2.7vw',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.14)',
                                    background: 'rgba(255,255,255,0.06)',
                                    color: '#cbd5e1',
                                    fontSize: '0.85vw',
                                    fontWeight: 600,
                                }}
                            >
                                Reset
                            </button>
                        </div>
                        {error && <p style={{ color: '#f87171', marginBottom: '1vw', fontSize: '0.8vw' }}>{error}</p>}
                        <button
                            onClick={handlePinSubmit}
                            disabled={pin.length < 4 || loading}
                            style={{
                                padding: '0.9vw 3.5vw', borderRadius: '12px', border: 'none',
                                background: pin.length >= 4 ? 'linear-gradient(135deg, #d4af37, #aa8529)' : '#1e293b',
                                color: pin.length >= 4 ? '#000' : '#fff',
                                fontSize: '1vw', fontWeight: 600, cursor: pin.length >= 4 ? 'pointer' : 'default',
                                opacity: loading ? 0.5 : 1, transition: 'all 0.2s',
                            }}
                        >
                            {loading ? 'Verifying...' : 'Enter'}
                        </button>
                        <p style={{ marginTop: '1.5vw', fontSize: '0.75vw', color: 'rgba(255,255,255,0.3)' }}>
                            Use your TV remote numbers or tap to input
                        </p>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.8; }
                }
            `}</style>
        </div>
    );
}
