import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'react-bootstrap';
import './movie-item.scss';

export function MovieItem({
  title,
  poster,
  pageUrl,
}) {
  return (
    <Card className="movie-item">
      <Card.Img src={ poster } />
      <Card.Body>
        <Card.Title className="movie-item__title">{ title }</Card.Title>
        <Card.Text>
          <a href={ pageUrl } target="_blank" rel="noreferrer">Page</a>
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

MovieItem.propTypes = {
  title: PropTypes.string.isRequired,
  poster: PropTypes.string.isRequired,
  pageUrl: PropTypes.string.isRequired,
};
