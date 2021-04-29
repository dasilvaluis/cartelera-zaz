import React from 'react';
import PropTypes from 'prop-types';
import { CardDeck } from 'react-bootstrap';
import { MovieItem } from '../MovieItem/movie-item';

export function MoviesList({
  movies,
}) {
  return (
    <CardDeck>
      { movies.map((movie) => (
        <MovieItem
          key={ movie.id }
          title={ movie.title }
          poster={ movie.poster }
          pageUrl={ movie.pageUrl }
        />
      )) }
    </CardDeck>
  );
}

MoviesList.propTypes = {
  movies: PropTypes.arrayOf(PropTypes.object).isRequired,
};
