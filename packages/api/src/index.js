import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import moviesRoutes from './routes/movies.route.js';
import queryParser from './middleware/query-parser.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(queryParser);
app.use(moviesRoutes);

app.listen(process.env.PORT || 8080);
