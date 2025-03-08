import dotenv from 'dotenv';
import express from 'express';
dotenv.config();

// Import the routes
import routes from './routes/index.js';

const app = express();

const PORT = process.env.PORT || 3001;
// implement middleware for parsing JSON and urlencoded form data
// Serve static files of entire client dist folder
app.use(express.static('client/dist'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Implement middleware to connect the routes
app.use(routes);


app.use((_req, res) => {
  res.status(404).send('Not Found');
});

// Start the server on the port
app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));
