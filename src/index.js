import express from 'express';
import dotenv from 'dotenv';
import moviesRoutes from './routes/movies.route.js';

dotenv.config();

const app = express();

app.listen(process.env.PORT || 8080);

app.use(moviesRoutes);
