const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { setupCronJobs } = require('./services/cronService');

const taskRoutes = require('./routes/task.routes');
const inventoryRoutes = require('./routes/inventories.routes');
const catalogRoutes = require('./routes/catalog.routes');
const clientsRoutes = require('./routes/clients.routes');
const categoriesRoutes = require('./routes/categories.routes');
const salesRoutes = require('./routes/sales.routes');
const inventoryMovementsRoutes = require('./routes/inventory-movements.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/subscriptions', require('./routes/subscription'));

app.use(taskRoutes);
app.use('/api', inventoryRoutes);
app.use('/api', catalogRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/inventory', inventoryMovementsRoutes);
app.use('/api/upload', uploadRoutes);

app.use((err, req, res, next) => {
  return res.json({
    message: err.message,
  });
});

app.listen(4000);
console.log('Server on port 4000');
