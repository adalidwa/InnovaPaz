import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { SERVER_CONFIG } from './utils/env.js';
import { encodingMiddleware } from './utils/encoding.js';
import cors from 'cors';
import userRoutes from './routes/users.js';
import companyRoutes from './routes/companies.js';
import authRoutes from './routes/auth.js';
import './db.js'; // Importar para inicializar la conexión a PostgreSQL

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:3000',
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(encodingMiddleware);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.json({
    message: 'ERP - API Server',
    status: 'running',
    environment: SERVER_CONFIG.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = SERVER_CONFIG.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${SERVER_CONFIG.NODE_ENV}`);
  console.log(`📍 Server URL: ${SERVER_CONFIG.SERVER_URL}`);
});

export default app;
