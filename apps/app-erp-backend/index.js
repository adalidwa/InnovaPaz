import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { SERVER_CONFIG } from './utils/env.js';
import { encodingMiddleware } from './utils/encoding.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(encodingMiddleware);

// Serve static files
app.use(express.static('public'));

// Basic routes
app.get('/', (req, res) => {
  res.json({
    message: 'Academia Boliviana de Historia Militar - API Server',
    status: 'running',
    environment: SERVER_CONFIG.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = SERVER_CONFIG.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${SERVER_CONFIG.NODE_ENV}`);
  console.log(`📍 Server URL: ${SERVER_CONFIG.SERVER_URL}`);
});

export default app;
