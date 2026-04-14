import {useParams} from 'react-router-dom';
import { useEffect, useState } from 'react'
import axios from 'axios'

const MovieDetail = () => {
    const { id } = useParams()
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`http://localhost:8000/api/movies/${id}`)
            .then(res => {
                setMovie(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            })
    }, []);

    if (loading) return <div>Loading a movie...</div>;

    return (
        <div>
            <h1>{movie.title}</h1>
            <img src={movie.poster} alt={movie.title} />
            <p>{movie.plot}</p>
            <p>{movie.rating}</p>
            <p>{movie.director}</p>
            <p>{movie.actors}</p>
        </div>
    )
}

export default MovieDetail