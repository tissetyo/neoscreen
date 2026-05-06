import StaffLayout from '@/Layouts/StaffLayout';
import { Head, Link } from '@inertiajs/react';
import {
    BookOpen,
    Tv,
    Building2,
    Bell,
    MessageSquare,
    ChefHat,
    Clock,
    Shield,
    Radio,
    Users,
    FileText,
    Lock,
    BarChart3,
    ExternalLink,
} from 'lucide-react';

interface Props {
    context: 'frontoffice' | 'admin';
    slug: string | null;
    hotelName: string | null;
}

const sections = [
    {
        id: 'portal',
        title: 'Portal separation',
        icon: Shield,
        blocks: [
            {
                heading: 'Use one portal, keep surfaces separate',
                body: 'Open /portal for the product entry point. Super Admin uses /admin, hotel staff use /{hotel-slug}/frontoffice, TVs use /d/{hotel-slug}/{room-code}, physical boxes use /setup-stb, and guest phones use /{hotel-slug}/mobile/{session-id}.',
            },
            {
                heading: 'Why this matters for client handoff',
                body: 'Operators should never need to guess which interface they are in. Admin changes platform and canvas settings; Front Office manages live hotel operations; Room TV is guest-facing; Mobile Portal is session-bound and QR-only; STB Setup is hardware-only.',
            },
        ],
    },
    {
        id: 'start',
        title: 'Getting started',
        icon: BookOpen,
        blocks: [
            {
                heading: 'What Neotiv connects',
                body: 'Neotiv links three surfaces: guest room TVs (dashboard), set-top boxes (STB) that poll room status, and the front-office web panel for staff. Platform administrators manage hotels, TV canvas, and accounts.',
            },
            {
                heading: 'Typical first day',
                body: 'Create rooms with PINs → verify WiFi and TV settings → send a test notification → open TV preview → pair one STB on staging hardware. Use the Setup checklist under Front Desk for a guided order.',
            },
        ],
    },
    {
        id: 'rooms',
        title: 'Rooms & guest login',
        icon: Building2,
        blocks: [
            {
                heading: 'Room codes & PIN',
                body: 'Each room has a code (for example 101) shown in URLs like /d/your-hotel-slug/101. Guests authenticate on the TV splash with the PIN you configure per room.',
            },
            {
                heading: 'Occupancy',
                body: 'Mark rooms occupied when guests check in so analytics and widgets reflect the correct state.',
            },
        ],
    },
    {
        id: 'tv',
        title: 'TV dashboard & STB',
        icon: Tv,
        blocks: [
            {
                heading: 'Grid vs slideshow',
                body: 'Managers set screen mode under Hotel Settings. Admins can drag the full 24×14 canvas under Admin → Hotels → TV Canvas.',
            },
            {
                heading: 'Live config API',
                body: 'Devices call GET /api/hotel/your-slug/tv-config for promos, services, announcements, WiFi, and layout. TVs poll GET /api/room/ROOM_UUID/status for alarms, chat counts, and notifications.',
            },
            {
                heading: 'STB pairing',
                body: 'Open /setup-stb on the device. The TV shows a six-character pairing code. In Front Office → Rooms, select a room and click “Pair STB to Room”, then enter the code. The STB polls /api/stb/poll and redirects to /d/{hotel-slug}/{room-code} after pairing.',
            },
        ],
    },
    {
        id: 'stb-install',
        title: 'STB installation',
        icon: Tv,
        blocks: [
            {
                heading: 'Build and install APK',
                body: 'From neotiv-stb/:\nchmod +x deploy.sh\n./deploy.sh 192.168.1.100 grand-neoscreen 101 http://127.0.0.1:8000\n\nFor manual install:\nadb connect 192.168.1.100:5555\nadb install -r app/build/outputs/apk/debug/app-debug.apk',
            },
            {
                heading: 'Headless ADB provisioning',
                body: 'Use this for bulk deployment:\nadb shell am start -n com.neotiv.stb/.SetupActivity --es base_url "https://tv.neotiv.com" --es hotel_slug "grand-neoscreen" --es room_code "101"\n\nThe native wrapper stores server URL, hotel slug, and room code before launching the WebView.',
            },
            {
                heading: 'Remote control mapping',
                body: 'The Android wrapper maps D-pad Up/Down/Left/Right to ArrowUp/ArrowDown/ArrowLeft/ArrowRight, OK/Center to Enter, Back to Escape, digits to 0-9, and Delete to Backspace. These events feed the TV useDpadNavigation hook.',
            },
            {
                heading: 'Troubleshooting checklist',
                body: 'If ADB cannot connect: enable Developer Options, USB Debugging, and ADB over network on the STB. If WebView is blank: verify Android System WebView version or update it from Play Store/market intent. To reset a device: adb shell pm clear com.neotiv.stb.',
            },
            {
                heading: 'Bulk deployment pattern',
                body: 'Create rooms.csv:\n192.168.1.101,grand-neoscreen,101\n192.168.1.102,grand-neoscreen,102\n\nThen loop:\nwhile IFS=, read -r ip slug room; do ./deploy.sh "$ip" "$slug" "$room" "https://tv.neotiv.com"; done < rooms.csv',
            },
        ],
    },
    {
        id: 'communications',
        title: 'Chat & notifications',
        icon: MessageSquare,
        blocks: [
            {
                heading: 'Chat',
                body: 'Guests write from the TV; staff reply from Front Office → Chat. Opening a thread marks guest messages as read for throughput metrics.',
            },
            {
                heading: 'Broadcast notifications',
                body: 'Notifications can target one room or all rooms. Guests dismiss on TV; is_read tracks guest acknowledgement. Staff can log a separate staff acknowledgement for audit.',
            },
        ],
    },
    {
        id: 'operations',
        title: 'Requests & alarms',
        icon: ChefHat,
        blocks: [
            {
                heading: 'Service requests',
                body: 'Statuses: pending → confirmed (picked up) → completed or cancelled. Staff acknowledgement timestamps prove the desk saw the ticket; guests can acknowledge completed orders from integrations calling the guest-ack API.',
            },
            {
                heading: 'Wake-up alarms',
                body: 'Guests schedule alarms on the TV. Staff mark them as called; acknowledged_at stores who cleared the item.',
            },
        ],
    },
    {
        id: 'trust',
        title: 'Trust & acknowledgements',
        icon: Shield,
        blocks: [
            {
                heading: 'Why acknowledgements exist',
                body: 'Hotels need evidence that both sides saw critical signals: staff receipt of a request, guest read of a notification, and staff closure of alarms. Analytics surfaces averages so you can coach the team.',
            },
            {
                heading: 'Where to click',
                body: 'Service Requests: “Acknowledge receipt” then change status. Notifications: “Staff reviewed”. Alarms: “Mark as called”.',
            },
        ],
    },
    {
        id: 'analytics',
        title: 'Analytics that drive decisions',
        icon: BarChart3,
        blocks: [
            {
                heading: 'Front Office → Analytics',
                body: 'Fourteen-day trends cover service volume, chat intensity, notification throughput, top requested services, staff acknowledgement speed, and alarm volume. Click tiles still jump straight into operational screens.',
            },
        ],
    },
    {
        id: 'accounts',
        title: 'Accounts & roles',
        icon: Users,
        blocks: [
            {
                heading: 'Roles',
                body: 'Superadmin: cross-hotel platform. Manager: services, settings, promos. Front office: day-to-day guest operations.',
            },
            {
                heading: 'Creating staff',
                body: 'Superadmin creates accounts under Admin → Accounts and assigns the hotel. Managers should onboard passwords privately.',
            },
        ],
    },
    {
        id: 'privacy',
        title: 'Privacy & retention',
        icon: Lock,
        blocks: [
            {
                heading: 'Guest data',
                body: 'Guest names, messages, and PINs are operational data — restrict exports, rotate passwords, and suspend accounts when staff leave.',
            },
            {
                heading: 'Device trust',
                body: 'TV endpoints are unauthenticated by design for STB access; keep room IDs secret and physical access to hardware controlled.',
            },
        ],
    },
    {
        id: 'api',
        title: 'API reference (quick)',
        icon: Radio,
        blocks: [
            {
                heading: 'Core endpoints',
                body: 'POST /api/room/login — PIN login. GET /api/room/ROOM_UUID/status — polled status. GET /api/hotel/HOTEL_SLUG/tv-config — hotel bundle. Room chat, alarms, notifications, and service requests under /api/room/ROOM_UUID/…',
            },
            {
                heading: 'Guest acknowledgement',
                body: 'PATCH /api/room/ROOM_UUID/service-request/REQUEST_UUID/guest-ack — call after status is completed so analytics can track guest-confirmed fulfillment.',
            },
        ],
    },
];

export default function Guide({ context, slug, hotelName }: Props) {
    const base = slug ? `/${slug}/frontoffice` : '/admin';
    const isStaff = context === 'frontoffice';

    return (
        <StaffLayout header="Help & documentation">
            <Head title="Help & documentation" />
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
                <aside className="lg:w-56 shrink-0 space-y-4">
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm sticky top-6">
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-3">On this page</p>
                        <nav className="space-y-1">
                            {sections.map((s) => (
                                <a
                                    key={s.id}
                                    href={`#${s.id}`}
                                    className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-teal-700 py-1.5 px-2 rounded-lg hover:bg-teal-50 transition-colors"
                                >
                                    <s.icon size={14} className="shrink-0 opacity-70" />
                                    <span className="truncate">{s.title}</span>
                                </a>
                            ))}
                        </nav>
                        {isStaff && (
                            <Link
                                href={`/${slug}/frontoffice/onboarding`}
                                className="mt-4 block text-center text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 py-2.5 rounded-xl transition-colors"
                            >
                                Open setup checklist
                            </Link>
                        )}
                    </div>
                </aside>

                <div className="flex-1 min-w-0 space-y-10">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Documentation hub</h1>
                        <p className="text-slate-500 mt-2 max-w-2xl">
                            {isStaff
                                ? `Guides for ${hotelName ?? 'your hotel'}. This page is static product documentation — bookmark it for training.`
                                : 'Platform-level documentation for super administrators.'}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {isStaff && (
                                <Link
                                    href={base}
                                    className="text-xs font-medium text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors"
                                >
                                    ← Back to overview
                                </Link>
                            )}
                            <a
                                href="https://laravel.com/docs"
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors inline-flex items-center gap-1"
                            >
                                Laravel docs <ExternalLink size={12} />
                            </a>
                        </div>
                    </div>

                    {sections.map((section) => (
                        <section key={section.id} id={section.id} className="scroll-mt-24">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                                    <section.icon size={20} />
                                </div>
                                <h2 className="text-xl font-medium text-slate-800">{section.title}</h2>
                            </div>
                            <div className="space-y-4">
                                {section.blocks.map((b) => (
                                    <div key={b.heading} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                        <h3 className="font-medium text-slate-800 flex items-center gap-2">
                                            <FileText size={16} className="text-slate-400" /> {b.heading}
                                        </h3>
                                        <p className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-line">{b.body}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}

                    <footer className="border-t border-slate-200 pt-8 text-center text-xs text-slate-400">
                        <p className="flex items-center justify-center gap-2">
                            <Bell size={14} /> Neotiv v2 — internal documentation snapshot. Extend this page as your product grows.
                        </p>
                    </footer>
                </div>
            </div>
        </StaffLayout>
    );
}
