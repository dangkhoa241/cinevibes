import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const baseUrl = '/api/movies';

const MovieDetail = ({ user }) => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('normal');
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState('');

    useEffect(() => {
        axios.get(`${baseUrl}/${id}`)
            .then(res => {
                setMovie(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const fetchComments = async () => {
        try {
            const res = await axios.get(`${baseUrl}/${id}/comments?category=${activeTab}`);
            setComments(res.data);
        } catch (err) {
            console.error("Fetch comments failed:", err);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [id, activeTab]);

    const handleCommentSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!comment.trim()) return;

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };

            const newComment = {
                content: comment,
                category: activeTab
            };

            const response = await axios.post(`/api/movies/${id}/comments`, newComment, config);

            setComments(comments.concat(response.data));
            setComment('');
        } catch (err) {
            console.error("Error posting comment:", err);
            alert(err.response?.data?.error || "Failed to post comment");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleCommentSubmit(e);
        }
    };

    if (loading) return <div style={styles.loading}>Loading movie details...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.hero}>
                <div style={styles.imageWrapper}>
                    <img src={movie.poster} alt={movie.title} style={styles.poster} />
                </div>
                <div style={styles.infoWrapper}>
                    <h1 style={styles.title}>{movie.title}</h1>
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
                        General Chat
                    </button>
                    <button
                        style={activeTab === 'technical' ? styles.activeTab : styles.tab}
                        onClick={() => setActiveTab('technical')}
                    >
                        Technical Analysis
                    </button>
                </div>

                <div style={styles.commentList}>
                    {comments.length > 0 ? (
                        comments.map((c) => (
                            <div key={c._id} style={styles.commentCard}>
                                <p style={styles.commentText}>{c.content}</p>
                                <small style={styles.commentDate}>
                                    {new Date(c.createdAt).toLocaleString()}
                                </small>
                            </div>
                        ))
                    ) : (
                        <p style={styles.emptyText}>No {activeTab} comments yet. Be the first!</p>
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
        backgroundColor: '#fff',
        color: '#333',
        minHeight: '100vh'
    },
    loading: { textAlign: 'center', padding: '50px', fontSize: '20px' },
    hero: {
        display: 'flex',
        gap: '40px',
        marginBottom: '40px',
        alignItems: 'flex-start',
        flexWrap: 'wrap' // Allows wrapping on small mobile screens
    },
    imageWrapper: {
        flexShrink: 0,
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
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
        margin: '0 0 20px 0',
        lineHeight: '1.1',
        fontWeight: '800',
        color: '#1a1a1a',
        wordBreak: 'break-word',
        overflowWrap: 'break-word'
    },
    metaData: { fontSize: '1.1rem', marginBottom: '20px', color: '#444' },
    rating: { fontSize: '1.3rem', fontWeight: 'bold', color: '#f1c40f', margin: '15px 0' },
    plot: { lineHeight: '1.8', fontSize: '1.1rem', color: '#555', textAlign: 'justify' },
    divider: { border: '0', borderTop: '1px solid #eee', margin: '50px 0' },
    commentSection: { maxWidth: '800px' },
    sectionTitle: { marginBottom: '25px', fontSize: '24px' },
    tabBar: { display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #eee' },
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
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        marginBottom: '15px',
        border: '1px solid #f0f0f0'
    },
    commentText: { margin: '0 0 10px 0', fontSize: '16px', lineHeight: '1.5' },
    commentDate: { color: '#aaa', fontSize: '12px' },
    emptyText: { color: '#999', fontStyle: 'italic' },
    form: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
    textarea: {
        width: '100%',
        height: '100px',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '15px',
        border: '1px solid #ddd',
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
        backgroundColor: '#fcfcfc',
        borderRadius: '12px',
        border: '1px dashed #ddd',
        marginTop: '20px'
    },
    loginLink: { color: '#e50914', fontWeight: 'bold', textDecoration: 'none' }
};

export default MovieDetail;