import React from 'react';
import { MoviesContainer } from './containers/movies-container';
import './styles/app.scss';

export default function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h2>Cartelera Zaragoza</h2>
      </header>
      <main className="app-content">
        <MoviesContainer />
      </main>
    </div>
  );
}
