const express = require('express');
const {
  readRevenue,
  readPotentialRevenue,
  readCartedItem,
  readSalesSuccessRate,
} = require('../controllers/statsControllers');
const { verifyAccessToken } = require('../helpers/verifyToken');
const { verifyAdmin } = require('../middlewares/verifyAdmin');

const route = express.Router();

route.use(verifyAccessToken);
route.use(verifyAdmin);

// ? admin request
route.get('/revenue/:time?', readRevenue);
route.get('/potential_revenue/:time?', readPotentialRevenue);
route.get('/carted_item', readCartedItem);
route.get('/sales_success_rate', readSalesSuccessRate);

module.exports = route;
