import React from 'react';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {error: Error | null}> {
    state = { error: null as Error | null };
    static getDerivedStateFromError(error: Error) { return { error }; }
    render() {
        if (this.state.error) {
            return (
                <div style={{ background: '#1a1a2e', color: '#fff', width: '100vw', height: '100vh', padding: '40px', fontFamily: 'monospace', overflow: 'auto' }}>
                    <h1 style={{ color: '#e74c3c', fontSize: '2rem' }}>Dashboard Crash</h1>
                    <p style={{ color: '#e74c3c', fontSize: '1.2rem', marginTop: '16px' }}>{this.state.error.message}</p>
                    <pre style={{ background: '#0d0d1a', padding: '20px', borderRadius: '8px', marginTop: '16px', fontSize: '0.9rem', whiteSpace: 'pre-wrap', color: '#aaa' }}>
                        {this.state.error.stack}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}

// Lazy import Dashboard so we catch its init errors
const Dashboard = React.lazy(() => import('./Dashboard'));

export default function DashboardWithBoundary(props: any) {
    return (
        <ErrorBoundary>
            <React.Suspense fallback={<div style={{ background: '#111', color: '#fff', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Dashboard...</div>}>
                <Dashboard {...props} />
            </React.Suspense>
        </ErrorBoundary>
    );
}
