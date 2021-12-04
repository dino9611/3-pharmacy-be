require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 2003;

// ! body parse
app.use(express.json());

// ! routes
app.use('/', require('./src/routes/rootRoutes'));
app.use('/raw_material', require('./src/routes/rawMaterialRoutes'));

app.all('*', (req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
