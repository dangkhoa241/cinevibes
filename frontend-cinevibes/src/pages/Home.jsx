import React, { useEffect, useState } from 'react';
import api from '../api/client';
import MovieCard from '../components/MovieCard';
import Pagination from "../components/Pagination.jsx";

const Home = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            try {
                const endpoint = search.trim()
                    ? `/api/movies/search?title=${search}&page=${page}`
                    : `/api/movies/trending?page=${page}`;

                const { data } = await api.get(endpoint);


                setMovies(data.movies);
                setTotalPages(Math.ceil(data.totalMovies / (data.limit || 10)));

                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, [page, search]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    return (
        <div style={styles.container}>
            {/* Search Bar Section */}
            <div style={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Search for a movie (e.g. Batman, Inception)..."
                    value={search}
                    onChange={handleSearchChange}
                    style={styles.searchInput}
                />
            </div>

            <h2 style={styles.sectionTitle}>
                {search ? `Search Results for "${search}"` : "Trending Movies"}
            </h2>

            {loading ? (
                <div style={styles.loader}>
                    <p>Loading the latest blockbusters...</p>
                </div>
            ) : (
                <>
                    <div style={styles.grid}>
                        {movies.length > 0 ? (
                            movies.map(movie => (
                                <MovieCard key={movie.imdbID || movie._id} movie={movie} />
                            ))
                        ) : (
                            <div style={styles.noResults}>
                                <p>No movies found. Try a different search term!</p>
                            </div>
                        )}
                    </div>

                    {/* Only show pagination if we have results and more than one page */}
                    {totalPages > 1 && (
                        <Pagination
                            page={page}
                            setPage={setPage}
                            totalPages={totalPages}
                        />
                    )}
                </>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px 5%',
        backgroundColor: '#fdfdfd',
        minHeight: '100vh',
    },
    searchContainer: {
        display: 'flex',
        justifyContent: 'center',
        margin: '20px 0 40px 0',
    },
    searchInput: {
        width: '100%',
        maxWidth: '600px',
        padding: '15px 25px',
        borderRadius: '30px',
        border: '1px solid #ced4da',
        fontSize: '18px',
        outline: 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
    },
    sectionTitle: {
        color: '#2d3436',
        marginBottom: '30px',
        fontSize: '24px',
        borderLeft: '5px solid #e50914',
        paddingLeft: '15px'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '25px',
        marginBottom: '40px'
    },
    loader: {
        textAlign: 'center',
        marginTop: '100px',
        fontSize: '18px',
        color: '#636e72'
    },
    noResults: {
        gridColumn: '1 / -1',
        textAlign: 'center',
        padding: '50px',
        color: '#b2bec3',
        fontSize: '18px'
    }
};

export default Home;