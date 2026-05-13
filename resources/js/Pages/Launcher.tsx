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
        date: '12 Mei 2026',
        file: '/downloads/neoscreen-stb-launcher-v2.0.0.apk',
        notes: [
            'Otomatis terhubung ke cloud Neoscreen',
            'Pairing via Front Office dengan 6-digit kode',
            'Auto-boot langsung ke dashboard kamar',
            'Bisa disetel sebagai default Android TV launcher',
        ],
        latest: true,
    },
    {
        version: '1.4.0',
        label: 'Legacy STB Launcher',
        date: 'Versi Stabil Lama',
        file: '/downloads/neoscreen-stb-launcher-v1.4.0.apk',
        notes: [
            'Build kiosk WebView lawas',
            'Gunakan hanya untuk rollback instalasi lama',
        ],
        latest: false,
    },
];

const installSteps = [
    {
        title: 'Buka Portal',
        body: 'Akses halaman portal ini dari komputer, HP, atau browser bawaan STB.',
    },
    {
        title: 'Download Versi STB',
        body: 'Pilih APK STB Launcher versi terbaru dan unduh ke perangkat.',
    },
    {
        title: 'Install di Perangkat',
        body: 'Install APK pada Android STB / Smart TV. Izinkan "Install from unknown sources" jika diminta.',
    },
    {
        title: 'Pairing di Front Office',
        body: 'Buka workspace Front Office, pilih menu STB Pairing, dan masukkan kode yang tampil di layar TV.',
    },
    {
        title: 'Selesai',
        body: 'TV akan langsung memuat dashboard kamar yang ditugaskan dan selalu update ke versi terbaru.',
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
            <main className="relative min-h-dvh bg-zinc-950 font-sans text-zinc-200 antialiased selection:bg-zinc-800">
                {/* Background Glow */}
                <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-60">
                    <div className="absolute -left-[10vw] -top-[10vw] h-[40vw] w-[40vw] rounded-full bg-teal-900/20 blur-[140px]" />
                    <div className="absolute -bottom-[10vw] -right-[10vw] h-[40vw] w-[40vw] rounded-full bg-teal-900/20 blur-[140px]" />
                </div>

                <section className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[1400px] flex-col px-6 py-8 sm:px-12 lg:px-16 lg:py-12">
                    {/* Header */}
                    <header className="flex items-center justify-between gap-4 border-b border-zinc-900 pb-8">
                        <Link href="/portal" className="flex items-center gap-3 group">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white transition-colors group-hover:bg-teal-400">
                                <MonitorCog size={20} />
                            </div>
                            <div>
                                <p className="font-sans text-sm font-medium tracking-wide text-white normal-case">NEOSCREEN</p>
                                <p className="font-sans text-[11px] text-zinc-500 normal-case">Launcher Portal</p>
                            </div>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Link href="/portal" className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800">
                                Portal
                            </Link>
                            <Link href={frontOfficeHref} className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200">
                                Buka Front Office
                            </Link>
                        </div>
                    </header>

                    {/* Main Content */}
                    <div className="grid flex-1 items-start gap-16 py-16 lg:grid-cols-12 lg:gap-24">

                        {/* Left Column (Hero Text) */}
                        <div className="flex flex-col justify-center lg:sticky lg:top-16 lg:col-span-5">
                            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-teal-400">
                                <MonitorCog size={12} /> Android STB App
                            </div>

                            <div className="mt-8 font-sans text-4xl font-semibold tracking-tight text-white normal-case sm:text-5xl lg:text-[3.5rem] lg:leading-[1.15]">
                                Install sekali. Layar kamar update mandiri.
                            </div>

                            <div className="mt-6 font-sans text-lg font-light leading-relaxed text-zinc-400 normal-case">
                                STB Launcher adalah aplikasi Android TV fullscreen untuk dashboard kamar. Cukup pairing satu kali dari Front Office, dan seluruh update IPTV, layanan, serta UI dikendalikan penuh dari cloud secara real-time.
                            </div>

                            <div className="mt-12 grid max-w-xl gap-4 sm:grid-cols-3">
                                {[
                                    ['Default Host', 'Cloud Neoscreen'],
                                    ['Metode Pairing', 'TV Kode 6-Digit'],
                                    ['Device Mode', 'Android Launcher'],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex flex-col rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-4">
                                        <p className="font-sans text-[10px] font-medium uppercase tracking-widest text-zinc-500 normal-case">{label}</p>
                                        <p className="mt-2 truncate font-sans text-xs font-medium text-zinc-300 normal-case">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column (Downloads & Flow) */}
                        <div className="grid gap-6 lg:col-span-7">

                            {/* Features Overview */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-3xl border border-teal-500/20 bg-teal-500/5 p-6 transition-all hover:bg-teal-500/10">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
                                        <Tv size={20} />
                                    </div>
                                    <h2 className="mt-6 font-sans text-lg font-medium text-white normal-case">Kiosk Mode</h2>
                                    <p className="mt-2 font-sans text-sm font-light leading-relaxed text-zinc-400 normal-case">APK menangani proses boot, remote event, dan mengunci interface agar tamu selalu melihat dashboard hotel Anda.</p>
                                </div>
                                <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6 transition-all hover:bg-amber-500/10">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                                        <Router size={20} />
                                    </div>
                                    <h2 className="mt-6 font-sans text-lg font-medium text-white normal-case">Remote Pairing</h2>
                                    <p className="mt-2 font-sans text-sm font-light leading-relaxed text-zinc-400 normal-case">Staf tidak perlu mengetik kredensial di layar TV. Cukup lihat kode 6-digit di TV dan input di dashboard Front Office.</p>
                                </div>
                            </div>

                            {/* Downloads */}
                            <div className="mt-4 rounded-3xl border border-zinc-800/60 bg-zinc-900/30 p-8">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-sans text-[10px] font-medium uppercase tracking-widest text-zinc-500 normal-case">Unduhan</p>
                                        <h2 className="mt-2 font-sans text-2xl font-medium tracking-tight text-white normal-case">Versi APK</h2>
                                    </div>
                                    <FileDown className="text-zinc-500" size={24} />
                                </div>
                                <div className="mt-8 space-y-4">
                                    {versions.map((version) => (
                                        <div key={version.version} className="flex flex-col gap-6 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h3 className="font-sans text-lg font-medium text-white normal-case">{version.label}</h3>
                                                    {version.latest && (
                                                        <span className="rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-1 font-sans text-[10px] font-medium uppercase tracking-widest text-teal-400 normal-case">Terbaru</span>
                                                    )}
                                                </div>
                                                <p className="mt-1 font-sans text-xs text-zinc-500 normal-case">Versi {version.version} · {version.date}</p>
                                                <ul className="mt-4 space-y-2.5">
                                                    {version.notes.map((note) => (
                                                        <li key={note} className="flex gap-3 font-sans text-sm font-light text-zinc-400 normal-case">
                                                            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-teal-400" />
                                                            <span>{note}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <a href={version.file} className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 font-sans text-sm font-medium transition-colors normal-case ${
                                                version.latest ? 'bg-teal-500 text-white hover:bg-teal-400 shadow-lg shadow-teal-500/20' : 'border border-zinc-800 text-white hover:bg-zinc-800'
                                            }`}>
                                                <Download size={16} /> Unduh APK
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Installation Flow */}
                            <div className="mt-4 rounded-3xl border border-zinc-800/60 bg-zinc-900/30 p-8">
                                <p className="font-sans text-[10px] font-medium uppercase tracking-widest text-zinc-500 normal-case">Onboarding</p>
                                <h2 className="mt-2 font-sans text-2xl font-medium tracking-tight text-white normal-case">Alur Instalasi</h2>
                                <div className="mt-8 space-y-6">
                                    {installSteps.map((step, index) => (
                                        <div key={step.title} className="flex gap-5">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white font-sans text-xs font-semibold text-black">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-sans text-base font-medium text-white normal-case">{step.title}</p>
                                                <p className="mt-1 font-sans text-sm font-light leading-relaxed text-zinc-400 normal-case">{step.body}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-900 pt-8 font-sans text-xs text-zinc-500 normal-case">
                        <p>Neoscreen STB Launcher</p>
                        <span className="flex items-center gap-2"><ShieldCheck size={14} /> OTA Updates aktif</span>
                    </footer>
                </section>
            </main>
        </>
    );
}
