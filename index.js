require('dotenv').config();
const express = require('express');
const { authRoutes, profileRoutes, transactionRoutes, prescriptionRoutes } = require('./src/routes');
const app = express();
const PORT = process.env.PORT || 2003;
const cors = require('cors');
const bearer = require('express-bearer-token');


// ! body parse


app.use(
  cors({
    exposedHeaders: ['access-token'],
  })
);


// ! body parse
app.use(bearer());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ! routes
app.use('/', require('./src/routes/rootRoutes'));
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/raw_material', require('./src/routes/rawMaterialRoutes'));
app.use('/product', require('./src/routes/productRoutes'));
app.use('/auth', require('./src/routes/authRoutes'));
app.use('/transaction', transactionRoutes)
app.use('/custom', prescriptionRoutes)

app.all('*', (req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
