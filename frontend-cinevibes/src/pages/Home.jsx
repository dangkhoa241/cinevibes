import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Pagination from "../components/Pagination.jsx";



const Home = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [ totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState('');
    const baseUrl = `/api/movies/trending?page=${page}`;



    useEffect(() => {
        axios.get(baseUrl)
            .then(response => {
                window .scrollTo({top:0, behaviour: 'smooth'});
                setMovies(response.data.movies);
                setTotalPages(Math.ceil(response.data.totalMovies / response.data.limit));
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching movies:", error);
                setLoading(false);
            });
    }, [page]);

    useEffect(() => {
        if (search === '') return;  // if empty, don't search

        axios.get(`/api/movies/search?title=${search}`)
            .then(response => {
                setMovies(response.data);
            })
            .catch(error => {
                console.error("Search error:", error);
            });
    }, [search]);

    if (loading) return <div>Loading trending movies...</div>;

    return (
        <div>
            <Header>
            </Header>
            <input type="text" placeholder="Search movies..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <div style={styles.container}>
                <h1>CineVibes</h1>
                <div style={styles.grid}>
                    {movies.map(movie => (
                        <MovieCard key={movie.imdbID} movie={movie} />
                    ))}
                </div>
                <Pagination page={page} setPage={setPage} totalPages={totalPages}></Pagination>
            </div>
            <Footer></Footer>
        </div>
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