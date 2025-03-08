import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

// Import the routes
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the correct path (relative to project root)
app.use(express.static(path.join(__dirname, '../../client/dist')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Implement middleware to connect the routes
app.use(routes);

// For any other request, send the index.html file
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

// 404 handler for API routes
app.use((_req, res) => {
  res.status(404).send('Not Found');
});

// Start the server on the port
app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));