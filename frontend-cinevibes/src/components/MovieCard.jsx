import React, { useState } from 'react';
import {useNavigate} from "react-router-dom";

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
        <div className="movie-card" onClick={handleClick} style={{cursor: "pointer"}}>
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

export default MovieCard;