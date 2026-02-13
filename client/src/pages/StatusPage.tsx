import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ServiceStatus {
    status: 'healthy' | 'unhealthy';
    latency?: number;
    error?: string;
}

interface HealthData {
    overall: string;
    services: Record<string, ServiceStatus>;
    timestamp: string;
}

function StatusPage() {
    const [health, setHealth] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchHealth = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/api/health`);
            const data = await res.json();
            setHealth(data);
        } catch {
            setError('Cannot reach backend server. Make sure it is running on port 3001.');
            setHealth(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [fetchHealth]);

    const serviceLabels: Record<string, { label: string; icon: string; description: string }> = {
        backend: { label: 'Backend Server', icon: '🖥️', description: 'Express.js API server' },
        database: { label: 'PostgreSQL', icon: '🗄️', description: 'Neon.tech database' },
        chromadb: { label: 'ChromaDB', icon: '🧬', description: 'Vector store for embeddings' },
        llm: { label: 'Gemini AI', icon: '🤖', description: 'Google Gemini 2.5 Flash' },
    };

    return (
        <div className="page status-page">
            <h1>📊 System Status</h1>
            <p className="page-subtitle">Real-time health of all services.</p>

            <div className="status-header">
                {health && (
                    <div className={`overall-status ${health.overall === 'healthy' ? 'healthy' : 'degraded'}`}>
                        <span className="overall-dot"></span>
                        <span>{health.overall === 'healthy' ? 'All Systems Operational' : 'Some Services Degraded'}</span>
                    </div>
                )}
                <button className="refresh-btn" onClick={fetchHealth} disabled={loading}>
                    {loading ? <span className="spinner-small"></span> : '🔄'} Refresh
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {loading && !health ? (
                <div className="loading-state"><div className="spinner"></div><p>Checking services...</p></div>
            ) : health ? (
                <div className="status-grid">
                    {Object.entries(health.services).map(([key, service]) => {
                        const info = serviceLabels[key] || { label: key, icon: '❓', description: '' };
                        return (
                            <div key={key} className={`status-card ${service.status}`}>
                                <div className="status-card-header">
                                    <span className="status-icon">{info.icon}</span>
                                    <div>
                                        <h3>{info.label}</h3>
                                        <p className="status-description">{info.description}</p>
                                    </div>
                                </div>
                                <div className="status-card-body">
                                    <div className={`status-indicator ${service.status}`}>
                                        <span className="status-dot"></span>
                                        <span>{service.status === 'healthy' ? 'Healthy' : 'Unhealthy'}</span>
                                    </div>
                                    {service.latency !== undefined && (
                                        <span className="latency">{service.latency}ms</span>
                                    )}
                                </div>
                                {service.error && (
                                    <div className="status-error">⚠️ {service.error}</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : null}

            {health && (
                <p className="last-checked">
                    Last checked: {new Date(health.timestamp).toLocaleTimeString()}
                </p>
            )}
        </div>
    );
}

export default StatusPage;
