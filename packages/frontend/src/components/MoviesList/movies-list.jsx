import React from 'react';
import PropTypes from 'prop-types';
import { ListGroup } from 'react-bootstrap';
import { MovieItem } from '../MovieItem/movie-item';

export function MoviesList({
  movies,
}) {
  return (
    <div className="container">
      <ListGroup className="flex-row row">
        { movies.map((movie) => (
          <ListGroup.Item className="col-6 movie-item" key={ movie.id }>
            <MovieItem
              title={ movie.title }
              poster={ movie.poster }
              pageUrl={ movie.pageUrl }
            />
          </ListGroup.Item>
        )) }
      </ListGroup>
    </div>
  );
}

MoviesList.propTypes = {
  movies: PropTypes.arrayOf(PropTypes.object).isRequired,
};
