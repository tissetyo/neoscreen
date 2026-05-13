import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    ImageUp,
    Lock,
    Pencil,
    RotateCcw,
    Tv,
    X,
} from 'lucide-react';

type Facts = {
    hotelCount: number;
    roomCount: number;
    occupiedRooms: number;
    pairedStbs: number;
    onlineStbs: number;
    frontOfficeUsers: number;
    countryPacks: number;
    enabledCountryPacks: number;
    channelsPerCountry: number;
    configuredChannelSlots: number;
    sessionChannelLimit: number;
    trackedChannelHealth: number;
    hiddenChannelOverrides: number;
    serviceCount: number;
    serviceOptionCount: number;
    serviceRequestCount: number;
    activePromos: number;
    activeAlarms: number;
    mobileSessions: number;
    defaultAppCount: number;
    blankCanvasAppCapacity: number;
    recommendedCustomApps: string;
    tvGrid: string;
    demoPin: string;
};

type Metric = {
    label: string;
    value: string;
    detail: string;
};

type DemoSlide = {
    id: string;
    eyebrow: string;
    title: string;
    body: string;
    imageUrl: string;
    imageLabel: string;
    metrics: Metric[];
    bullets: string[];
    note?: string;
};

type Props = {
    facts: Facts;
};

type SlideDraftPayload = {
    slides: DemoSlide[];
    factsSignature: string;
    savedAt: string;
};

const THEMES = {
    teal: {
        id: 'teal',
        label: 'Teal',
        hex: '#14b8a6',
        text: 'text-teal-400',
        bgSubtle: 'bg-teal-500/10',
        borderSubtle: 'border-teal-500/20',
        bgSolid: 'bg-teal-500',
        bgSolidHover: 'hover:bg-teal-400',
        ring: 'ring-teal-500/20',
        gradientStart: 'from-teal-900/20',
        bullet: 'bg-teal-500',
        bgCircle: 'bg-teal-900/20',
    },
    blue: {
        id: 'blue',
        label: 'Blue',
        hex: '#3b82f6',
        text: 'text-blue-400',
        bgSubtle: 'bg-blue-500/10',
        borderSubtle: 'border-blue-500/20',
        bgSolid: 'bg-blue-500',
        bgSolidHover: 'hover:bg-blue-400',
        ring: 'ring-blue-500/20',
        gradientStart: 'from-blue-900/20',
        bullet: 'bg-blue-500',
        bgCircle: 'bg-blue-900/20',
    },
    violet: {
        id: 'violet',
        label: 'Violet',
        hex: '#8b5cf6',
        text: 'text-violet-400',
        bgSubtle: 'bg-violet-500/10',
        borderSubtle: 'border-violet-500/20',
        bgSolid: 'bg-violet-500',
        bgSolidHover: 'hover:bg-violet-400',
        ring: 'ring-violet-500/20',
        gradientStart: 'from-violet-900/20',
        bullet: 'bg-violet-500',
        bgCircle: 'bg-violet-900/20',
    },
    rose: {
        id: 'rose',
        label: 'Rose',
        hex: '#f43f5e',
        text: 'text-rose-400',
        bgSubtle: 'bg-rose-500/10',
        borderSubtle: 'border-rose-500/20',
        bgSolid: 'bg-rose-500',
        bgSolidHover: 'hover:bg-rose-400',
        ring: 'ring-rose-500/20',
        gradientStart: 'from-rose-900/20',
        bullet: 'bg-rose-500',
        bgCircle: 'bg-rose-900/20',
    },
    amber: {
        id: 'amber',
        label: 'Amber',
        hex: '#f59e0b',
        text: 'text-amber-400',
        bgSubtle: 'bg-amber-500/10',
        borderSubtle: 'border-amber-500/20',
        bgSolid: 'bg-amber-500',
        bgSolidHover: 'hover:bg-amber-400',
        ring: 'ring-amber-500/20',
        gradientStart: 'from-amber-900/20',
        bullet: 'bg-amber-500',
        bgCircle: 'bg-amber-900/20',
    }
} as const;

type ThemeId = keyof typeof THEMES;

const LEGACY_STORAGE_KEY = 'neoscreen_demo_pitch_slides_v2';
const LEGACY_SETTINGS_KEY = 'neoscreen_demo_pitch_settings_v1';
const SESSION_STORAGE_KEY = 'neoscreen_demo_pitch_session_slides_v1';
const SESSION_SETTINGS_KEY = 'neoscreen_demo_pitch_session_settings_v1';
const nf = new Intl.NumberFormat('id-ID');

const fmt = (value: number) => nf.format(value || 0);

function buildSlides(facts: Facts): DemoSlide[] {
    const dailySavedMinutes = 50 * 2;
    const dailySavedHours = Math.round((dailySavedMinutes / 60) * 10) / 10;

    return [
        {
            id: 'opening',
            eyebrow: 'Platform Overview',
            title: 'Smart TV Hotel All-in-One.',
            body: 'Neoscreen menyatukan layar tamu, Front Office, IPTV, dan mobile QR dalam satu platform. Ubah TV kamar menjadi pusat operasional dan layanan hotel digital.',
            imageUrl: '/demo-assets/01-portal-entry.png',
            imageLabel: 'Portal Utama',
            metrics: [
                { label: 'Hotel Aktif', value: fmt(facts.hotelCount), detail: 'tenant saat ini' },
                { label: 'Room Terdaftar', value: fmt(facts.roomCount), detail: `${fmt(facts.occupiedRooms)} occupied` },
                { label: 'STB Paired', value: fmt(facts.pairedStbs), detail: `${fmt(facts.onlineStbs)} online` },
            ],
            bullets: [
                'Portal terpusat untuk akses Super Admin, Front Office, dan TV kamar.',
                'Pembaruan admin mengalir secara real-time ke layar tanpa instal ulang.',
                'Room session otomatis, tidak menggunakan landing page publik.',
            ],
        },
        {
            id: 'guest-tv',
            eyebrow: 'Guest TV',
            title: 'Pengalaman Tamu yang Intuitif.',
            body: 'Zero learning curve. Begitu TV menyala, tamu langsung melihat sapaan personal, layanan hotel, dan aplikasi hiburan dalam antarmuka yang elegan dan mudah digunakan dengan remote biasa.',
            imageUrl: '/demo-assets/04-room-tv-dashboard.png',
            imageLabel: 'Dashboard TV Kamar',
            metrics: [
                { label: 'Layout Grid', value: facts.tvGrid, detail: 'dinamis dari server' },
                { label: 'Navigasi', value: '4 Tombol', detail: 'kiri, kanan, ok, kembali' },
                { label: 'Tampilan', value: '2 Mode', detail: 'interaktif & standby' },
            ],
            bullets: [
                'Tampilan bersih: menu hanya muncul saat berinteraksi.',
                'Running text informatif tidak mengganggu konten utama.',
                'Widget modular yang dikendalikan penuh oleh Admin.',
            ],
        },
        {
            id: 'stb-launcher',
            eyebrow: 'Deployment',
            title: 'Setup STB Tanpa Ribet.',
            body: 'Proses instalasi semudah memasukkan kode pairing. Neoscreen Launcher memastikan perangkat selalu terkunci di dashboard kamar tanpa setup manual per device.',
            imageUrl: '/demo-assets/02-stb-launcher-downloads.png',
            imageLabel: 'Halaman Unduh Launcher',
            metrics: [
                { label: 'Versi Engine', value: 'v2.0.0', detail: 'optimized build' },
                { label: 'Pairing', value: 'Otomatis', detail: 'kode aman 6 digit' },
                { label: 'Kapasitas', value: fmt(facts.roomCount), detail: 'ruangan terdukung' },
            ],
            bullets: [
                'Setiap baris ruangan langsung terhubung ke spesifik STB.',
                'Monitoring status perangkat secara live (online, offline, maintenance).',
                'Auto-boot langsung ke dashboard tamu.',
            ],
        },
        {
            id: 'iptv',
            eyebrow: 'IPTV Engine',
            title: 'IPTV Terkurasi & Cerdas.',
            body: 'Bukan sekadar daftar channel mentah. Sistem secara otomatis memfilter channel yang rusak atau tidak tersedia, dan menyusunnya berdasarkan negara agar relevan bagi tamu asing.',
            imageUrl: '/demo-assets/21-superadmin-iptv-controls.png',
            imageLabel: 'Manajemen IPTV',
            metrics: [
                { label: 'Katalog', value: fmt(facts.enabledCountryPacks), detail: `dari ${fmt(facts.countryPacks)} negara` },
                { label: 'Channel/Negara', value: fmt(facts.channelsPerCountry), detail: 'kurasi premium' },
                { label: 'Max Sesi', value: fmt(facts.sessionChannelLimit), detail: 'channel per TV' },
            ],
            bullets: [
                'Secara otomatis menyembunyikan channel geo-blocked atau error.',
                'Sistem fallback cerdas jika source channel terputus.',
                `Health tracking: ${fmt(facts.trackedChannelHealth)} channel dimonitor, ${fmt(facts.hiddenChannelOverrides)} disembunyikan.`,
            ],
        },
        {
            id: 'operations',
            eyebrow: 'Front Office',
            title: 'Satu Dashboard Kendali.',
            body: 'Kelola semua kamar dari satu layar sentral. Tangani chat tamu, request layanan, pengingat checkout, dan pantau status TV tanpa perlu berpindah aplikasi atau sistem.',
            imageUrl: '/demo-assets/13-frontoffice-dashboard.png',
            imageLabel: 'Dashboard Staff',
            metrics: [
                { label: 'Staff Aktif', value: fmt(facts.frontOfficeUsers), detail: 'pengguna FO' },
                { label: 'Total Request', value: fmt(facts.serviceRequestCount), detail: 'sepanjang waktu' },
                { label: 'Alarm Aktif', value: fmt(facts.activeAlarms), detail: 'saat ini' },
            ],
            bullets: [
                'Sistem manajemen tiket untuk setiap request tamu.',
                'Chat terenkripsi dan terikat pada sesi kamar.',
                'Pengingat checkout otomatis sinkron dengan reservasi.',
            ],
        },
        {
            id: 'mobile-service',
            eyebrow: 'Mobile QR',
            title: 'Ekstensi Mobile Praktis.',
            body: 'Tamu cukup scan QR di TV untuk memesan layanan kamar, spa, atau chat dengan Front Office langsung dari smartphone pribadi mereka, tanpa perlu mendaftar atau mengunduh aplikasi.',
            imageUrl: '/demo-assets/23-mobile-guest-portal.png',
            imageLabel: 'Portal Web Mobile',
            metrics: [
                { label: 'Layanan', value: fmt(facts.serviceCount), detail: 'kategori aktif' },
                { label: 'Menu Items', value: fmt(facts.serviceOptionCount), detail: 'tersedia' },
                { label: 'Sesi Mobile', value: fmt(facts.mobileSessions), detail: 'aktif sekarang' },
            ],
            bullets: [
                'Mengurangi volume panggilan telepon ke Front Desk.',
                'Update menu dan promo secara digital seketika.',
                'Sesi terkunci pada kamar, menjamin validitas pemesanan.',
            ],
        },
        {
            id: 'canvas-apps',
            eyebrow: 'Canvas Builder',
            title: 'Personalisasi Tanpa Batas.',
            body: 'Kendalikan penuh tampilan layar. Super Admin dapat menyesuaikan tata letak widget, aplikasi pihak ketiga, slideshow, tema warna, dan identitas brand secara langsung.',
            imageUrl: '/demo-assets/20-tv-dashboard-canvas.png',
            imageLabel: 'Editor Visual TV',
            metrics: [
                { label: 'App Standar', value: fmt(facts.defaultAppCount), detail: 'YouTube, Netflix, dll' },
                { label: 'Grid Canvas', value: fmt(facts.blankCanvasAppCapacity), detail: 'slot widget' },
                { label: 'Custom App', value: facts.recommendedCustomApps, detail: 'rekomendasi ideal' },
            ],
            bullets: [
                'Dukungan penuh untuk Android package, intent, atau Web URL.',
                'Sistem kurasi aplikasi agar performa TV tetap maksimal.',
                'Ruang canvas luas (24x14) untuk fleksibilitas komposisi.',
            ],
        },
        {
            id: 'efficiency',
            eyebrow: 'Business Value',
            title: 'Efisiensi Operasional Nyata.',
            body: 'Lebih dari sekadar layar cantik. Neoscreen dirancang untuk mengotomatisasi pekerjaan repetitif, menekan beban kerja Front Desk, dan membuka jalur revenue baru secara terukur.',
            imageUrl: '/demo-assets/16-frontoffice-analytics.png',
            imageLabel: 'Data Analitik',
            metrics: [
                { label: 'Simulasi', value: '50', detail: 'request per hari' },
                { label: 'Hemat Waktu', value: `${fmt(dailySavedHours)} Jam`, detail: 'produktivitas harian' },
                { label: 'Pairing', value: '< 2 mnt', detail: 'waktu per kamar' },
            ],
            bullets: [
                'Request digital menggantikan log manual dan telepon.',
                'Promo di layar mendorong upselling layanan hotel.',
                'Analitik lengkap untuk memahami preferensi tamu.',
            ],
            note: 'Model di atas adalah kalkulasi pilot standar. Efisiensi nyata bervariasi bergantung pada skala hotel.',
        },
        {
            id: 'pilot',
            eyebrow: 'Next Steps',
            title: 'Mulai dengan Pilot Plan.',
            body: 'Langkah implementasi yang terukur. Uji coba awal di beberapa kamar untuk memvalidasi performa STB, respons jaringan, dan adaptasi tim Front Office sebelum ekspansi penuh.',
            imageUrl: '/demo-assets/14-frontoffice-stb-pairing.png',
            imageLabel: 'Proses Pairing',
            metrics: [
                { label: 'Skala Pilot', value: '3-10', detail: 'kamar target' },
                { label: 'Validasi', value: '2 Model', detail: 'perangkat STB' },
                { label: 'Checkpoint', value: '7 Fitur', detail: 'verifikasi' },
            ],
            bullets: [
                'Instalasi cepat tanpa mengganggu operasional harian.',
                'Validasi kualitas jaringan untuk kelancaran IPTV.',
                'Evaluasi kemudahan staf dalam menggunakan dashboard.',
            ],
        },
    ];
}

export default function Demo({ facts }: Props) {
    const baseSlides = useMemo(() => buildSlides(facts), [facts]);
    const factsSignature = useMemo(() => JSON.stringify(facts), [facts]);
    const [slides, setSlides] = useState<DemoSlide[]>(baseSlides);
    const [activeIndex, setActiveIndex] = useState(0);
    const [studioOpen, setStudioOpen] = useState(false);
    const [pinOpen, setPinOpen] = useState(false);
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState('');
    const [themeId, setThemeId] = useState<ThemeId>('teal');
    const [saveNotice, setSaveNotice] = useState('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const activeSlide = slides[activeIndex] ?? slides[0];
    const activeTheme = THEMES[themeId] || THEMES.teal;

    useEffect(() => {
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
        window.localStorage.removeItem(LEGACY_SETTINGS_KEY);

        const savedSettings = window.sessionStorage.getItem(SESSION_SETTINGS_KEY);
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                if (parsed.themeId && THEMES[parsed.themeId as ThemeId]) {
                    setThemeId(parsed.themeId as ThemeId);
                }
            } catch {}
        }

        const savedSlides = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedSlides) {
            try {
                const parsed = JSON.parse(savedSlides) as SlideDraftPayload;
                if (parsed.factsSignature === factsSignature && Array.isArray(parsed.slides) && parsed.slides.length) {
                    setSlides(parsed.slides);
                } else {
                    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
                }
            } catch {
                window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
            }
        }
    }, [factsSignature]);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

            if (event.key === 'ArrowRight') {
                setActiveIndex((value) => Math.min(value + 1, slides.length - 1));
            }
            if (event.key === 'ArrowLeft') {
                setActiveIndex((value) => Math.max(value - 1, 0));
            }
            if (event.key === 'Escape') {
                setStudioOpen(false);
                setPinOpen(false);
            }
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [slides.length]);

    const saveSessionDraft = (nextSlides: DemoSlide[]) => {
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
            slides: nextSlides,
            factsSignature,
            savedAt: new Date().toISOString(),
        } satisfies SlideDraftPayload));
    };

    const persistSlides = (nextSlides: DemoSlide[]) => {
        setSlides(nextSlides);
        saveSessionDraft(nextSlides);
        setSaveNotice('Perubahan otomatis tersimpan hanya untuk sesi browser ini.');
    };

    const updateTheme = (newTheme: ThemeId) => {
        setThemeId(newTheme);
        window.sessionStorage.setItem(SESSION_SETTINGS_KEY, JSON.stringify({ themeId: newTheme }));
        setSaveNotice('Tema diterapkan untuk sesi browser ini.');
    };

    const updateActiveSlide = (patch: Partial<DemoSlide>) => {
        persistSlides(slides.map((slide, index) => index === activeIndex ? { ...slide, ...patch } : slide));
    };

    const updateMetric = (metricIndex: number, patch: Partial<Metric>) => {
        const nextMetrics = activeSlide.metrics.map((metric, index) => index === metricIndex ? { ...metric, ...patch } : metric);
        updateActiveSlide({ metrics: nextMetrics });
    };

    const updateBullet = (bulletIndex: number, value: string) => {
        const nextBullets = activeSlide.bullets.map((bullet, index) => index === bulletIndex ? value : bullet);
        updateActiveSlide({ bullets: nextBullets });
    };

    const unlockStudio = () => {
        if (pin === facts.demoPin) {
            setPin('');
            setPinError('');
            setPinOpen(false);
            setStudioOpen(true);
            return;
        }

        setPinError('PIN tidak valid.');
    };

    const resetSlides = () => {
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
        setSlides(baseSlides);
        setActiveIndex(0);
        setSaveNotice('Draft sesi dihapus. Konten kembali mengikuti data terbaru.');
    };

    const applySessionDraft = () => {
        saveSessionDraft(slides);
        setSaveNotice('Draft sesi diterapkan. Data utama tidak berubah.');
        setStudioOpen(false);
    };

    const handleImageUpload = (file: File | undefined) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                updateActiveSlide({ imageUrl: reader.result, imageLabel: file.name });
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <>
            <Head title="Neoscreen Demo" />
            {/* FORCE font-sans at root to kill serif inheritance */}
            <main className="relative min-h-dvh bg-zinc-950 font-sans text-zinc-200 antialiased selection:bg-zinc-800">
                <div className="flex min-h-dvh">

                    {/* Left Navigation (Minimalist) */}
                    <aside className="hidden w-[260px] shrink-0 flex-col border-r border-zinc-900 bg-zinc-950 xl:flex">
                        <div className="p-8 pb-6">
                            <Link href="/portal" className="group inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-zinc-500 transition-colors hover:text-white">
                                <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" /> Keluar
                            </Link>
                            <h1 className="mt-8 text-xl font-medium tracking-tight text-white normal-case">Neoscreen Demo</h1>
                            <p className="mt-2 text-xs leading-relaxed text-zinc-500 normal-case">
                                Mode presentasi.
                            </p>
                        </div>

                        <div className="flex-1 space-y-1 overflow-y-auto py-4 [&::-webkit-scrollbar]:hidden">
                            {slides.map((slide, index) => (
                                <button
                                    key={slide.id}
                                    type="button"
                                    onClick={() => setActiveIndex(index)}
                                    className={`group relative flex w-full items-center gap-4 px-8 py-3.5 text-left transition-colors ${
                                        index === activeIndex
                                            ? 'bg-zinc-900/50 text-white'
                                            : 'text-zinc-500 hover:bg-zinc-900/30 hover:text-zinc-300'
                                    }`}
                                >
                                    {index === activeIndex && (
                                        <span className={`absolute left-0 top-0 h-full w-1 rounded-r-full ${activeTheme.bgSolid}`} />
                                    )}
                                    <span className={`text-[10px] font-mono tracking-widest ${index === activeIndex ? activeTheme.text : 'text-zinc-600 group-hover:text-zinc-500'}`}>
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <span className="text-sm font-medium normal-case">{slide.eyebrow}</span>
                                </button>
                            ))}
                        </div>

                        <div className="border-t border-zinc-900 p-8">
                            <button
                                type="button"
                                onClick={() => setPinOpen(true)}
                                className="flex w-full items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-white hover:text-black"
                            >
                                <Pencil size={14} /> Buka Studio
                            </button>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <section className="relative flex min-w-0 flex-1 flex-col">
                        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden transition-colors duration-1000 opacity-60">
                            <div className={`absolute -left-[10vw] -top-[10vw] h-[40vw] w-[40vw] rounded-full blur-[140px] transition-colors duration-1000 ${activeTheme.bgCircle}`} />
                            <div className={`absolute -bottom-[10vw] -right-[10vw] h-[40vw] w-[40vw] rounded-full blur-[140px] transition-colors duration-1000 ${activeTheme.bgCircle}`} />
                        </div>

                        {/* Mobile Header */}
                        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-900 bg-zinc-950/80 px-6 py-4 backdrop-blur-xl xl:hidden">
                            <div className="flex items-center gap-3">
                                <Tv size={20} className={activeTheme.text} />
                                <p className="text-sm font-medium tracking-wide text-white">NEOSCREEN</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPinOpen(true)}
                                className="rounded-lg bg-zinc-900 p-2 text-white"
                            >
                                <Pencil size={16} />
                            </button>
                        </header>

                        <div className="relative z-10 flex flex-1 flex-col overflow-y-auto">
                            {/* Mobile Nav */}
                            <div className="flex w-full gap-2 overflow-x-auto border-b border-zinc-900 px-6 py-4 [&::-webkit-scrollbar]:hidden xl:hidden">
                                {slides.map((slide, index) => (
                                    <button
                                        key={slide.id}
                                        type="button"
                                        onClick={() => setActiveIndex(index)}
                                        className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                                            index === activeIndex
                                                ? `${activeTheme.bgSubtle} ${activeTheme.borderSubtle} ${activeTheme.text}`
                                                : 'border-transparent bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                                        }`}
                                    >
                                        <span className="mr-1 opacity-50 font-mono">{String(index + 1).padStart(2, '0')}</span>
                                        {slide.eyebrow}
                                    </button>
                                ))}
                            </div>

                            <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 lg:py-24">
                                <div
                                    key={activeSlide.id}
                                    className="grid animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16"
                                >
                                    {/* Left Text Content */}
                                    <div className="flex flex-col justify-center lg:col-span-6">
                                        <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-widest transition-colors ${activeTheme.bgSubtle} ${activeTheme.borderSubtle} ${activeTheme.text}`}>
                                            {activeSlide.eyebrow}
                                        </div>

                                        <div className="mt-8 font-sans text-4xl font-semibold tracking-tight text-white normal-case sm:text-5xl lg:text-[3.5rem] lg:leading-[1.15]">
                                            {activeSlide.title}
                                        </div>

                                        <div className="mt-6 font-sans text-lg font-light leading-relaxed text-zinc-400 normal-case">
                                            {activeSlide.body}
                                        </div>

                                        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
                                            {activeSlide.metrics.map((metric) => (
                                                <div key={metric.label} className="flex flex-col rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 ring-1 ring-white/5 backdrop-blur-sm">
                                                    <p className="font-sans text-[10px] font-medium uppercase tracking-widest text-zinc-500 normal-case">{metric.label}</p>
                                                    <p className="mt-2 font-sans text-xl font-medium tracking-tight text-white normal-case xl:text-2xl">{metric.value}</p>
                                                    <p className="mt-1.5 font-sans text-[11px] leading-snug text-zinc-400 normal-case">{metric.detail}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right Image Content */}
                                    <div className="lg:col-span-6">
                                        <div className="overflow-hidden rounded-[24px] border border-zinc-800 bg-black shadow-2xl ring-1 ring-white/5">
                                            <div className="flex items-center border-b border-zinc-900 bg-zinc-950 px-4 py-3">
                                                <div className="flex gap-1.5">
                                                    <div className="h-2 w-2 rounded-full bg-zinc-800" />
                                                    <div className="h-2 w-2 rounded-full bg-zinc-800" />
                                                    <div className="h-2 w-2 rounded-full bg-zinc-800" />
                                                </div>
                                                <p className="ml-3 truncate text-[10px] font-medium uppercase tracking-widest text-zinc-500">{activeSlide.imageLabel}</p>
                                            </div>
                                            <img src={activeSlide.imageUrl} alt={activeSlide.imageLabel} className="h-auto w-full object-cover" />
                                        </div>

                                        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            {activeSlide.bullets.map((bullet) => (
                                                <div key={bullet} className="flex gap-4">
                                                    <div className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${activeTheme.bullet}`} />
                                                    <p className="font-sans text-sm font-light leading-relaxed text-zinc-300 normal-case">{bullet}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {activeSlide.note && (
                                            <div className="mt-8 border-l-2 border-zinc-800 pl-5">
                                                <p className="font-sans text-xs font-medium leading-relaxed text-zinc-500 normal-case">{activeSlide.note}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Slide Navigation */}
                                <div className="mt-20 flex w-full items-center justify-between border-t border-zinc-900 pt-8">
                                    <button
                                        type="button"
                                        onClick={() => setActiveIndex((value) => Math.max(value - 1, 0))}
                                        disabled={activeIndex === 0}
                                        className="group flex items-center gap-3 text-sm font-medium text-zinc-500 transition-colors hover:text-white disabled:pointer-events-none disabled:opacity-30"
                                    >
                                        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                                        <span className="hidden sm:inline">Sebelumnya</span>
                                    </button>

                                    <div className="flex items-center gap-3">
                                        {slides.map((slide, index) => (
                                            <button
                                                key={slide.id}
                                                type="button"
                                                onClick={() => setActiveIndex(index)}
                                                className={`h-1.5 rounded-full transition-all duration-300 ${index === activeIndex ? `w-8 ${activeTheme.bgSolid}` : 'w-1.5 bg-zinc-800 hover:bg-zinc-600'}`}
                                                aria-label={`Slide ${index + 1}`}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setActiveIndex((value) => Math.min(value + 1, slides.length - 1))}
                                        disabled={activeIndex === slides.length - 1}
                                        className="group flex items-center gap-3 text-sm font-medium text-zinc-500 transition-colors hover:text-white disabled:pointer-events-none disabled:opacity-30"
                                    >
                                        <span className="hidden sm:inline">Berikutnya</span>
                                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Studio Sidebar */}
                        {studioOpen && (
                            <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none">
                                <aside className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-8 shadow-2xl transition-transform animate-in slide-in-from-right duration-300 sm:w-[480px]">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">Editor</p>
                                            <h2 className="mt-2 font-sans text-xl font-medium tracking-tight text-white normal-case">Edit Konten</h2>
                                        </div>
                                        <button type="button" onClick={() => setStudioOpen(false)} className="rounded-full bg-zinc-900 p-2 text-zinc-400 transition-colors hover:bg-white hover:text-black">
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <div className="mt-10 space-y-8">
                                        <div>
                                            <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">Global Warna Tema</p>
                                            <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                                                Perubahan demo bersifat sementara di browser ini, sehingga data pitch tetap bisa mengikuti update sistem dari waktu ke waktu.
                                            </p>
                                            <div className="mt-4 flex flex-wrap gap-4">
                                                {Object.values(THEMES).map((t) => (
                                                    <button
                                                        key={t.id}
                                                        type="button"
                                                        onClick={() => updateTheme(t.id as ThemeId)}
                                                        className={`h-8 w-8 rounded-full transition-all ${themeId === t.id ? `ring-2 ring-white ring-offset-2 ring-offset-zinc-950` : 'opacity-40 hover:opacity-100 hover:scale-110'}`}
                                                        style={{ backgroundColor: t.hex }}
                                                        aria-label={`Pilih warna ${t.label}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <hr className="border-zinc-800" />

                                        <div className="space-y-4">
                                            <StudioField label="Kategori (Eyebrow)" value={activeSlide.eyebrow} onChange={(value) => updateActiveSlide({ eyebrow: value })} />
                                            <StudioArea label="Judul Utama" value={activeSlide.title} onChange={(value) => updateActiveSlide({ title: value })} rows={3} />
                                            <StudioArea label="Deskripsi" value={activeSlide.body} onChange={(value) => updateActiveSlide({ body: value })} rows={5} />
                                            <StudioField label="Label Gambar" value={activeSlide.imageLabel} onChange={(value) => updateActiveSlide({ imageLabel: value })} />
                                        </div>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(event) => handleImageUpload(event.target.files?.[0])}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`flex w-full items-center justify-center gap-2 rounded-xl border border-dashed transition-colors px-5 py-4 text-sm font-medium ${activeTheme.borderSubtle} ${activeTheme.bgSubtle} ${activeTheme.text} hover:opacity-80`}
                                        >
                                            <ImageUp size={16} /> Ganti Gambar Slide
                                        </button>

                                        <div>
                                            <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">Data Statistik</p>
                                            <div className="mt-4 space-y-4">
                                                {activeSlide.metrics.map((metric, index) => (
                                                    <div key={`${index}-${metric.label}`} className="grid grid-cols-2 gap-3 rounded-xl bg-zinc-900 p-4">
                                                        <div className="col-span-2">
                                                            <StudioField label="Nilai (Besar)" value={metric.value} onChange={(value) => updateMetric(index, { value })} />
                                                        </div>
                                                        <StudioField label="Label" value={metric.label} onChange={(value) => updateMetric(index, { label: value })} />
                                                        <StudioField label="Detail Kecil" value={metric.detail} onChange={(value) => updateMetric(index, { detail: value })} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">Poin Utama</p>
                                            <div className="mt-4 space-y-4">
                                                {activeSlide.bullets.map((bullet, index) => (
                                                    <StudioArea key={index} label={`Poin ${index + 1}`} value={bullet} onChange={(value) => updateBullet(index, value)} rows={2} />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4 border-t border-zinc-800">
                                            <button
                                                type="button"
                                                onClick={applySessionDraft}
                                                className={`flex-1 rounded-xl px-5 py-3.5 text-sm font-medium text-white transition-all ${activeTheme.bgSolid} ${activeTheme.bgSolidHover}`}
                                            >
                                                Terapkan Sesi Ini
                                            </button>
                                            <button
                                                type="button"
                                                onClick={resetSlides}
                                                aria-label="Reset draft demo"
                                                className="rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
                                            >
                                                <RotateCcw size={16} />
                                            </button>
                                        </div>
                                        {saveNotice && (
                                            <p className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-xs leading-relaxed text-zinc-400">
                                                {saveNotice}
                                            </p>
                                        )}
                                    </div>
                                </aside>
                            </div>
                        )}
                    </section>
                </div>

                {/* PIN Modal */}
                {pinOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 p-6 backdrop-blur-md animate-in fade-in duration-200">
                        <div className="w-full max-w-sm rounded-[24px] border border-zinc-800 bg-zinc-950 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="p-8">
                                <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full transition-colors ${activeTheme.bgSubtle} ${activeTheme.text}`}>
                                    <Lock size={20} />
                                </div>
                                <h2 className="mt-6 text-center font-sans text-xl font-medium tracking-tight text-white normal-case">Autentikasi</h2>
                                <p className="mt-2 text-center font-sans text-sm font-normal text-zinc-500 normal-case">Akses eksklusif untuk tim.</p>

                                <input
                                    value={pin}
                                    onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 8))}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') unlockStudio();
                                    }}
                                    inputMode="numeric"
                                    autoFocus
                                    placeholder="••••"
                                    className={`mt-8 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-center font-mono text-2xl tracking-[0.5em] text-white outline-none transition-all focus:border-transparent focus:ring-1 ${activeTheme.ring}`}
                                />
                                {pinError && <p className="mt-3 text-center text-xs font-medium text-red-400">{pinError}</p>}

                                <div className="mt-8 flex gap-3">
                                    <button type="button" onClick={() => setPinOpen(false)} className="flex-1 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800">
                                        Batal
                                    </button>
                                    <button type="button" onClick={unlockStudio} className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium text-white transition-colors ${activeTheme.bgSolid} ${activeTheme.bgSolidHover}`}>
                                        Masuk
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}

function StudioField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
    return (
        <label className="block">
            <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">{label}</span>
            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-normal text-white outline-none transition-all focus:border-white focus:ring-1 focus:ring-white"
            />
        </label>
    );
}

function StudioArea({ label, value, onChange, rows }: { label: string; value: string; rows: number; onChange: (value: string) => void }) {
    return (
        <label className="block">
            <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">{label}</span>
            <textarea
                value={value}
                rows={rows}
                onChange={(event) => onChange(event.target.value)}
                className="mt-2 w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-normal leading-relaxed text-white outline-none transition-all focus:border-white focus:ring-1 focus:ring-white [&::-webkit-scrollbar]:hidden"
            />
        </label>
    );
}
