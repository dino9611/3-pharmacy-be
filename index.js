require('dotenv').config();
const express = require('express');

app.use(express.json());

app.use(cors());
// ! body parse
app.use(express.json());

// ! routes
app.use('/', require('./src/routes/rootRoutes'));
app.use('/raw_material', require('./src/routes/rawMaterialRoutes'));
app.use('/product', require('./src/routes/productRoutes'));
app.use('/auth', require('./src/routes/authRoutes'));

app.all('*', (req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
