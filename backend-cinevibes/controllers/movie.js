import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const baseUrl = '/api/movies';

const MovieDetail = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('normal');
    const [comments, setComments] = useState([]);

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
        e.preventDefault();
        if (!comment.trim()) return;

        try {
            const response = await axios.post(`${baseUrl}/comments`, {
                movieId: id,
                content: comment,
                category: activeTab
            });

            console.log("Saved:", response.data);
            setComment('');
            fetchComments();
        } catch (err) {
            console.error("Save failed:", err);
        }
    };

    if (loading) return <div>Loading a movie...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.hero}>
                <img src={movie.poster} alt={movie.title} style={styles.poster} />
                <div style={styles.details}>
                    <h1>{movie.title}</h1>
                    <p><strong>Director:</strong> {movie.director}</p>
                    <p><strong>Actors:</strong> {movie.actors}</p>
                    <p>⭐ {movie.rating}</p>
                    <p>{movie.plot}</p>
                </div>
            </div>

            <hr />

            <div style={styles.commentSection}>
                <h2>Discussions</h2>
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

                <form onSubmit={handleCommentSubmit} style={styles.form}>
                    <textarea
                        placeholder={`Write a ${activeTab} comment...`}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        style={styles.textarea}
                    />
                    <button type="submit" style={styles.submitBtn}>Post Comment</button>
                </form>

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
                        <p>No {activeTab} comments yet. Be the first!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { maxWidth: '1000px', margin: '0 auto', padding: '20px', backgroundColor: '#fff', color: '#333' },
    hero: { display: 'flex', gap: '30px', marginBottom: '40px' },
    poster: { width: '300px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
    tabBar: { display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #eee' },
    tab: { padding: '10px 20px', cursor: 'pointer', border: 'none', background: 'none', fontSize: '16px' },
    activeTab: { padding: '10px 20px', cursor: 'pointer', border: 'none', borderBottom: '3px solid #0056D2', background: 'none', fontWeight: 'bold', color: '#0056D2' },
    textarea: { width: '100%', height: '80px', borderRadius: '8px', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', fontSize: '16px' },
    submitBtn: { padding: '10px 20px', backgroundColor: '#0056D2', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    commentCard: { padding: '15px', borderBottom: '1px solid #eee', marginBottom: '10px' },
    commentText: { margin: '0 0 5px 0', fontSize: '16px' },
    commentDate: { color: '#888', fontSize: '12px' }
};

export default MovieDetail;