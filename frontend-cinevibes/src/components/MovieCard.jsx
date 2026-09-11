import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

const formatYear = (year) => {
    if (!year) return year;
    const match = String(year).match(/^\d{4}/);
    return match ? match[0] : year;
};

const MovieCard = ({ movie }) => {
    const [imgError, setImgError] = useState(false);

    const fallbackImage = "https://via.placeholder.com/300x450?text=No+Poster+Found";

    const currentSrc = imgError || !movie.poster || movie.poster === "N/A"
        ? fallbackImage
        : movie.poster;

    const navigate = useNavigate();
    const handleClick = () => {
        navigate(`/movie/${movie.imdbID}`);
    }

    return (
        <div className="movie-card" onClick={handleClick} style={styles.card}>
            <div style={styles.posterWrapper}>
                <img
                    src={currentSrc}
                    alt={movie.title}
                    style={styles.poster}
                    onError={() => {
                        if (!imgError) {
                            console.log(`Image failed for: ${movie.title}. Switching to fallback.`);
                            setImgError(true);
                        }
                    }}
                />
            </div>
            <div className="movie-info" style={styles.info}>
                <h3 style={styles.title}>{movie.title}</h3>
                <p style={styles.meta}>{formatYear(movie.year)} • ⭐ {movie.rating}</p>
            </div>
        </div>
    );
};

const styles = {
    card: {
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
    },
    posterWrapper: {
        aspectRatio: '2 / 3',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#eee',
    },
    poster: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
    },
    info: {
        marginTop: '10px',
    },
    title: {
        margin: '0 0 4px 0',
        fontSize: '15px',
        fontWeight: 600,
        color: '#1a1a1a',
        lineHeight: '1.3',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    },
    meta: {
        margin: 0,
        fontSize: '13px',
        color: '#666',
    },
};

export default MovieCard;
