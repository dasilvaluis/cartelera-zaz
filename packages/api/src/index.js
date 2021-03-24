import express from 'express';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from './utils/swagger-options.js';
import moviesRoutes from './routes/movies.route.js';

dotenv.config();

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
const app = express();

app.use(moviesRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOptions, { explorer: true }));

app.listen(process.env.PORT || 8080);
