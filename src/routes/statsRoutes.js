const express = require('express');
const {
  readRevenue,
  readPotentialRevenue,
} = require('../controllers/statsControllers');

const route = express.Router();

// ? admin request
route.get('/revenue', readRevenue);
route.get('/potential_revenue', readPotentialRevenue);

module.exports = route;
