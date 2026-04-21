const handleLogin = async (event) => {
    event.preventDefault();
    try {
        const response = await axios.post('/api/login', { username, password });
        const user = response.data;

        window.localStorage.setItem('loggedCineVibesUser', JSON.stringify(user));

        setUser(user);
        setUsername('');
        setPassword('');
    } catch (exception) {
        alert('Wrong credentials');
    }
};