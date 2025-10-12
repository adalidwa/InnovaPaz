const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const taskRoutes = require('./routes/task.routes');
const inventoryRoutes = require('./routes/inventories.routes');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Rutas propias agrupadas bajo /api/
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/roles', require('./routes/roles'));

// Mantén inventarios y tareas fuera de /api/ según lo solicitado
app.use(taskRoutes);
app.use('/api', inventoryRoutes);

app.use((err, req, res, next) => {
  return res.json({
    message: err.message,
  });
});

app.listen(4000);
console.log('Server on port 4000');
console.log('Server on port 4000');
