import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Link } from 'react-router-dom';

const baseUrl = '/api/movies';

const formatRelativeTime = (dateString) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return new Date(dateString).toLocaleDateString();
};

const MovieDetail = ({ user }) => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('normal');
    const [commentsByCategory, setCommentsByCategory] = useState({ normal: [], technical: [] });
    const [comment, setComment] = useState('');
    const [isSpoiler, setIsSpoiler] = useState(false);
    const [revealedIds, setRevealedIds] = useState(() => new Set());

    const comments = commentsByCategory[activeTab] || [];

    useEffect(() => {
        api.get(`${baseUrl}/${id}`)
            .then(res => {
                setMovie(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const [normalRes, technicalRes] = await Promise.all([
                    api.get(`${baseUrl}/${id}/comments?category=normal`),
                    api.get(`${baseUrl}/${id}/comments?category=technical`),
                ]);
                setCommentsByCategory({ normal: normalRes.data, technical: technicalRes.data });
            } catch (err) {
                console.error("Fetch comments failed:", err);
            }
        };

        fetchComments();
    }, [id]);

    const handleCommentSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!comment.trim()) return;

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };

            const newComment = {
                content: comment,
                category: activeTab,
                isSpoiler
            };

            const response = await api.post(`/api/movies/${id}/comments`, newComment, config);

            setCommentsByCategory(prev => ({
                ...prev,
                [activeTab]: [response.data, ...prev[activeTab]]
            }));
            setComment('');
            setIsSpoiler(false);
        } catch (err) {
            console.error("Error posting comment:", err);
            alert(err.response?.data?.error || "Failed to post comment");
        }
    };

    const revealSpoiler = (commentId) => {
        setRevealedIds((prev) => new Set(prev).add(commentId));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleCommentSubmit(e);
        }
    };

    if (loading) return <div style={styles.loading}>Loading movie details...</div>;

    const genres = movie.genre ? movie.genre.split(',').map(g => g.trim()).filter(Boolean) : [];

    return (
        <div style={styles.container}>
            <div style={styles.hero}>
                <div style={styles.imageWrapper}>
                    <img src={movie.poster} alt={movie.title} style={styles.poster} />
                </div>
                <div style={styles.infoWrapper}>
                    <h1 style={styles.title}>{movie.title}</h1>
                    {genres.length > 0 && (
                        <div style={styles.genreRow}>
                            {genres.map(genre => (
                                <span key={genre} style={styles.genreBadge}>{genre}</span>
                            ))}
                        </div>
                    )}
                    <div style={styles.metaData}>
                        <p><strong>Director:</strong> {movie.director}</p>
                        <p><strong>Actors:</strong> {movie.actors}</p>
                        <p style={styles.rating}>⭐ {movie.rating}</p>
                    </div>
                    <p style={styles.plot}>{movie.plot}</p>
                </div>
            </div>

            <hr style={styles.divider} />

            <div style={styles.commentSection}>
                <h2 style={styles.sectionTitle}>Discussions</h2>
                <div style={styles.tabBar}>
                    <button
                        style={activeTab === 'normal' ? styles.activeTab : styles.tab}
                        onClick={() => setActiveTab('normal')}
                    >
                        General Chat · {commentsByCategory.normal.length}
                    </button>
                    <button
                        style={activeTab === 'technical' ? styles.activeTab : styles.tab}
                        onClick={() => setActiveTab('technical')}
                    >
                        Technical Analysis · {commentsByCategory.technical.length}
                    </button>
                </div>

                <div style={styles.commentList}>
                    {comments.length > 0 ? (
                        comments.map((c) => {
                            const isHidden = c.isSpoiler && !revealedIds.has(c._id);
                            return (
                                <div key={c._id} style={styles.commentCard}>
                                    <div style={styles.commentHeader}>
                                        <span style={styles.commentAuthor}>{c.user?.username || 'Anonymous'}</span>
                                        <span style={styles.commentDate}>{formatRelativeTime(c.createdAt)}</span>
                                    </div>
                                    {isHidden ? (
                                        <button
                                            type="button"
                                            onClick={() => revealSpoiler(c._id)}
                                            style={styles.spoilerButton}
                                        >
                                            ⚠️ Spoiler — click to reveal
                                        </button>
                                    ) : (
                                        <>
                                            {c.isSpoiler && <span style={styles.spoilerTag}>⚠️ Spoiler</span>}
                                            <p style={styles.commentText}>{c.content}</p>
                                        </>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <p style={styles.emptyText}>No {activeTab === 'normal' ? 'general' : 'technical'} comments yet. Be the first!</p>
                    )}
                </div>

                {user ? (
                    <form onSubmit={handleCommentSubmit} style={styles.form}>
                        <textarea
                            placeholder={`Write a ${activeTab} comment as ${user.username}...`}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={styles.textarea}
                        />
                        <label style={styles.spoilerLabel}>
                            <input
                                type="checkbox"
                                checked={isSpoiler}
                                onChange={(e) => setIsSpoiler(e.target.checked)}
                            />
                            Mark as spoiler
                        </label>
                        <button type="submit" style={styles.submitBtn}>Post Comment</button>
                    </form>
                ) : (
                    <div style={styles.loginPrompt}>
                        <p>Please <Link to="/login" style={styles.loginLink}>Login</Link> to join the discussion.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
        backgroundColor: '#0f0f0f',
        color: '#e5e5e5',
        minHeight: '100vh'
    },
    loading: {
        textAlign: 'center',
        padding: '50px',
        fontSize: '20px',
        backgroundColor: '#0f0f0f',
        color: '#e5e5e5',
        minHeight: '100vh'
    },
    hero: {
        display: 'flex',
        gap: '40px',
        marginBottom: '40px',
        alignItems: 'flex-start',
        flexWrap: 'wrap' // Allows wrapping on small mobile screens
    },
    imageWrapper: {
        flexShrink: 0,
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        borderRadius: '12px',
        overflow: 'hidden'
    },
    poster: {
        width: '300px',
        display: 'block'
    },
    infoWrapper: {
        flex: 1,
        minWidth: '300px' // Ensures text doesn't get too thin
    },
    title: {
        fontSize: '2.8rem',
        margin: '0 0 16px 0',
        lineHeight: '1.1',
        fontWeight: '800',
        color: '#fff',
        wordBreak: 'break-word',
        overflowWrap: 'break-word'
    },
    genreRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '18px',
    },
    genreBadge: {
        padding: '4px 12px',
        borderRadius: '20px',
        border: '1px solid #333',
        backgroundColor: '#1f1f1f',
        color: '#ccc',
        fontSize: '13px',
    },
    metaData: { fontSize: '1.1rem', marginBottom: '20px', color: '#bbb' },
    rating: { fontSize: '1.3rem', fontWeight: 'bold', color: '#f1c40f', margin: '15px 0' },
    plot: { lineHeight: '1.8', fontSize: '1.1rem', color: '#ccc', textAlign: 'justify' },
    divider: { border: '0', borderTop: '1px solid #262626', margin: '50px 0' },
    commentSection: { maxWidth: '800px' },
    sectionTitle: { marginBottom: '25px', fontSize: '24px', color: '#fff' },
    tabBar: { display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #262626' },
    tab: { padding: '12px 5px', cursor: 'pointer', border: 'none', background: 'none', fontSize: '16px', color: '#888' },
    activeTab: {
        padding: '12px 5px',
        cursor: 'pointer',
        border: 'none',
        borderBottom: '3px solid #e50914',
        background: 'none',
        fontWeight: 'bold',
        color: '#e50914'
    },
    commentList: { marginBottom: '30px' },
    commentCard: {
        padding: '20px',
        backgroundColor: '#1a1a1a',
        borderRadius: '8px',
        marginBottom: '15px',
        border: '1px solid #262626'
    },
    commentHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
    },
    commentAuthor: { color: '#fff', fontWeight: 'bold', fontSize: '14px' },
    commentText: { margin: '0', fontSize: '16px', lineHeight: '1.5', color: '#e5e5e5' },
    commentDate: { color: '#888', fontSize: '12px' },
    emptyText: { color: '#888', fontStyle: 'italic' },
    spoilerTag: {
        display: 'inline-block',
        marginBottom: '8px',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#e8c547',
    },
    spoilerButton: {
        display: 'block',
        width: '100%',
        padding: '14px',
        backgroundColor: '#2a2410',
        border: '1px dashed #caa000',
        borderRadius: '6px',
        color: '#e8c547',
        fontWeight: 'bold',
        cursor: 'pointer',
        textAlign: 'center',
    },
    form: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
    spoilerLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '15px',
        fontSize: '14px',
        color: '#ccc',
        cursor: 'pointer',
    },
    textarea: {
        width: '100%',
        height: '100px',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '15px',
        border: '1px solid #333',
        backgroundColor: '#1f1f1f',
        color: '#fff',
        fontSize: '16px',
        fontFamily: 'inherit',
        boxSizing: 'border-box'
    },
    submitBtn: {
        padding: '12px 25px',
        backgroundColor: '#e50914',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background 0.2s'
    },
    loginPrompt: {
        padding: '30px',
        textAlign: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: '12px',
        border: '1px dashed #333',
        marginTop: '20px'
    },
    loginLink: { color: '#e50914', fontWeight: 'bold', textDecoration: 'none' }
};

export default MovieDetail;
