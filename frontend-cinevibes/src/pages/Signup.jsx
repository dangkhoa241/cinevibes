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
        <div style={{ maxWidth: '400px', margin: '100px auto', textAlign: 'center' }}>
            <h2>Join CineVibes</h2>
            <form onSubmit={handleSignup}>
                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={({ target }) => setName(target.value)}
                    style={inputStyle}
                />
                <input
                    type="text"
                    placeholder="Username (min 3 chars)"
                    value={username}
                    onChange={({ target }) => setUsername(target.value)}
                    style={inputStyle}
                />
                <input
                    type="password"
                    placeholder="Password (min 3 chars)"
                    value={password}
                    onChange={({ target }) => setPassword(target.value)}
                    style={inputStyle}
                />
                <button type="submit" style={buttonStyle}>
                    Create Account
                </button>
            </form>
            <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
    );
};

const inputStyle = { display: 'block', width: '100%', margin: '10px 0', padding: '10px' };
const buttonStyle = { width: '100%', padding: '10px', backgroundColor: '#e50914', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export default Signup;