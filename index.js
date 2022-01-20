require('dotenv').config();
require('./src/event_scheduler/checkPrescriptionPayment'); // * initialize event scheduler

const express = require('express');
const app = express();
const PORT = process.env.PORT || 2003;
const cors = require('cors');
const bearer = require('express-bearer-token');

// ! body parse
const {
  authRoutes,
  profileRoutes,
  transactionRoutes,
  prescriptionRoutes,
} = require('./src/routes');
app.use(
  cors({
    exposedHeaders: ['access-token'],
  })
);

// ! body parse
app.use(bearer());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ! routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/raw_material', require('./src/routes/rawMaterialRoutes'));
app.use('/product', require('./src/routes/productRoutes'));
app.use('/auth', require('./src/routes/authRoutes'));
app.use('/custom', prescriptionRoutes);
app.use('/stats', require('./src/routes/statsRoutes'));
app.use('/transaction', transactionRoutes);

app.all('*', (req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.listen(PORT, () => console.log(`running on port ${PORT}`));
