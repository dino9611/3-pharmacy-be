require('dotenv').config();
const express = require('express');
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 2003;
const mysql = require("./src/connections/db")


app.use(express.json())
app.use(cors());
// ! routes
const {authRoutes} = require("./src/routes")
app.use('/', require('./src/routes/rootRoutes'));
app.use ("/auth", authRoutes)



app.all('*', (req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
