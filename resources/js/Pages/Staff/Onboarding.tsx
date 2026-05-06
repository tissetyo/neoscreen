import StaffLayout from '@/Layouts/StaffLayout';
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle2, Circle, ExternalLink, PartyPopper, Sparkles } from 'lucide-react';

export interface ChecklistItem {
    id: string;
    title: string;
    description: string;
    done: boolean;
    href: string;
    manual: boolean;
    external?: boolean;
}

interface Props {
    slug: string;
    hotel: { id: string; name: string; slug: string };
    checklist: ChecklistItem[];
}

export default function Onboarding({ slug, hotel, checklist }: Props) {
    const doneCount = checklist.filter((c) => c.done).length;
    const pct = checklist.length ? Math.round((100 * doneCount) / checklist.length) : 100;

    const markManual = (step: string) => {
        router.patch(`/${slug}/frontoffice/onboarding/step`, { step }, { preserveScroll: true });
    };

    const dismiss = () => {
        if (!confirm('Hide the checklist banner on the overview? You can open this page again anytime.')) return;
        router.patch(`/${slug}/frontoffice/onboarding/dismiss`, {}, { preserveScroll: true });
    };

    return (
        <StaffLayout header="Property setup">
            <Head title="Onboarding" />
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-medium text-slate-800">Get to value fast</h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Complete these steps for <span className="font-semibold text-slate-700">{hotel.name}</span> so guest TVs, staff tools, and trust signals work end-to-end.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Progress</p>
                            <p className="text-2xl font-semibold text-teal-600">{pct}%</p>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                            <Sparkles className="text-teal-600" size={26} />
                        </div>
                    </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div className="h-3 rounded-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all" style={{ width: `${Math.max(pct, 3)}%` }} />
                </div>

                <div className="space-y-3">
                    {checklist.map((item) => (
                        <div
                            key={item.id}
                            className={`bg-white border rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 transition-colors ${
                                item.done ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200'
                            }`}
                        >
                            <div className="shrink-0">
                                {item.done ? (
                                    <CheckCircle2 className="text-emerald-500" size={28} />
                                ) : (
                                    <Circle className="text-slate-300" size={28} />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-800">{item.title}</p>
                                <p className="text-sm text-slate-500 mt-0.5">{item.description}</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <a
                                        href={item.href}
                                        target={item.external ? '_blank' : undefined}
                                        rel={item.external ? 'noreferrer' : undefined}
                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-100 transition-colors"
                                    >
                                        Open {item.external && <ExternalLink size={12} />}
                                    </a>
                                    {item.manual && !item.done && (
                                        <button
                                            type="button"
                                            onClick={() => markManual(item.id)}
                                            className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            Mark done
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-slate-900 text-white rounded-2xl p-6">
                    <div className="flex items-center gap-3">
                        <PartyPopper size={22} className="text-amber-300 shrink-0" />
                        <p className="text-sm text-slate-200">
                            When you are finished, dismiss the banner on the overview — or keep it until every step is green.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={dismiss}
                        className="shrink-0 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium border border-white/20 transition-colors"
                    >
                        Dismiss overview banner
                    </button>
                </div>

                <p className="text-center text-sm text-slate-400">
                    Need context?{' '}
                    <Link href={`/${slug}/frontoffice/guide`} className="font-medium text-teal-600 hover:text-teal-800">
                        Open the Help & documentation hub
                    </Link>
                </p>
            </div>
        </StaffLayout>
    );
}
