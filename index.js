require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 2003;

app.use(cors());
// ! body parse
app.use(express.json());

// ! routes
app.use('/', require('./src/routes/rootRoutes'));
app.use('/raw_material', require('./src/routes/rawMaterialRoutes'));
app.use('/product', require('./src/routes/productRoutes'));

app.all('*', (req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
