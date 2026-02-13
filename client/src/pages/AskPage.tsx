import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Source {
    documentId: string;
    documentName: string;
    chunkText: string;
    similarity: number;
}

interface QAResponse {
    question: string;
    answer: string;
    sources: Source[];
}

function AskPage() {
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<QAResponse | null>(null);
    const [error, setError] = useState('');
    const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());

    const handleAsk = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setResult(null);

        if (!question.trim()) {
            setError('Please enter a question.');
            return;
        }

        if (question.trim().length < 3) {
            setError('Question is too short. Please be more specific.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/ask`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: question.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to get answer.');
                return;
            }

            setResult(data);
            setExpandedSources(new Set());
        } catch {
            setError('Failed to connect to server. Please check if the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const toggleSource = (index: number) => {
        setExpandedSources((prev) => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    };

    return (
        <div className="page ask-page">
            <h1>💬 Ask a Question</h1>
            <p className="page-subtitle">Ask anything about your uploaded documents.</p>

            <form onSubmit={handleAsk} className="ask-form">
                <div className="input-group">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="e.g., What is the main topic discussed in my documents?"
                        className="ask-input"
                        disabled={loading}
                    />
                    <button type="submit" className="ask-button" disabled={loading || !question.trim()}>
                        {loading ? <span className="spinner-small"></span> : '🔍 Ask'}
                    </button>
                </div>
            </form>

            {error && <div className="alert alert-error">{error}<button onClick={() => setError('')}>✕</button></div>}

            {loading && (
                <div className="loading-answer">
                    <div className="spinner"></div>
                    <p>Searching documents and generating answer...</p>
                </div>
            )}

            {result && (
                <div className="answer-container">
                    <div className="answer-card">
                        <div className="answer-header">
                            <span className="answer-icon">✨</span>
                            <h2>Answer</h2>
                        </div>
                        <div className="answer-text">{result.answer}</div>
                    </div>

                    {result.sources.length > 0 && (
                        <div className="sources-section">
                            <h3>📚 Sources ({result.sources.length})</h3>
                            <p className="sources-hint">Click a source to see the relevant passage</p>
                            <div className="sources-list">
                                {result.sources.map((source, i) => (
                                    <div key={i} className={`source-card ${expandedSources.has(i) ? 'expanded' : ''}`}>
                                        <div className="source-header" onClick={() => toggleSource(i)}>
                                            <div className="source-info">
                                                <span className="source-doc-icon">📄</span>
                                                <span className="source-name">{source.documentName}</span>
                                                <span className="source-similarity">
                                                    {Math.round(source.similarity * 100)}% match
                                                </span>
                                            </div>
                                            <span className="source-toggle">{expandedSources.has(i) ? '▼' : '▶'}</span>
                                        </div>
                                        {expandedSources.has(i) && (
                                            <div className="source-content">
                                                <pre>{source.chunkText}</pre>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default AskPage;
