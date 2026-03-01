import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    padding: 'var(--sp-8)',
                    textAlign: 'center',
                    background: '#f9f9f9',
                    fontFamily: 'var(--font-accent)'
                }}>
                    <h2 style={{ marginBottom: 'var(--sp-4)', color: 'var(--sn-black)' }}>Oups ! Quelque chose s'est mal passé.</h2>
                    <p style={{ color: 'var(--sn-gray)', marginBottom: 'var(--sp-6)', maxWidth: '400px' }}>
                        Une erreur inattendue est survenue. Cela peut être dû à un problème de connexion ou à un bug temporaire.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn-primary"
                        style={{ padding: '12px 24px' }}
                    >
                        Recharger la page
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                        <details style={{ marginTop: 'var(--sp-8)', textAlign: 'left', background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #ddd', maxWidth: '100%', overflow: 'auto' }}>
                            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Détails de l'erreur (Dev only)</summary>
                            <pre style={{ fontSize: '0.8rem', marginTop: '8px', whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
