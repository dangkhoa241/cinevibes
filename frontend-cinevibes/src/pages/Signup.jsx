import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (event) => {
        event.preventDefault();
        try {
            await api.post('/api/users', { username, name, password });
            alert('Account created successfully! Please login.');
            navigate('/login');
        } catch (error) {
            alert(error.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h2 style={styles.heading}>Join CineVibes</h2>
                <form onSubmit={handleSignup}>
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={({ target }) => setName(target.value)}
                        style={styles.input}
                    />
                    <input
                        type="text"
                        placeholder="Username (min 3 chars)"
                        value={username}
                        onChange={({ target }) => setUsername(target.value)}
                        style={styles.input}
                    />
                    <input
                        type="password"
                        placeholder="Password (min 3 chars)"
                        value={password}
                        onChange={({ target }) => setPassword(target.value)}
                        style={styles.input}
                    />
                    <button type="submit" style={styles.button}>
                        Create Account
                    </button>
                </form>
                <p style={styles.footerText}>Already have an account? <Link to="/login" style={styles.link}>Login here</Link></p>
            </div>
        </div>
    );
};

const styles = {
    page: {
        maxWidth: '400px',
        margin: '100px auto',
        padding: '0 20px',
        minHeight: 'calc(100vh - 300px)',
    },
    card: {
        backgroundColor: '#1a1a1a',
        border: '1px solid #262626',
        borderRadius: '12px',
        padding: '40px 30px',
        textAlign: 'center',
        boxSizing: 'border-box',
    },
    heading: { color: '#fff', margin: '0 0 24px 0' },
    input: {
        display: 'block',
        width: '100%',
        margin: '10px 0',
        padding: '10px',
        backgroundColor: '#1f1f1f',
        border: '1px solid #333',
        borderRadius: '6px',
        color: '#fff',
        fontSize: '14px',
        boxSizing: 'border-box',
    },
    button: {
        width: '100%',
        padding: '10px',
        marginTop: '10px',
        backgroundColor: '#e50914',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    footerText: { color: '#999', marginTop: '20px' },
    link: { color: '#e50914', fontWeight: 'bold', textDecoration: 'none' },
};

export default Signup;