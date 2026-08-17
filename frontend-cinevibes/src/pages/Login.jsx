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
        } catch (error) {
            alert('Invalid username or password');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '100px auto', textAlign: 'center' }}>
            <h2>Login to CineVibes</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={({ target }) => setUsername(target.value)}
                    style={{ display: 'block', width: '100%', margin: '10px 0', padding: '10px' }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={({ target }) => setPassword(target.value)}
                    style={{ display: 'block', width: '100%', margin: '10px 0', padding: '10px' }}
                />
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#e50914', color: 'white', border: 'none', borderRadius: '4px' }}>
                    Sign In
                </button>
            </form>
            <p>New here? <Link to="/signup">Create an account</Link></p>
        </div>
    );
};

export default Login;