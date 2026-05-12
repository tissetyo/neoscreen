import { Head, Link, usePage } from '@inertiajs/react';
import {
    Building2,
    ConciergeBell,
    DoorOpen,
    HelpCircle,
    Lock,
    MonitorCog,
    QrCode,
    ShieldCheck,
    Smartphone,
    Tv,
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
            description: 'Hotels, tenant accounts, platform announcements, and TV canvas control.',
            href: user?.role === 'superadmin' ? '/admin' : '/login',
            icon: ShieldCheck,
            badge: 'Platform',
            primary: user?.role === 'superadmin',
        },
        {
            title: 'Front Office',
            description: 'Rooms, guests, chat, notifications, requests, alarms, promos, and analytics.',
            href: staffHref,
            icon: Building2,
            badge: 'Hotel Ops',
            primary: user && user.role !== 'superadmin',
        },
        {
            title: 'Room TV',
            description: `Guest-facing TV dashboard. Demo path: /d/${demoHotelSlug}/${demoRoomCode}. Enter room PIN ${demoRoomPin} to continue.`,
            href: `/d/${demoHotelSlug}/${demoRoomCode}`,
            icon: Tv,
            badge: 'Guest Room',
            helper: `Room ${demoRoomCode} · PIN ${demoRoomPin}`,
        },
        {
            title: 'STB Launcher',
            description: 'Download the Android TV launcher, install it on STBs, and pair rooms from Front Office.',
            href: '/launcher',
            icon: MonitorCog,
            badge: 'Hardware',
            helper: 'Download APK and connect with TV code',
        },
        {
            title: 'Guest Mobile Portal',
            description: 'QR/mobile companion for services and chat. Sessions are created from the room TV.',
            href: guideHref,
            icon: Smartphone,
            badge: 'Mobile',
            helper: 'Open from the QR shown on TV',
        },
        {
            title: 'Docs & Install Guide',
            description: 'Operational guide, STB install steps, ADB commands, and troubleshooting.',
            href: guideHref,
            icon: HelpCircle,
            badge: 'Docs',
        },
    ];

    return (
        <>
            <Head title="Neoscreen Portal" />
            <main className="min-h-screen bg-[#080B13] text-white">
                <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:px-10">
                    <header className="flex items-center justify-between gap-4">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-lg font-black shadow-lg shadow-teal-500/20">
                                N
                            </div>
                            <div>
                                <p className="text-sm font-black tracking-[0.16em]">NEOSCREEN</p>
                                <p className="text-xs text-slate-400">TV platform portal</p>
                            </div>
                        </Link>
                        <div className="flex items-center gap-2">
                            {user ? (
                                <Link href={signedInHref} className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-slate-200">
                                    Open workspace
                                </Link>
                            ) : (
                                <Link href="/login" className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-slate-200">
                                    Sign in
                                </Link>
                            )}
                        </div>
                    </header>

                    <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr]">
                        <div>
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-teal-200">
                                <Lock size={14} /> Separate portals for each product surface
                            </div>
                            <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                                One entry point for admin, front office, room TV, mobile, and STB launcher installs.
                            </h1>
                            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
                                This portal keeps client handoff clean: operators go to Front Office, platform users go to Super Admin, physical TVs use the STB Launcher, and guest mobile sessions stay isolated behind QR-generated links.
                            </p>
                            <div className="mt-8 grid max-w-xl grid-cols-2 gap-3 text-sm text-slate-300">
                                {[
                                    ['Admin', '/admin'],
                                    ['Front Office', hotelSlug ? `/${hotelSlug}/frontoffice` : '/{hotel}/frontoffice'],
                                    ['Room TV', '/d/{hotel}/{room}'],
                                    ['STB Launcher', '/launcher'],
                                ].map(([label, value]) => (
                                    <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
                                        <p className="mt-1 truncate font-mono text-xs text-slate-200">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {portals.map((portal) => (
                                <Link
                                    key={portal.title}
                                    href={portal.href}
                                    className={`group rounded-3xl border p-5 transition hover:-translate-y-0.5 ${
                                        portal.primary
                                            ? 'border-teal-300/50 bg-teal-400/12 shadow-2xl shadow-teal-950/40'
                                            : 'border-white/10 bg-white/[0.045] hover:border-white/20 hover:bg-white/[0.07]'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                                            <portal.icon size={22} />
                                        </div>
                                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                                            {portal.badge}
                                        </span>
                                    </div>
                                    <h2 className="mt-5 text-lg font-bold">{portal.title}</h2>
                                    <p className="mt-2 min-h-[56px] text-sm leading-6 text-slate-400">{portal.description}</p>
                                    {'helper' in portal && portal.helper && (
                                        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 font-mono text-xs text-slate-200">
                                            {portal.helper}
                                        </div>
                                    )}
                                    <p className="mt-4 text-xs font-bold text-teal-200 group-hover:text-teal-100">Open portal</p>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-5 text-xs text-slate-500">
                        <p>Neoscreen v2 product portal</p>
                        <div className="flex items-center gap-4">
                            <span className="inline-flex items-center gap-1.5"><DoorOpen size={13} /> Room</span>
                            <span className="inline-flex items-center gap-1.5"><QrCode size={13} /> Mobile QR</span>
                            <span className="inline-flex items-center gap-1.5"><ConciergeBell size={13} /> Services</span>
                        </div>
                    </footer>
                </section>
            </main>
        </>
    );
}
