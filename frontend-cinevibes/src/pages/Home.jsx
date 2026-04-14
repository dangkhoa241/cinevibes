import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

const baseUrl = '/api/movies/trending';

const Home = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(baseUrl)
            .then(response => {
                setMovies(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching movies:", error);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading trending movies...</div>;

    return (
        <>
            <Header></Header>
            <div style={styles.container}>
                <h1>CineVibes</h1>
                <div style={styles.grid}>
                    {movies.map(movie => (
                        <MovieCard key={movie.imdbID} movie={movie} />
                    ))}
                </div>
            </div>
            <Footer></Footer>
        </>
    );
};

const styles = {
    container: {
        padding: '40px',
        backgroundColor: '#F7F9FC',
        minHeight: '100vh',
    },
    header: {
        textAlign: 'center',
        color: '#2A3B4C',
        fontSize: '32px',
        marginBottom: '40px'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '30px'
    }
};

export default Home;