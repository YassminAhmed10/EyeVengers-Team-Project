import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export function ReturnToEyeClinicPage() {
    const location = useLocation();
    const targetUrl = useMemo(() => {
        const query = new URLSearchParams(location.search);
        return query.get('target') || 'http://localhost:5173/patient';
    }, [location.search]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            window.location.href = targetUrl;
        }, 1400);

        return () => window.clearTimeout(timer);
    }, [targetUrl]);

    return (
        <main
            className="flex min-h-screen items-center justify-center p-5"
            aria-live="polite"
            style={{ filter: 'none' }}
        >
            <section
                className="w-full max-w-xl rounded-2xl border border-white/45 bg-white/95 p-8 text-center text-slate-900 shadow-2xl"
                style={{ filter: 'none', backdropFilter: 'none' }}
            >
                <div className="relative mx-auto mb-4 h-20 w-20">
                    <div className="absolute inset-0 animate-spin rounded-full border-[6px] border-sky-200/70 border-t-sky-500" />
                    <svg
                        className="absolute inset-[13px] h-[54px] w-[54px] animate-pulse text-sky-600"
                        viewBox="0 0 64 64"
                        fill="none"
                        aria-hidden="true"
                    >
                        <circle cx="32" cy="32" r="16" stroke="currentColor" strokeWidth="4" />
                        <path d="M32 22v20M22 32h20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div>

                <h1 className="section-title text-3xl font-bold text-slate-900">Returning To Eye Clinic...</h1>
                <p className="mt-2 text-sm text-slate-600">Please wait while we complete your secure redirection.</p>
            </section>
        </main>
    );
}
