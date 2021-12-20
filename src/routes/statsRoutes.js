const express = require('express');
const {
  readRevenue,
  readPotentialRevenue,
} = require('../controllers/statsControllers');
const { verifyAccessToken } = require('../helpers/verifyToken');
const { verifyAdmin } = require('../middlewares/verifyAdmin');

const route = express.Router();

route.use(verifyAccessToken);
route.use(verifyAdmin);

// ? admin request
route.get('/revenue', readRevenue);
route.get('/potential_revenue', readPotentialRevenue);

module.exports = route;
