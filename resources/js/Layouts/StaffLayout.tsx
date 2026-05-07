import { useEffect, useMemo, useState, PropsWithChildren, ReactNode } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { 
    LayoutDashboard, BedDouble, Bell, MessageSquare, 
    Clock, ChefHat, Tag, Settings, Users, LogOut,
    ChevronLeft, ChevronRight, Building2, Megaphone,
    ShieldCheck, Menu, X, BarChart3, Wrench, BookOpen, ClipboardList, DoorOpen,
    CreditCard, Router, CheckCircle2, AlertTriangle, Info
} from 'lucide-react';

interface StaffLayoutProps {
    header?: ReactNode;
    fullBleed?: boolean;
}

export default function StaffLayout({ children, header, fullBleed = false }: PropsWithChildren<StaffLayoutProps>) {
    const { auth, hotel, slug, flash, errors } = usePage<any>().props;
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);
    const user = auth?.user;
    const isAdmin = user?.role === 'superadmin';
    const isManager = user?.role === 'manager' || isAdmin;
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const staffNav = slug ? [
        { label: 'Overview', icon: LayoutDashboard, href: `/${slug}/frontoffice` },
        { label: 'Portal', icon: DoorOpen, href: '/portal' },
        { label: 'Setup checklist', icon: ClipboardList, href: `/${slug}/frontoffice/onboarding` },
        { label: 'Help & docs', icon: BookOpen, href: `/${slug}/frontoffice/guide` },
        { label: 'Rooms', icon: BedDouble, href: `/${slug}/frontoffice/rooms` },
        { label: 'Chat', icon: MessageSquare, href: `/${slug}/frontoffice/chat` },
        { label: 'Notifications', icon: Bell, href: `/${slug}/frontoffice/notifications` },
        { label: 'Alarms', icon: Clock, href: `/${slug}/frontoffice/alarms` },
        { label: 'Requests', icon: ChefHat, href: `/${slug}/frontoffice/requests` },
        { label: 'Promos', icon: Tag, href: `/${slug}/frontoffice/promos` },
        { label: 'Analytics', icon: BarChart3, href: `/${slug}/frontoffice/analytics` },
    ] : [];

    const adminNav = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
        { label: 'Portal', icon: DoorOpen, href: '/portal' },
        { label: 'Hotels', icon: Building2, href: '/admin/hotels' },
        { label: 'STB Fleet', icon: Router, href: '/admin/stb-fleet' },
        { label: 'Billing', icon: CreditCard, href: '/admin/billing' },
        { label: 'Accounts', icon: Users, href: '/admin/accounts' },
        { label: 'Announcements', icon: Megaphone, href: '/admin/announcements' },
        { label: 'Help & docs', icon: BookOpen, href: '/admin/guide' },
    ];

    const navItems = isAdmin ? adminNav : staffNav;
    const accentColor = isAdmin ? 'from-rose-500 to-rose-600' : 'from-teal-500 to-teal-600';
    const accentText = isAdmin ? 'text-rose-400' : 'text-teal-400';

    const formErrorMessage = useMemo(() => {
        const first = errors && typeof errors === 'object' ? Object.values(errors)[0] : null;
        return typeof first === 'string' ? first : null;
    }, [errors]);

    useEffect(() => {
        const next =
            flash?.success ? { type: 'success' as const, message: flash.success } :
            flash?.error ? { type: 'error' as const, message: flash.error } :
            flash?.warning ? { type: 'warning' as const, message: flash.warning } :
            flash?.info ? { type: 'info' as const, message: flash.info } :
            formErrorMessage ? { type: 'error' as const, message: formErrorMessage } :
            null;

        if (!next) return;
        setToast(next);
        const timer = window.setTimeout(() => setToast(null), 4200);
        return () => window.clearTimeout(timer);
    }, [flash?.success, flash?.error, flash?.warning, flash?.info, formErrorMessage]);

    const ToastIcon = toast?.type === 'success' ? CheckCircle2 : toast?.type === 'warning' ? AlertTriangle : toast?.type === 'info' ? Info : AlertTriangle;
    const toastTone = toast?.type === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
        : toast?.type === 'info'
            ? 'border-blue-200 bg-blue-50 text-blue-800'
            : toast?.type === 'warning'
                ? 'border-amber-200 bg-amber-50 text-amber-800'
                : 'border-red-200 bg-red-50 text-red-800';

    const NavLink = ({ item }: { item: typeof navItems[0] }) => {
        const active = currentPath === item.href || 
            (item.href !== '/admin' && item.href !== `/${slug}/frontoffice` && currentPath.startsWith(item.href));
        return (
            <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                    active 
                        ? 'bg-white/10 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
                <item.icon size={18} className={active ? accentText : ''} />
                {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
                {collapsed && (
                    <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 border border-white/10 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
                        {item.label}
                    </div>
                )}
            </Link>
        );
    };

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className={`flex items-center gap-3 p-5 border-b border-white/5 ${collapsed ? 'justify-center' : ''}`}>
                <div className={`w-9 h-9 bg-gradient-to-br ${accentColor} rounded-xl flex items-center justify-center shadow-lg shrink-0`}>
                    {isAdmin ? <ShieldCheck size={18} className="text-white" /> : <Building2 size={18} className="text-white" />}
                </div>
                {!collapsed && (
                    <div className="overflow-hidden">
                        <p className="text-white font-medium text-sm leading-none" style={{ fontFamily: 'Cinzel, serif' }}>NEOSCREEN</p>
                        <p className={`text-[11px] font-medium mt-1 truncate ${accentText}`}>
                            {isAdmin ? 'Super Admin' : (hotel?.name || 'Front Office')}
                        </p>
                    </div>
                )}
                <button onClick={() => setMobileOpen(false)} className={`lg:hidden ml-auto text-slate-400 hover:text-white ${collapsed ? 'hidden' : ''}`}>
                    <X size={18} />
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
                {!collapsed && (
                    <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500 px-3 mb-3">
                        {isAdmin ? 'Platform' : 'Front Desk'}
                    </p>
                )}
                {navItems.map(item => <NavLink key={item.href} item={item} />)}

                {isManager && !isAdmin && slug && (
                    <div className="pt-4 mt-4 border-t border-white/5">
                        {!collapsed && (
                            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500 px-3 mb-3">Management</p>
                        )}
                        {[
                            { label: 'Services', icon: Wrench, href: `/${slug}/frontoffice/services` },
                            { label: 'Settings', icon: Settings, href: `/${slug}/frontoffice/settings` },
                            { label: 'Team', icon: Users, href: `/${slug}/frontoffice/team` },
                        ].map(item => <NavLink key={item.href} item={item} />)}
                    </div>
                )}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-white/5 space-y-1">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden lg:flex w-full items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                >
                    {collapsed ? <ChevronRight size={18} className="mx-auto" /> : <><ChevronLeft size={18} /><span className="text-sm font-medium">Collapse</span></>}
                </button>
                <Link
                    method="post"
                    href="/logout"
                    as="button"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-400/10 transition-all w-full ${collapsed ? 'justify-center' : ''}`}
                >
                    <LogOut size={18} />
                    {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
                </Link>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-slate-50">
            {toast && (
                <div className={`fixed right-5 top-5 z-[100] flex max-w-md items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl ${toastTone}`}>
                    <ToastIcon size={18} className="mt-0.5 shrink-0" />
                    <p className="text-sm font-medium leading-relaxed">{toast.message}</p>
                    <button type="button" onClick={() => setToast(null)} className="ml-1 opacity-60 hover:opacity-100">
                        <X size={16} />
                    </button>
                </div>
            )}
            {/* Desktop Sidebar */}
            <aside 
                className={`hidden lg:flex flex-col bg-[#0B1120] transition-all duration-300 shrink-0 shadow-xl ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}
            >
                <SidebarContent />
            </aside>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <aside className="absolute left-0 top-0 bottom-0 w-[260px] bg-[#0B1120] flex flex-col shadow-2xl">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setMobileOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-800">
                            <Menu size={22} />
                        </button>
                        {header && <div className="text-xl font-medium text-slate-900">{header}</div>}
                    </div>
                    <div className="flex items-center gap-4">
                        {!isAdmin && (
                            <span className="hidden sm:block text-xs font-medium text-slate-400 uppercase tracking-widest">
                                {hotel?.name}
                            </span>
                        )}
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-slate-800 leading-none">{user?.name}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5 capitalize">{user?.role?.replace('frontoffice', 'Front Office')}</p>
                            </div>
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${accentColor} flex items-center justify-center text-white font-medium text-sm shadow-md border-2 border-white`}>
                                {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Body */}
                <main className="flex-1 overflow-y-auto bg-slate-50">
                    {fullBleed ? children : (
                        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
                            {children}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
