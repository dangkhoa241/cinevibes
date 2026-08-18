import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const Header = ({ user, setUser }) => {
    const navigate = useNavigate();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');

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
                <nav style={styles.tabs}>
                    <Link to="/" style={styles.tab}>Trending</Link>
                </nav>
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
    tabs: {
        display: 'flex',
        gap: '24px',
    },
    tab: {
        color: '#e5e5e5',
        textDecoration: 'none',
        fontSize: '15px',
        fontWeight: 500,
    },
    right: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    },
    iconButton: {
        background: 'none',
        border: 'none',
        color: '#e5e5e5',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: '6px',
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
