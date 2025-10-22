const express = require('express');
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') });
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const morgan = require('morgan');
const cors = require('cors');
const { setupCronJobs } = require('./services/cronService');

const taskRoutes = require('./routes/task.routes');
const inventoryRoutes = require('./routes/inventories.routes');
const catalogRoutes = require('./routes/catalog.routes');
const reportsRoutes = require('./routes/reports.routes');
const clientsRoutes = require('./routes/clients.routes');
const categoriesRoutes = require('./routes/categories.routes');
const quotesRoutes = require('./routes/quotes.routes');
const salesRoutes = require('./routes/sales.routes');
const inventoryMovementsRoutes = require('./routes/inventory-movements.routes');
const uploadRoutes = require('./routes/upload.routes');
const shoppingRoutes = require('./routes/shopping.routes');

const app = express();

// Configuración de CORS más permisiva para producción
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://innovapaz-app-erp-alpha.vercel.app',
    'https://innovapaz-website-erp-marketing.vercel.app',
    'https://innovapaz-app-erp.vercel.app',
    /\.vercel\.app$/,
    /localhost/,
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'INNOVAPAZ ERP Backend API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'OK',
    message: 'INNOVAPAZ ERP API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/roles-plantilla', require('./routes/rolesPlantilla'));
app.use('/api/subscriptions', require('./routes/subscription'));
app.use('/api/invitations', require('./routes/invitations'));
app.use('/api/reports', reportsRoutes);

app.use(taskRoutes);
app.use('/api', inventoryRoutes);
app.use('/api', catalogRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/client-categories', categoriesRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/quotes', quotesRoutes);
const orderRoutes = require('./routes/order.routes');
app.use('/api', orderRoutes);
app.use('/api/inventory', inventoryMovementsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/shopping', shoppingRoutes);

app.use((err, req, res, next) => {
  return res.json({
    message: err.message,
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT);
console.log(`Server on port ${PORT}`);

// Configurar cron jobs para verificar suscripciones
setupCronJobs();
