import React, { useEffect, useState } from 'react';
import { Spinner, Alert, Nav } from 'react-bootstrap';
import { MoviesList } from '../components/MoviesList/movies-list';
import { getMovies } from '../services/movies-service';

const MOVIES_TABS = {
  onScreen: 'on-screen',
  upcoming: 'upcoming',
};

export function MoviesContainer() {
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(false);
  const [ movies, setMovies ] = useState([]);
  const [ currMoviesTab, setMoviesTab ] = useState(MOVIES_TABS.onScreen);

  async function loadMovies() {
    setLoading(true);
    setError(false);

    try {
      const { content: updatedMovies } = await getMovies({
        limit: 100,
        showSessions: false,
        upcoming: currMoviesTab === MOVIES_TABS.upcoming,
      });

      setMovies(updatedMovies);
    } catch {
      setError(true);
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
        { error && (
          <Alert className="mx-auto my-3" variant="danger">
            Oops! Something went wrong. Please try again.
          </Alert>
        ) }
        { !loading && !error && <MoviesList movies={ movies } /> }
      </div>
    </>
  );
}
