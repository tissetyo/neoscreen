import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    Download,
    FileDown,
    MonitorCog,
    Router,
    ShieldCheck,
    Tv,
} from 'lucide-react';

const versions = [
    {
        version: '2.0.0',
        label: 'STB Launcher v2',
        date: 'May 12, 2026',
        file: '/downloads/neoscreen-stb-launcher-v2.0.0.apk',
        notes: [
            'Connects to neoscreen.site by default',
            'Pairs through Front Office with a 6-digit TV code',
            'Launches the current room dashboard after pairing',
            'Can be selected as Android TV home launcher',
        ],
        latest: true,
    },
    {
        version: '1.4.0',
        label: 'Legacy STB Launcher',
        date: 'Previous stable',
        file: '/downloads/neoscreen-stb-launcher-v1.4.0.apk',
        notes: [
            'Legacy WebView kiosk build',
            'Use only for rollback on older installations',
        ],
        latest: false,
    },
];

const installSteps = [
    {
        title: 'Open Portal',
        body: 'Go to neoscreen.site/launcher from a computer, phone, or the STB browser.',
    },
    {
        title: 'Download STB Version',
        body: 'Choose the latest STB Launcher APK unless Front Office asks for a rollback version.',
    },
    {
        title: 'Install on STB',
        body: 'Install the APK on the Android STB or Smart TV and allow installation from this source if Android asks.',
    },
    {
        title: 'Connect in Front Office',
        body: 'Open Front Office, go to STB Pairing, choose the room, and enter the code shown on the TV.',
    },
    {
        title: 'Done',
        body: 'After pairing, the TV opens the assigned room dashboard and keeps using the latest web app updates.',
    },
];

export default function Launcher() {
    const { auth, hotel } = usePage<any>().props;
    const hotelSlug = hotel?.slug || 'grand-neoscreen';
    const frontOfficeHref = auth?.user && auth.user.role !== 'superadmin'
        ? `/${hotelSlug}/frontoffice/stb`
        : '/login';

    return (
        <>
            <Head title="STB Launcher" />
            <main className="min-h-screen bg-slate-950 text-white">
                <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:px-10">
                    <header className="flex items-center justify-between gap-4">
                        <Link href="/portal" className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-lg font-black shadow-lg shadow-teal-500/20">
                                N
                            </div>
                            <div>
                                <p className="text-sm font-black tracking-[0.16em]">NEOSCREEN</p>
                                <p className="text-xs text-slate-400">STB launcher portal</p>
                            </div>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Link href="/portal" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/5">
                                Portal
                            </Link>
                            <Link href={frontOfficeHref} className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-950 hover:bg-slate-200">
                                Connect STB
                            </Link>
                        </div>
                    </header>

                    <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr]">
                        <div>
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1.5 text-xs font-semibold text-teal-100">
                                <MonitorCog size={14} /> Android STB and Smart TV launcher
                            </div>
                            <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                                Install once. Pair from Front Office. Keep every room on the latest dashboard.
                            </h1>
                            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
                                The STB Launcher is a fullscreen Android TV app for room dashboards. The native wrapper stays installed on the device, while the hotel dashboard, IPTV, chat, alarms, services, and layout updates come from Neoscreen.
                            </p>
                            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
                                {[
                                    ['Default host', 'neoscreen.site'],
                                    ['Pairing', 'Front Office code'],
                                    ['Mode', 'Android launcher'],
                                ].map(([label, value]) => (
                                    <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
                                        <p className="mt-1 truncate text-sm font-semibold text-slate-100">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/30">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl border border-teal-300/20 bg-teal-300/10 p-5">
                                    <Tv className="text-teal-100" size={34} />
                                    <h2 className="mt-5 text-xl font-bold">Launcher build</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-300">The APK runs setup, handles TV remote key events, starts after boot, and opens the assigned room dashboard.</p>
                                </div>
                                <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-5">
                                    <Router className="text-amber-100" size={34} />
                                    <h2 className="mt-5 text-xl font-bold">Room pairing</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-300">Front Office chooses the room and enters the TV code. No hotel slug or room code is typed on the TV.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <section className="grid gap-6 pb-10 lg:grid-cols-[1fr_0.8fr]">
                        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-teal-200">Downloads</p>
                                    <h2 className="mt-1 text-2xl font-bold">STB versions</h2>
                                </div>
                                <FileDown className="text-slate-500" size={28} />
                            </div>
                            <div className="mt-6 space-y-4">
                                {versions.map((version) => (
                                    <div key={version.version} className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-lg font-bold">{version.label}</h3>
                                                    {version.latest && (
                                                        <span className="rounded-full bg-teal-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-100">Latest</span>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-xs text-slate-500">Version {version.version} - {version.date}</p>
                                                <ul className="mt-4 space-y-2 text-sm text-slate-300">
                                                    {version.notes.map((note) => (
                                                        <li key={note} className="flex gap-2">
                                                            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-teal-300" />
                                                            <span>{note}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <a href={version.file} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${
                                                version.latest ? 'bg-teal-500 text-white hover:bg-teal-400' : 'border border-white/10 text-slate-200 hover:bg-white/5'
                                            }`}>
                                                <Download size={16} /> Download APK
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                            <p className="text-xs font-bold uppercase tracking-wider text-teal-200">Onboarding</p>
                            <h2 className="mt-1 text-2xl font-bold">Install flow</h2>
                            <div className="mt-6 space-y-4">
                                {installSteps.map((step, index) => (
                                    <div key={step.title} className="flex gap-4">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-slate-950">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold">{step.title}</p>
                                            <p className="mt-1 text-sm leading-6 text-slate-400">{step.body}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link href={frontOfficeHref} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 hover:bg-slate-200">
                                Open Front Office pairing <ArrowRight size={16} />
                            </Link>
                        </div>
                    </section>

                    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-5 text-xs text-slate-500">
                        <p>Neoscreen STB Launcher</p>
                        <span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} /> Updates come from the web dashboard after pairing</span>
                    </footer>
                </section>
            </main>
        </>
    );
}
