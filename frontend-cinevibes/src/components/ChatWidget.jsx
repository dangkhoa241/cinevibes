import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/client';

const ChatIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
);

const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const ChatWidget = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [movieContext, setMovieContext] = useState(null);
    const bottomRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, open]);

    useEffect(() => {
        const match = location.pathname.match(/^\/movie\/([^/]+)/);
        if (!match) {
            setMovieContext(null);
            return;
        }

        let cancelled = false;
        api.get(`/api/movies/${match[1]}`)
            .then(({ data }) => { if (!cancelled) setMovieContext(data); })
            .catch(() => { if (!cancelled) setMovieContext(null); });

        return () => { cancelled = true; };
    }, [location.pathname]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || loading) return;

        const nextMessages = [...messages, { role: 'user', content: text }];
        setMessages(nextMessages);
        setInput('');
        setLoading(true);
        setError(null);

        try {
            const { data } = await api.post('/api/chat', { messages: nextMessages, movieContext });
            setMessages([...nextMessages, { role: 'assistant', content: data.reply }]);
        } catch (err) {
            setError(err.response?.data?.error || 'CineBot is unavailable right now.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.wrapper}>
            {open && (
                <div style={styles.panel}>
                    <div style={styles.header}>
                        <span style={styles.headerTitle}>CineBot</span>
                        <button onClick={() => setOpen(false)} style={styles.iconButton} aria-label="Close chat">
                            <CloseIcon />
                        </button>
                    </div>

                    <div style={styles.messages}>
                        {messages.length === 0 && (
                            <p style={styles.emptyText}>
                                Hi! I&apos;m CineBot. Ask me for movie recommendations, discuss a plot, or just talk films.
                            </p>
                        )}
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                style={m.role === 'user' ? styles.userBubble : styles.botBubble}
                            >
                                {m.content}
                            </div>
                        ))}
                        {loading && <div style={styles.botBubble}>…</div>}
                        {error && <p style={styles.errorText}>{error}</p>}
                        <div ref={bottomRef} />
                    </div>

                    <form onSubmit={handleSubmit} style={styles.form}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask CineBot..."
                            style={styles.input}
                        />
                        <button type="submit" style={styles.sendButton} disabled={loading}>
                            Send
                        </button>
                    </form>
                </div>
            )}

            <button
                onClick={() => setOpen((o) => !o)}
                style={styles.toggleButton}
                aria-label={open ? 'Close CineBot chat' : 'Open CineBot chat'}
            >
                {open ? <CloseIcon /> : <ChatIcon />}
            </button>
        </div>
    );
};

const styles = {
    wrapper: {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '12px',
        fontFamily: 'inherit',
    },
    toggleButton: {
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        border: 'none',
        backgroundColor: '#e50914',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 6px 18px rgba(229, 9, 20, 0.4)',
    },
    panel: {
        width: '340px',
        maxWidth: '90vw',
        height: '460px',
        maxHeight: '70vh',
        backgroundColor: '#141414',
        borderRadius: '14px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #262626',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 16px',
        borderBottom: '1px solid #262626',
    },
    headerTitle: {
        color: '#fff',
        fontWeight: 700,
        fontSize: '15px',
    },
    iconButton: {
        background: 'none',
        border: 'none',
        color: '#ccc',
        cursor: 'pointer',
        display: 'flex',
    },
    messages: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    emptyText: {
        color: '#888',
        fontSize: '14px',
        lineHeight: 1.5,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#e50914',
        color: '#fff',
        padding: '10px 14px',
        borderRadius: '14px 14px 2px 14px',
        fontSize: '14px',
        maxWidth: '85%',
        lineHeight: 1.4,
    },
    botBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#262626',
        color: '#e5e5e5',
        padding: '10px 14px',
        borderRadius: '14px 14px 14px 2px',
        fontSize: '14px',
        maxWidth: '85%',
        lineHeight: 1.4,
        whiteSpace: 'pre-wrap',
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: '13px',
    },
    form: {
        display: 'flex',
        gap: '8px',
        padding: '12px',
        borderTop: '1px solid #262626',
    },
    input: {
        flex: 1,
        backgroundColor: '#1f1f1f',
        border: '1px solid #333',
        borderRadius: '20px',
        padding: '10px 14px',
        color: '#fff',
        fontSize: '14px',
        outline: 'none',
    },
    sendButton: {
        backgroundColor: '#e50914',
        color: '#fff',
        border: 'none',
        borderRadius: '20px',
        padding: '10px 16px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
    },
};

export default ChatWidget;
