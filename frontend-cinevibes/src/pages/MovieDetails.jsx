import { useParams } from 'react-router-dom';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api/client';
import { Link } from 'react-router-dom';

const baseUrl = '/api/movies';

const HeartIcon = ({ filled }) => (
    <svg
        width="15" height="15" viewBox="0 0 24 24"
        fill={filled ? '#e50914' : 'none'}
        stroke={filled ? '#e50914' : 'currentColor'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ verticalAlign: 'middle' }}
    >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

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

const CommentItem = ({
    c, isReply, isOwner, isHidden, isEditing, editContent, editIsSpoiler,
    isReplying, replyContent, replyIsSpoiler, replyToUsername,
    onReveal, onStartEdit, onCancelEdit, onSetEditContent, onSetEditIsSpoiler, onSaveEdit,
    onDelete, onToggleLike, onStartReply, onCancelReply, onSetReplyContent, onSetReplySpoiler, onSubmitReply,
}) => (
    <div style={isReply ? styles.replyCard : styles.commentCard}>
        <div style={styles.commentHeader}>
            <span style={styles.commentAuthor}>{c.user?.username || 'Anonymous'}</span>
            <div style={styles.commentHeaderRight}>
                <span style={styles.commentDate}>{formatRelativeTime(c.createdAt)}</span>
                {isOwner && !isEditing && (
                    <>
                        <button type="button" onClick={onStartEdit} style={styles.ownerActionBtn}>Edit</button>
                        <button type="button" onClick={onDelete} style={styles.ownerActionBtn}>Delete</button>
                    </>
                )}
            </div>
        </div>

        {isEditing ? (
            <div style={styles.editForm}>
                <textarea
                    value={editContent}
                    onChange={(e) => onSetEditContent(e.target.value)}
                    style={styles.textarea}
                />
                <label style={styles.spoilerLabel}>
                    <input type="checkbox" checked={editIsSpoiler} onChange={(e) => onSetEditIsSpoiler(e.target.checked)} />
                    Mark as spoiler
                </label>
                <div style={styles.editActions}>
                    <button type="button" onClick={onSaveEdit} style={styles.submitBtn}>Save</button>
                    <button type="button" onClick={onCancelEdit} style={styles.cancelBtn}>Cancel</button>
                </div>
            </div>
        ) : isHidden ? (
            <button type="button" onClick={onReveal} style={styles.spoilerButton}>
                ⚠️ Spoiler — click to reveal
            </button>
        ) : (
            <>
                {c.isSpoiler && <span style={styles.spoilerTag}>⚠️ Spoiler</span>}
                <p style={styles.commentText}>{c.content}</p>
            </>
        )}

        {!isEditing && (
            <div style={styles.commentActions}>
                <button
                    type="button"
                    onClick={onToggleLike}
                    style={c.liked ? styles.likeButtonActive : styles.likeButton}
                    aria-label={c.liked ? 'Unlike comment' : 'Like comment'}
                >
                    <HeartIcon filled={c.liked} /> {c.likeCount}
                </button>
                {!isReply && (
                    <button type="button" onClick={isReplying ? onCancelReply : onStartReply} style={styles.replyToggleBtn}>
                        {isReplying ? 'Cancel' : 'Reply'}
                    </button>
                )}
            </div>
        )}

        {isReplying && (
            <form onSubmit={onSubmitReply} style={styles.replyForm}>
                <textarea
                    placeholder={`Reply to ${replyToUsername}...`}
                    value={replyContent}
                    onChange={(e) => onSetReplyContent(e.target.value)}
                    style={styles.textarea}
                />
                <label style={styles.spoilerLabel}>
                    <input type="checkbox" checked={replyIsSpoiler} onChange={(e) => onSetReplySpoiler(e.target.checked)} />
                    Mark as spoiler
                </label>
                <button type="submit" style={styles.submitBtn}>Post Reply</button>
            </form>
        )}
    </div>
);

const MovieDetail = ({ user }) => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('normal');
    const [commentsByCategory, setCommentsByCategory] = useState({ normal: [], technical: [] });
    const [comment, setComment] = useState('');
    const [isSpoiler, setIsSpoiler] = useState(false);
    const [revealedIds, setRevealedIds] = useState(() => new Set());
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [editIsSpoiler, setEditIsSpoiler] = useState(false);
    const [replyingToId, setReplyingToId] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [replyIsSpoiler, setReplyIsSpoiler] = useState(false);

    const comments = commentsByCategory[activeTab] || [];
    const commentsRequestId = useRef(0);

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

    // Pure data-fetch, no setState - safe to call from an effect body directly.
    const fetchAnnotatedComments = useCallback(async () => {
        const annotate = (c) => ({
            ...c,
            likeCount: c.likedBy?.length || 0,
            liked: user ? (c.likedBy || []).some(uid => uid === user.id) : false,
        });
        const buildThreads = (list) => {
            const annotated = list.map(annotate);
            const topLevel = annotated.filter(c => !c.parentComment);
            const repliesByParent = {};
            annotated.forEach(c => {
                if (c.parentComment) {
                    (repliesByParent[c.parentComment] ||= []).push(c);
                }
            });
            Object.values(repliesByParent).forEach(replies =>
                replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            );
            return topLevel.map(c => ({ ...c, replies: repliesByParent[c._id] || [] }));
        };
        const [normalRes, technicalRes] = await Promise.all([
            api.get(`${baseUrl}/${id}/comments?category=normal`),
            api.get(`${baseUrl}/${id}/comments?category=technical`),
        ]);
        return { normal: buildThreads(normalRes.data), technical: buildThreads(technicalRes.data) };
    }, [id, user]);

    // Guards against a stale, slow-to-resolve GET clobbering state that a
    // later mutation (post/edit/delete/like) has already refreshed - only the
    // most recently issued request is allowed to apply its result. Called
    // directly from event handlers, never from inside an effect.
    const refreshComments = useCallback(async () => {
        const requestId = ++commentsRequestId.current;
        try {
            const data = await fetchAnnotatedComments();
            if (requestId === commentsRequestId.current) setCommentsByCategory(data);
        } catch (err) {
            console.error("Fetch comments failed:", err);
        }
    }, [fetchAnnotatedComments]);

    useEffect(() => {
        const requestId = ++commentsRequestId.current;
        fetchAnnotatedComments()
            .then((data) => {
                if (requestId === commentsRequestId.current) setCommentsByCategory(data);
            })
            .catch((err) => console.error("Fetch comments failed:", err));
    }, [fetchAnnotatedComments]);

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

            await api.post(`/api/movies/${id}/comments`, newComment, config);
            await refreshComments();
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

    const handleToggleLike = async (commentId) => {
        if (!user) {
            alert('Please login to like a comment.');
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.post(`/api/movies/${id}/comments/${commentId}/like`, {}, config);
            await refreshComments();
        } catch (err) {
            console.error("Error toggling like:", err);
        }
    };

    const startEdit = (c) => {
        setEditingId(c._id);
        setEditContent(c.content);
        setEditIsSpoiler(c.isSpoiler);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditContent('');
        setEditIsSpoiler(false);
    };

    const saveEdit = async (commentId) => {
        if (!editContent.trim()) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.put(
                `/api/movies/${id}/comments/${commentId}`,
                { content: editContent, isSpoiler: editIsSpoiler },
                config
            );
            await refreshComments();
            cancelEdit();
        } catch (err) {
            console.error("Error editing comment:", err);
            alert(err.response?.data?.error || "Failed to edit comment");
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.delete(`/api/movies/${id}/comments/${commentId}`, config);
            await refreshComments();
        } catch (err) {
            console.error("Error deleting comment:", err);
            alert(err.response?.data?.error || "Failed to delete comment");
        }
    };

    const startReply = (parentId) => {
        if (!user) {
            alert('Please login to reply to a comment.');
            return;
        }
        setReplyingToId(parentId);
        setReplyContent('');
        setReplyIsSpoiler(false);
    };

    const cancelReply = () => {
        setReplyingToId(null);
        setReplyContent('');
        setReplyIsSpoiler(false);
    };

    const submitReply = async (e, parentId) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.post(
                `/api/movies/${id}/comments`,
                { content: replyContent, category: activeTab, isSpoiler: replyIsSpoiler, parentComment: parentId },
                config
            );
            await refreshComments();
            cancelReply();
        } catch (err) {
            console.error("Error posting reply:", err);
            alert(err.response?.data?.error || "Failed to post reply");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleCommentSubmit(e);
        }
    };

    if (loading) return <div style={styles.loading}>Loading movie details...</div>;

    const genres = movie.genre ? movie.genre.split(',').map(g => g.trim()).filter(Boolean) : [];

    const renderItem = (c, isReply) => {
        const isHidden = c.isSpoiler && !revealedIds.has(c._id);
        const isOwner = user && c.user?.id === user.id;
        const isEditing = editingId === c._id;
        const isReplying = replyingToId === c._id;

        return (
            <CommentItem
                key={c._id}
                c={c}
                isReply={isReply}
                isOwner={isOwner}
                isHidden={isHidden}
                isEditing={isEditing}
                editContent={editContent}
                editIsSpoiler={editIsSpoiler}
                isReplying={isReplying}
                replyContent={replyContent}
                replyIsSpoiler={replyIsSpoiler}
                replyToUsername={c.user?.username || 'this comment'}
                onReveal={() => revealSpoiler(c._id)}
                onStartEdit={() => startEdit(c)}
                onCancelEdit={cancelEdit}
                onSetEditContent={setEditContent}
                onSetEditIsSpoiler={setEditIsSpoiler}
                onSaveEdit={() => saveEdit(c._id)}
                onDelete={() => handleDelete(c._id)}
                onToggleLike={() => handleToggleLike(c._id)}
                onStartReply={() => startReply(c._id)}
                onCancelReply={cancelReply}
                onSetReplyContent={setReplyContent}
                onSetReplySpoiler={setReplyIsSpoiler}
                onSubmitReply={(e) => submitReply(e, c._id)}
            />
        );
    };

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
                        comments.map((c) => (
                            <div key={c._id}>
                                {renderItem(c, false)}
                                {c.replies?.length > 0 && (
                                    <div style={styles.repliesList}>
                                        {c.replies.map((reply) => renderItem(reply, true))}
                                    </div>
                                )}
                            </div>
                        ))
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
    replyCard: {
        padding: '16px',
        backgroundColor: '#161616',
        borderRadius: '8px',
        marginBottom: '10px',
        border: '1px solid #262626'
    },
    repliesList: {
        marginLeft: '30px',
        marginTop: '-5px',
        marginBottom: '15px',
        paddingLeft: '15px',
        borderLeft: '2px solid #262626',
    },
    commentHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
    },
    commentAuthor: { color: '#fff', fontWeight: 'bold', fontSize: '14px' },
    commentHeaderRight: { display: 'flex', alignItems: 'center', gap: '12px' },
    ownerActionBtn: {
        background: 'none',
        border: 'none',
        color: '#888',
        fontSize: '12px',
        cursor: 'pointer',
        padding: 0,
        textDecoration: 'underline',
    },
    commentText: { margin: '0', fontSize: '16px', lineHeight: '1.5', color: '#e5e5e5' },
    commentDate: { color: '#888', fontSize: '12px' },
    emptyText: { color: '#888', fontStyle: 'italic' },
    editForm: { display: 'flex', flexDirection: 'column' },
    editActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
    cancelBtn: {
        padding: '12px 25px',
        backgroundColor: 'transparent',
        color: '#ccc',
        border: '1px solid #333',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    commentActions: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginTop: '4px',
    },
    likeButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '20px',
        border: '1px solid #333',
        backgroundColor: 'transparent',
        color: '#999',
        fontSize: '13px',
        cursor: 'pointer',
    },
    likeButtonActive: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '20px',
        border: '1px solid #e50914',
        backgroundColor: 'rgba(229, 9, 20, 0.1)',
        color: '#e50914',
        fontSize: '13px',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    replyToggleBtn: {
        background: 'none',
        border: 'none',
        color: '#888',
        fontSize: '13px',
        cursor: 'pointer',
        padding: '4px 6px',
        fontWeight: 'bold',
    },
    replyForm: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid #262626',
    },
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
