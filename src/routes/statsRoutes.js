const express = require('express');
const {
  readRevenue,
  readPotentialRevenue,
  readOrders,
} = require('../controllers/statsControllers');
const { verifyAccessToken } = require('../helpers/verifyToken');
const { verifyAdmin } = require('../middlewares/verifyAdmin');

const route = express.Router();

route.get('/orders', readOrders);
route.use(verifyAccessToken);
route.use(verifyAdmin);

// ? admin request
route.get('/revenue/:time?', readRevenue);
route.get('/potential_revenue/:time?', readPotentialRevenue);
// route.get('/failed', readPotentialRevenue);

module.exports = route;
