import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={styles.footer}>
            <div style={styles.top}>
                <div style={styles.brand}>
                    <h2 style={styles.logoText}>CineVibes</h2>
                    <p style={styles.tagline}>Discover movies. Discuss every twist, scene, and line.</p>
                </div>
                <nav style={styles.nav}>
                    <Link to="/" style={styles.link}>Home</Link>
                    <Link to="/login" style={styles.link}>Login</Link>
                    <Link to="/signup" style={styles.link}>Sign Up</Link>
                </nav>
            </div>
            <div style={styles.bottom}>
                <p style={styles.copyright}>© {new Date().getFullYear()} CineVibes. All rights reserved.</p>
            </div>
        </footer>
    );
};

const styles = {
    footer: {
        backgroundColor: '#1a1a1a',
        color: '#ccc',
        marginTop: '60px',
        borderTop: '3px solid #e50914',
    },
    top: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 40px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '20px',
    },
    brand: {
        maxWidth: '400px',
    },
    logoText: {
        color: '#e50914',
        margin: '0 0 8px 0',
        fontSize: '24px',
        fontWeight: 'bold',
        letterSpacing: '-1px',
    },
    tagline: {
        margin: 0,
        fontSize: '14px',
        color: '#999',
        lineHeight: 1.5,
    },
    nav: {
        display: 'flex',
        gap: '24px',
    },
    link: {
        color: '#ccc',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: 500,
    },
    bottom: {
        borderTop: '1px solid #333',
        padding: '16px 40px',
        textAlign: 'center',
    },
    copyright: {
        margin: 0,
        fontSize: '13px',
        color: '#777',
    },
};

export default Footer;
