import { useState, useEffect } from 'react';

interface SetupSTBProps {}

export default function SetupSTB({}: SetupSTBProps) {
    const [code, setCode] = useState<string | null>(null);
    const [status, setStatus] = useState<'loading' | 'showing' | 'paired' | 'expired'>('loading');
    const [pairedSlug, setPairedSlug] = useState('');
    const [pairedRoom, setPairedRoom] = useState('');

    // Generate pairing code on mount
    useEffect(() => {
        generateCode();
    }, []);

    const generateCode = async () => {
        setStatus('loading');
        try {
            const res = await fetch('/api/stb/generate-code', { method: 'POST' });
            const data = await res.json();
            setCode(data.code);
            setStatus('showing');
        } catch {
            setStatus('expired');
        }
    };

    // Poll for pairing every 3 seconds
    useEffect(() => {
        if (status !== 'showing' || !code) return;
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/stb/poll?code=${code}`);
                const data = await res.json();
                if (data.status === 'paired') {
                    setPairedSlug(data.hotel_slug);
                    setPairedRoom(data.room_code);
                    setStatus('paired');
                    clearInterval(interval);
                    // Redirect to dashboard after 2s
                    setTimeout(() => {
                        window.location.href = `/d/${data.hotel_slug}/${data.room_code}`;
                    }, 2000);
                } else if (data.status === 'expired') {
                    setStatus('expired');
                    clearInterval(interval);
                }
            } catch {}
        }, 3000);
        return () => clearInterval(interval);
    }, [status, code]);

    return (
        <div style={{
            width: '100vw', height: '100vh',
            background: 'linear-gradient(135deg, rgba(10,12,16,0.85) 0%, rgba(10,12,16,0.7) 100%), url(https://images.unsplash.com/photo-1542314831-c6a4d27ce6a2?q=80&w=3540&auto=format&fit=crop)',
            backgroundSize: 'cover', backgroundPosition: 'center',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Montserrat, sans-serif', color: '#fff',
        }}>
            <h1 style={{
                fontSize: '3.5rem', fontWeight: 600, marginBottom: '8px',
                fontFamily: 'Cinzel, serif', letterSpacing: '0.1em',
                background: 'linear-gradient(135deg, #f3e5ab, #aa8529)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
                Neoscreen
            </h1>
            <p style={{ color: '#94a3b8', marginBottom: '48px', fontSize: '1.1rem' }}>
                STB Setup
            </p>

            {status === 'loading' && (
                <p style={{ color: '#64748b' }}>Generating pairing code...</p>
            )}

            {status === 'showing' && code && (
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#94a3b8', marginBottom: '16px' }}>
                        Enter this code in the staff panel to pair this device:
                    </p>
                    <div style={{
                        display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '32px',
                    }}>
                        {code.split('').map((digit, i) => (
                            <div key={i} style={{
                                width: '64px', height: '80px',
                                borderRadius: '12px',
                                background: 'rgba(212, 175, 55, 0.1)',
                                border: '1px solid rgba(212, 175, 55, 0.4)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '2rem', fontWeight: 500, fontFamily: 'Cinzel, serif',
                            }}>
                                {digit}
                            </div>
                        ))}
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                        Code expires in 10 minutes
                    </p>
                </div>
            )}

            {status === 'paired' && (
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Paired Successfully!</h2>
                    <p style={{ color: '#94a3b8', marginTop: '8px' }}>
                        {pairedSlug} — Room {pairedRoom}
                    </p>
                    <p style={{ color: '#64748b', marginTop: '16px' }}>Redirecting...</p>
                </div>
            )}

            {status === 'expired' && (
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#f87171', marginBottom: '16px' }}>Code expired</p>
                    <button
                        onClick={generateCode}
                        style={{
                            padding: '12px 32px', borderRadius: '12px', border: 'none',
                            background: 'linear-gradient(135deg, #d4af37, #aa8529)',
                            color: '#000', fontWeight: 600, cursor: 'pointer',
                        }}
                    >
                        Generate New Code
                    </button>
                </div>
            )}
        </div>
    );
}
