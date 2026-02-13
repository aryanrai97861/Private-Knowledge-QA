import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Document {
    id: string;
    filename: string;
    chunk_count: number;
    uploaded_at: string;
}

function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [dragActive, setDragActive] = useState(false);

    const fetchDocuments = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/documents`);
            const data = await res.json();
            setDocuments(data.documents || []);
        } catch {
            setError('Failed to load documents. Is the server running?');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const uploadFile = async (file: File) => {
        setError('');
        setSuccess('');

        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!['txt', 'md', 'csv', 'log', 'json', 'pdf'].includes(ext || '')) {
            setError('Only these files are allowed: .txt, .md, .csv, .log, .json, .pdf');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`${API_URL}/api/documents`, {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Upload failed.');
                return;
            }

            setSuccess(data.message);
            fetchDocuments();
        } catch {
            setError('Failed to upload. Check your connection and server.');
        } finally {
            setUploading(false);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) uploadFile(file);
        e.target.value = '';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) uploadFile(file);
    };

    const deleteDocument = async (e: React.MouseEvent, id: string, filename: string) => {
        e.stopPropagation();
        if (!window.confirm(`Delete "${filename}"? This cannot be undone.`)) return;

        try {
            const res = await fetch(`${API_URL}/api/documents/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to delete.');
                return;
            }

            setSuccess(data.message);
            fetchDocuments();
        } catch {
            setError('Failed to delete document.');
        }
    };

    return (
        <div className="page documents-page">
            <h1>📄 Documents</h1>
            <p className="page-subtitle">Upload text files to build your knowledge base.</p>

            {/* Upload area */}
            <div
                className={`upload-zone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
            >
                <input
                    id="file-input"
                    type="file"
                    accept=".txt,.md,.csv,.log,.json,.pdf"
                    onChange={handleFileInput}
                    hidden
                />
                {uploading ? (
                    <div className="upload-content">
                        <div className="spinner"></div>
                        <p>Processing & indexing document...</p>
                    </div>
                ) : (
                    <div className="upload-content">
                        <div className="upload-icon">📥</div>
                        <p className="upload-title">Drop a file or click to upload</p>
                        <p className="upload-hint">Supports .txt, .md, .csv, .log, .json, .pdf (max 10MB)</p>
                    </div>
                )}
            </div>

            {/* Messages */}
            {error && <div className="alert alert-error">{error}<button onClick={() => setError('')}>✕</button></div>}
            {success && <div className="alert alert-success">{success}<button onClick={() => setSuccess('')}>✕</button></div>}

            {/* Document list */}
            <div className="documents-list">
                <h2>Uploaded Documents {documents.length > 0 && <span className="badge">{documents.length}</span>}</h2>
                {loading ? (
                    <div className="loading-state"><div className="spinner"></div><p>Loading documents...</p></div>
                ) : documents.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📂</div>
                        <p>No documents yet. Upload your first file to get started!</p>
                    </div>
                ) : (
                    <div className="doc-grid">
                        {documents.map((doc) => (
                            <div key={doc.id} className="doc-card">
                                <div className="doc-info">
                                    <div className="doc-icon">📄</div>
                                    <div>
                                        <h3 className="doc-name">{doc.filename}</h3>
                                        <div className="doc-meta">
                                            <span>{doc.chunk_count} chunks</span>
                                            <span>•</span>
                                            <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="delete-btn" onClick={(e) => deleteDocument(e, doc.id, doc.filename)} title="Delete">
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DocumentsPage;
