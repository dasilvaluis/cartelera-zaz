import React, { useEffect, useState } from 'react';
import { Spinner, Alert, Nav, CardDeck } from 'react-bootstrap';
import { getMovies, getMovie } from '../services/movies-service';
import { MovieItem } from '../components/MovieItem/movie-item';

const MOVIES_TABS = {
  onScreen: 0,
  upcoming: 1,
};

export function MoviesContainer() {
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState({ enabled: false, message: '' });
  const [ currMoviesTab, setMoviesTab ] = useState(MOVIES_TABS.onScreen);
  const [ movies, setMovies ] = useState([]);

  function toggleError(enabled, message = null) {
    setError((prevState) => ({
      enabled,
      message: message ?? prevState.message,
    }));
  }

  async function loadMovieSession(movieId) {
    const apiMovie = await getMovie(movieId);

    setMovies((prevState) => {
      const movieIndex = prevState.findIndex(({ id }) => id === movieId);

      const newState = movieIndex > 0
        ? [
          ...prevState.slice(0, movieIndex),
          { ...movies[movieIndex], sessions: apiMovie.sessions },
          ...prevState.slice(movieIndex - 1),
        ]
        : prevState;

      return newState;
    });
  }

  async function loadMovies() {
    setLoading(true);
    toggleError(false);

    try {
      const { content: apiMovies } = await getMovies({
        limit: 100,
        showSessions: false,
        upcoming: currMoviesTab === MOVIES_TABS.upcoming,
      });

      setMovies(apiMovies);

      apiMovies.forEach((movie) => {
        loadMovieSession(movie.id);
      });
    } catch (errorObj) {
      toggleError(true, errorObj.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(loadMovies, [ currMoviesTab ]);

  return (
    <>
      <Nav className="mb-3" variant="tabs" defaultActiveKey={ MOVIES_TABS.onScreen } onSelect={ setMoviesTab }>
        <Nav.Item>
          <Nav.Link disabled={ loading } eventKey={ MOVIES_TABS.onScreen }>On Screen</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link disabled={ loading } eventKey={ MOVIES_TABS.upcoming }>Upcoming</Nav.Link>
        </Nav.Item>
      </Nav>
      <div>
        { loading && (
          <div className="d-flex justify-content-center">
            <Spinner className="my-3" animation="border" />
          </div>
        ) }
        { error.enabled && (
          <Alert className="mx-auto my-3" variant="danger">
            Oops! Something went wrong. Please try again.
            { !!error.message && (
              <>
                <br />
                { `Message: ${ error.message }` }
              </>
            ) }
          </Alert>
        ) }
        { !loading && !error.enabled && (
          <CardDeck>
            { movies.map((movie) => (
              <MovieItem
                key={ movie.id }
                title={ movie.title }
                poster={ movie.poster }
                pageUrl={ movie.pageUrl }
                sessions={ movie.sessions }
              />
            )) }
          </CardDeck>
        ) }
      </div>
    </>
  );
}
