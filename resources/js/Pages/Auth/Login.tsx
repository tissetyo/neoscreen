import { useEffect, FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function Login({ status }: { status?: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <Head title="Staff Login" />

            {/* Premium Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#d4af37]/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] bg-[#d4af37]/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md z-10">
                {/* Logo / Title */}
                <div className="text-center mb-10">
                    <h1 className="text-[#d4af37] text-4xl font-bold tracking-tighter mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                        NEOSCREEN
                    </h1>
                    <p className="text-white/40 text-sm font-medium tracking-widest uppercase">Management Portal</p>
                </div>

                {status && (
                    <div className="mb-4 font-medium text-sm text-green-500 text-center">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                    <div className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2 ml-1" htmlFor="email">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37]/50 transition-all"
                                placeholder="name@hotel.com"
                                autoComplete="username"
                                autoFocus
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && <p className="mt-2 text-xs text-red-500 ml-1">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2 ml-1" htmlFor="password">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37]/50 transition-all"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            {errors.password && <p className="mt-2 text-xs text-red-500 ml-1">{errors.password}</p>}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <label className="flex items-center cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 border rounded-md transition-all ${data.remember ? 'bg-[#d4af37] border-[#d4af37]' : 'bg-transparent border-white/20'}`}>
                                        {data.remember && (
                                            <svg className="w-3.5 h-3.5 text-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <span className="ml-3 text-white/60 text-sm font-medium group-hover:text-white/80 transition-colors">Keep me signed in</span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] text-black font-bold py-4 rounded-2xl shadow-lg hover:shadow-[#d4af37]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none uppercase tracking-widest text-xs"
                        >
                            {processing ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-white/30 text-xs">
                        &copy; {new Date().getFullYear()} Neoscreen TV Systems. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
