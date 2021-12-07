require('dotenv').config();
const express = require('express');
const { authRoutes, profileRoutes } = require('./src/routes');
const app = express();
const PORT = process.env.PORT || 2003;
const mysql = require("./src/connections/db")


app.use(express.json());


app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ! routes
const { authRoutes } = require("./src/routes")
app.use('/', require('./src/routes/rootRoutes'));
app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)

app.all('*', (req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
