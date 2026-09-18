import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';

const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const BellIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

const formatRelativeTime = (dateString) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    return `${Math.floor(diffHour / 24)}d ago`;
};

const Header = ({ user, setUser }) => {
    const navigate = useNavigate();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [notifOpen, setNotifOpen] = useState(false);

    const unreadCount = notifications.filter((n) => !n.read).length;

    useEffect(() => {
        // No cleanup needed on logout: the notification bell only renders
        // while `user` is set, so stale state here is never shown.
        if (!user) return;
        api.get('/api/notifications', { headers: { Authorization: `Bearer ${user.token}` } })
            .then(({ data }) => setNotifications(data))
            .catch(() => setNotifications([]));
    }, [user]);

    const toggleNotifications = async () => {
        const opening = !notifOpen;
        setNotifOpen(opening);

        if (opening && unreadCount > 0) {
            try {
                await api.post('/api/notifications/read', {}, { headers: { Authorization: `Bearer ${user.token}` } });
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            } catch (err) {
                console.error('Failed to mark notifications read:', err);
            }
        }
    };

    const handleLogout = () => {
        window.localStorage.removeItem('loggedCineVibesUser');
        setUser(null);
        navigate('/');
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const trimmed = searchValue.trim();
        navigate(trimmed ? `/?search=${encodeURIComponent(trimmed)}` : '/');
        setSearchOpen(false);
        setSearchValue('');
    };

    return (
        <header style={styles.header}>
            <div style={styles.left}>
                <Link to="/" style={styles.logoContainer}>
                    <h1 style={styles.logoText}>CineVibes</h1>
                </Link>
            </div>

            <div style={styles.right}>
                {searchOpen ? (
                    <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
                        <input
                            type="text"
                            autoFocus
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onBlur={() => { if (!searchValue) setSearchOpen(false); }}
                            placeholder="Search movies..."
                            style={styles.searchInput}
                        />
                    </form>
                ) : (
                    <button
                        onClick={() => setSearchOpen(true)}
                        style={styles.iconButton}
                        aria-label="Search"
                    >
                        <SearchIcon />
                    </button>
                )}

                {user && (
                    <div style={styles.notifWrapper}>
                        <button
                            onClick={toggleNotifications}
                            style={styles.iconButton}
                            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                        >
                            <BellIcon />
                            {unreadCount > 0 && <span style={styles.notifBadge}>{unreadCount}</span>}
                        </button>
                        {notifOpen && (
                            <div style={styles.notifDropdown}>
                                {notifications.length > 0 ? (
                                    notifications.map((n) => (
                                        <Link
                                            key={n._id}
                                            to={`/movie/${n.movieId}`}
                                            style={styles.notifItem}
                                            onClick={() => setNotifOpen(false)}
                                        >
                                            <strong>{n.fromUser?.username || 'Someone'}</strong> replied to your comment
                                            <div style={styles.notifTime}>{formatRelativeTime(n.createdAt)}</div>
                                        </Link>
                                    ))
                                ) : (
                                    <p style={styles.notifEmpty}>No notifications yet.</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {user ? (
                    <div style={styles.navGroup}>
                        <span style={styles.welcomeText}>
                            Welcome, <strong>{user.username}</strong>
                        </span>
                        <button onClick={handleLogout} style={styles.logoutBtn}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link to="/login" style={styles.loginLink}>
                        Login
                    </Link>
                )}
            </div>
        </header>
    );
};

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 5%',
        backgroundColor: '#0f0f0f',
        height: '70px',
        borderBottom: '1px solid #262626',
    },
    left: {
        display: 'flex',
        alignItems: 'center',
        gap: '36px',
    },
    logoContainer: {
        textDecoration: 'none',
    },
    logoText: {
        background: 'linear-gradient(90deg, #ff4d4d, #e50914)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        margin: 0,
        fontSize: '26px',
        fontWeight: 800,
        letterSpacing: '-1px',
    },
    right: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    },
    iconButton: {
        position: 'relative',
        background: 'none',
        border: 'none',
        color: '#e5e5e5',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: '6px',
    },
    notifWrapper: {
        position: 'relative',
    },
    notifBadge: {
        position: 'absolute',
        top: '-2px',
        right: '-2px',
        backgroundColor: '#e50914',
        color: '#fff',
        fontSize: '10px',
        fontWeight: 'bold',
        borderRadius: '10px',
        padding: '1px 5px',
        minWidth: '16px',
        textAlign: 'center',
        lineHeight: '1.4',
    },
    notifDropdown: {
        position: 'absolute',
        top: 'calc(100% + 10px)',
        right: 0,
        width: '300px',
        maxHeight: '360px',
        overflowY: 'auto',
        backgroundColor: '#141414',
        border: '1px solid #262626',
        borderRadius: '10px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
        zIndex: 1000,
    },
    notifItem: {
        display: 'block',
        padding: '14px 16px',
        borderBottom: '1px solid #262626',
        color: '#e5e5e5',
        textDecoration: 'none',
        fontSize: '13px',
        lineHeight: '1.4',
    },
    notifTime: {
        marginTop: '4px',
        color: '#888',
        fontSize: '11px',
    },
    notifEmpty: {
        padding: '20px',
        margin: 0,
        color: '#888',
        fontSize: '13px',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    searchForm: {
        display: 'flex',
    },
    searchInput: {
        backgroundColor: '#1f1f1f',
        border: '1px solid #333',
        borderRadius: '20px',
        padding: '8px 16px',
        color: '#fff',
        fontSize: '14px',
        outline: 'none',
        width: '220px',
    },
    navGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    },
    welcomeText: {
        color: '#ccc',
        fontSize: '14px',
    },
    logoutBtn: {
        padding: '8px 18px',
        backgroundColor: '#1f1f1f',
        color: '#fff',
        border: '1px solid #333',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
    },
    loginLink: {
        color: '#fff',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '15px',
    },
};

export default Header;
