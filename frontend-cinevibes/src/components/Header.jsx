import { Link, useNavigate } from 'react-router-dom';

const Header = ({ user, setUser }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        window.localStorage.removeItem('loggedCineVibesUser');
        setUser(null);
        navigate('/');
    };

    return (
        <header style={styles.header}>
            <Link to="/" style={styles.logoContainer}>
                <h1 style={styles.logoText}>CineVibes</h1>
            </Link>

            <nav>
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
            </nav>
        </header>
    );
};

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 40px',
        backgroundColor: '#ffffff', // Clean white background
        height: '70px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)', // Subtle shadow for depth
        borderBottom: '1px solid #eee'
    },
    logoContainer: {
        textDecoration: 'none',
    },
    logoText: {
        color: '#e50914', // Keep the signature red
        margin: 0,
        fontSize: '28px',
        fontWeight: 'bold',
        letterSpacing: '-1px'
    },
    navGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
    },
    welcomeText: {
        color: '#333', // Dark gray for readability
        fontSize: '14px'
    },
    logoutBtn: {
        padding: '8px 18px',
        backgroundColor: '#f8f9fa',
        color: '#333',
        border: '1px solid #ddd',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
        transition: '0.2s'
    },
    loginLink: {
        color: '#333',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '16px'
    }
};

export default Header;