import { Head, Link, usePage } from '@inertiajs/react';
import {
    Building2,
    ConciergeBell,
    DoorOpen,
    HelpCircle,
    Lock,
    MonitorCog,
    Presentation,
    QrCode,
    ShieldCheck,
    Smartphone,
    Tv,
    ArrowRight,
} from 'lucide-react';

export default function Welcome() {
    const { auth, hotel } = usePage<any>().props;
    const user = auth?.user;
    const hotelSlug = hotel?.slug;

    const signedInHref = user?.role === 'superadmin'
        ? '/admin'
        : hotelSlug
            ? `/${hotelSlug}/frontoffice`
            : '/login';

    const staffHref = hotelSlug ? `/${hotelSlug}/frontoffice` : '/login';
    const demoHotelSlug = hotelSlug || 'grand-neoscreen';
    const demoRoomCode = '101';
    const demoRoomPin = '1234';
    const guideHref = user?.role === 'superadmin'
        ? '/admin/guide'
        : hotelSlug
            ? `/${hotelSlug}/frontoffice/guide`
            : '/login';

    const portals = [
        {
            title: 'Super Admin',
            description: 'Kelola tenant hotel, perangkat STB, IPTV, dan canvas TV global.',
            href: user?.role === 'superadmin' ? '/admin' : '/login',
            icon: ShieldCheck,
            badge: 'Platform',
            primary: user?.role === 'superadmin',
        },
        {
            title: 'Front Office',
            description: 'Workspace staff untuk manajemen kamar, request, tamu, dan chat.',
            href: staffHref,
            icon: Building2,
            badge: 'Hotel Ops',
            primary: user && user.role !== 'superadmin',
        },
        {
            title: 'Room TV',
            description: `Akses layar TV kamar. Gunakan PIN ${demoRoomPin} untuk masuk.`,
            href: `/d/${demoHotelSlug}/${demoRoomCode}`,
            icon: Tv,
            badge: 'Guest Room',
            helper: `Kamar ${demoRoomCode} · PIN ${demoRoomPin}`,
        },
        {
            title: 'Mobile Portal',
            description: 'Akses tamu lewat smartphone untuk memesan layanan kamar.',
            href: guideHref,
            icon: Smartphone,
            badge: 'Mobile QR',
        },
        {
            title: 'STB Launcher',
            description: 'Unduh launcher Android TV dan pairing STB perangkat kamar.',
            href: '/launcher',
            icon: MonitorCog,
            badge: 'Hardware',
        },
        {
            title: 'Demo Deck',
            description: 'Slide pitch interaktif dengan data asli dan mode Studio.',
            href: '/demo',
            icon: Presentation,
            badge: 'Pitch',
        },
        {
            title: 'Dokumentasi',
            description: 'Panduan operasional dan instruksi deployment Neoscreen.',
            href: guideHref,
            icon: HelpCircle,
            badge: 'Docs',
        },
    ];

    return (
        <>
            <Head title="Neoscreen Portal" />
            <main className="relative min-h-dvh bg-zinc-950 font-sans text-zinc-200 antialiased selection:bg-zinc-800">
                {/* Background Glow */}
                <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-60">
                    <div className="absolute -left-[10vw] -top-[10vw] h-[40vw] w-[40vw] rounded-full bg-teal-900/20 blur-[140px]" />
                    <div className="absolute -bottom-[10vw] -right-[10vw] h-[40vw] w-[40vw] rounded-full bg-teal-900/20 blur-[140px]" />
                </div>

                <section className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[1400px] flex-col px-6 py-8 sm:px-12 lg:px-16 lg:py-12">

                    {/* Header */}
                    <header className="flex items-center justify-between gap-4 border-b border-zinc-900 pb-8">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white transition-colors group-hover:bg-teal-400">
                                <Tv size={20} />
                            </div>
                            <div>
                                <p className="font-sans text-sm font-medium tracking-wide text-white normal-case">NEOSCREEN</p>
                                <p className="font-sans text-[11px] text-zinc-500 normal-case">Portal Navigasi</p>
                            </div>
                        </Link>
                        <div className="flex items-center gap-3">
                            {user ? (
                                <Link href={signedInHref} className="rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-400">
                                    Buka Workspace
                                </Link>
                            ) : (
                                <Link href="/login" className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200">
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </header>

                    {/* Main Content */}
                    <div className="grid flex-1 items-start gap-16 py-16 lg:grid-cols-12 lg:gap-24">

                        {/* Left Column (Hero Text) */}
                        <div className="flex flex-col justify-center lg:sticky lg:top-16 lg:col-span-5">
                            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-teal-400">
                                <Lock size={12} /> Akses Terpisah
                            </div>

                            <div className="mt-8 font-sans text-4xl font-semibold tracking-tight text-white normal-case sm:text-5xl lg:text-[3.5rem] lg:leading-[1.15]">
                                Semua akses ekosistem dalam satu portal.
                            </div>

                            <div className="mt-6 font-sans text-lg font-light leading-relaxed text-zinc-400 normal-case">
                                Portal ini memisahkan akses untuk manajemen platform, operasional Front Office, pengalaman tamu di TV dan smartphone, serta instalasi hardware STB secara aman.
                            </div>

                            <div className="mt-12 grid grid-cols-2 gap-4">
                                {[
                                    ['Super Admin', '/admin'],
                                    ['Front Office', hotelSlug ? `/${hotelSlug}/frontoffice` : '/{hotel}/frontoffice'],
                                    ['Room TV', '/d/{hotel}/{room}'],
                                    ['STB Launcher', '/launcher'],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex flex-col rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5">
                                        <p className="font-sans text-[10px] font-medium uppercase tracking-widest text-zinc-500 normal-case">{label}</p>
                                        <p className="mt-2 truncate font-mono text-[11px] text-zinc-300 normal-case">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column (Portal Cards) */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
                            {portals.map((portal) => (
                                <Link
                                    key={portal.title}
                                    href={portal.href}
                                    className={`group flex flex-col justify-between rounded-[24px] border border-zinc-800/60 p-6 transition-all hover:bg-zinc-900/80 ${
                                        portal.primary
                                            ? 'bg-teal-500/5 ring-1 ring-teal-500/20 shadow-xl shadow-teal-500/10 hover:bg-teal-500/10'
                                            : 'bg-zinc-900/20'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${
                                                portal.primary ? 'bg-teal-500/10 text-teal-400 group-hover:bg-teal-500 group-hover:text-white' : 'bg-zinc-800 text-white group-hover:bg-white group-hover:text-black'
                                            }`}>
                                                <portal.icon size={20} />
                                            </div>
                                            <span className={`rounded-full px-3 py-1 font-sans text-[10px] font-medium uppercase tracking-widest normal-case ${
                                                portal.primary ? 'bg-teal-500/10 text-teal-400' : 'bg-zinc-800/50 text-zinc-400'
                                            }`}>
                                                {portal.badge}
                                            </span>
                                        </div>
                                        <div className="mt-6 font-sans text-lg font-medium text-white normal-case">
                                            {portal.title}
                                        </div>
                                        <div className="mt-2 font-sans text-sm font-light leading-relaxed text-zinc-400 normal-case">
                                            {portal.description}
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        {'helper' in portal && portal.helper && (
                                            <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2 font-mono text-[11px] text-zinc-400 normal-case">
                                                {portal.helper}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 font-sans text-xs font-medium text-zinc-500 transition-colors group-hover:text-teal-400 normal-case">
                                            Buka Portal <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-900 pt-8 font-sans text-xs text-zinc-500 normal-case">
                        <p>Neoscreen v2 product portal</p>
                        <div className="flex items-center gap-6">
                            <span className="flex items-center gap-2"><DoorOpen size={14} /> Room Ops</span>
                            <span className="flex items-center gap-2"><QrCode size={14} /> Mobile QR</span>
                            <span className="flex items-center gap-2"><ConciergeBell size={14} /> Services</span>
                        </div>
                    </footer>
                </section>
            </main>
        </>
    );
}
