import React, { useEffect, useState } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import { MoviesList } from '../components/MoviesList/movies-list';
import { getMovies } from '../services/movies-service';

export function MoviesContainer() {
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(false);
  const [ movies, setMovies ] = useState([]);

  async function loadMovies() {
    setLoading(true);
    setError(false);

    try {
      const { content: updatedMovies } = await getMovies({
        limit: 100,
        showSessions: false,
      });

      setMovies(updatedMovies);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(loadMovies, []);

  return (
    <>
      { loading && (
        <div className="d-flex justify-content-center">
          <Spinner className="my-3" animation="border" />
        </div>
      ) }
      { error && (
        <Alert className="mx-auto my-3" variant="danger">
          Oops! Something went wrong. Please try again.
        </Alert>
      ) }
      { !loading && !error && <MoviesList movies={ movies } /> }
    </>
  );
}
