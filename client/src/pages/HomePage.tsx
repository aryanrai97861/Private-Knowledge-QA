import { useNavigate } from 'react-router-dom';

function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="page home-page">
            <div className="hero">
                <h1 className="hero-title">
                    Your Private <span className="gradient-text">Knowledge Base</span>
                </h1>
                <p className="hero-subtitle">
                    Upload documents, ask questions, and get AI-powered answers with source attribution.
                    Your data stays private — powered by ChromaDB and Gemini.
                </p>
            </div>

            <div className="steps-container">
                <div className="step-card" onClick={() => navigate('/documents')}>
                    <div className="step-number">1</div>
                    <div className="step-icon">📄</div>
                    <h3>Upload Documents</h3>
                    <p>Add your text files — notes, articles, docs, or any text-based content.</p>
                </div>

                <div className="step-arrow">→</div>

                <div className="step-card" onClick={() => navigate('/ask')}>
                    <div className="step-number">2</div>
                    <div className="step-icon">💬</div>
                    <h3>Ask Questions</h3>
                    <p>Type your question in natural language — no special queries needed.</p>
                </div>

                <div className="step-arrow">→</div>

                <div className="step-card" onClick={() => navigate('/ask')}>
                    <div className="step-number">3</div>
                    <div className="step-icon">✨</div>
                    <h3>Get Answers</h3>
                    <p>Receive AI answers with exact sources — see which document and passage helped.</p>
                </div>
            </div>

            <div className="cta-section">
                <button className="cta-button primary" onClick={() => navigate('/documents')}>
                    Get Started — Upload a Document
                </button>
                <button className="cta-button secondary" onClick={() => navigate('/status')}>
                    Check System Status
                </button>
            </div>
        </div>
    );
}

export default HomePage;
