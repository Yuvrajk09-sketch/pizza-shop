const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const menuRoutes = require('./routes/menu');
const ordersRoutes = require('./routes/orders');
const { initWebSocket } = require('./websockets');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', service: 'SliceCraft API (Node)', version: '1.0.0' });
});

app.use('/api/menu', menuRoutes);
app.use('/api/orders', ordersRoutes);
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Sync Database and Start Server
sequelize.sync().then(() => {
  console.log('Database synced successfully (MySQL via Sequelize).');
  const server = app.listen(PORT, () => {
    console.log(`Node.js Express Server running on http://127.0.0.1:${PORT}`);
  });
  
  // Initialize WebSockets
  initWebSocket(server);
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
