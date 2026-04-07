import React, { useState } from 'react';

const MovieCard = ({ movie }) => {
    const [imgError, setImgError] = useState(false);

    const fallbackImage = "https://via.placeholder.com/300x450?text=No+Poster+Found";

    const currentSrc = imgError || !movie.poster || movie.poster === "N/A"
        ? fallbackImage
        : movie.poster;

    return (
        <div className="movie-card">
            <img
                src={currentSrc}
                alt={movie.title}
                style={{ width: '100%', borderRadius: '8px' }}
                onError={() => {
                    if (!imgError) {
                        console.log(`Image failed for: ${movie.title}. Switching to fallback.`);
                        setImgError(true);
                    }
                }}
            />
            <div className="movie-info">
                <h3>{movie.title}</h3>
                <p>{movie.year} • ⭐ {movie.rating}</p>
            </div>
        </div>
    );
};

const styles = {
    card: {
        width: '250px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E3E8EE',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s ease',
    },
    image: { width: '100%', height: '375px', objectFit: 'cover' },
    info: { padding: '20px' },
    title: { fontSize: '18px', margin: '0 0 10px 0', color: '#1A232E' },
    metadata: { fontSize: '14px', color: '#6A7A8C' },
    rating: { color: '#0056D2', fontWeight: 'bold' }
};

export default MovieCard;