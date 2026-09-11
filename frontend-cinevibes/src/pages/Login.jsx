import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

const Login = ({ setUser }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await api.post('/api/login', { username, password });
            const user = response.data;

            window.localStorage.setItem('loggedCineVibesUser', JSON.stringify(user));

            setUser(user);

            navigate('/');
        } catch {
            alert('Invalid username or password');
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h2 style={styles.heading}>Login to CineVibes</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={({ target }) => setUsername(target.value)}
                        style={styles.input}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={({ target }) => setPassword(target.value)}
                        style={styles.input}
                    />
                    <button type="submit" style={styles.button}>
                        Sign In
                    </button>
                </form>
                <p style={styles.footerText}>New here? <Link to="/signup" style={styles.link}>Create an account</Link></p>
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

export default Login;