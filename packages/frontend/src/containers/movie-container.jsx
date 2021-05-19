import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { MovieItem } from '../components/MovieItem/movie-item';
import { getMovie } from '../services/movies-service';

export function MovieContainer({
  movieId,
  title,
  poster,
  pageUrl,
}) {
  const [ sessions, setSessions ] = useState([]);
  const [ , setHasVosVersion ] = useState([]);
  const [ , setHasAtmosVersion ] = useState([]);

  async function loadMovieSessions() {
    const apiMovie = await getMovie(movieId);

    setSessions(apiMovie.sessions);
  }

  useEffect(loadMovieSessions, [ movieId ]);
  useEffect(() => {
    const hasVos = sessions.some((session) => session.isVos);
    const hasAtmos = sessions.some((session) => session.isAtmos);

    setHasVosVersion(hasVos);
    setHasAtmosVersion(hasAtmos);
  }, [ sessions ]);

  return (
    <MovieItem
      title={ title }
      poster={ poster }
      pageUrl={ pageUrl }
      sessions={ sessions }
    />
  );
}

MovieContainer.propTypes = {
  movieId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  poster: PropTypes.string.isRequired,
  pageUrl: PropTypes.string.isRequired,
};
