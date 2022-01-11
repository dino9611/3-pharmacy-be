const express = require('express');
const {
  readRevenue,
  readRecentNewUsers,
  readSalesByCategory,
  readRecentCartedItems,
} = require('../controllers/statsControllers');
const { verifyAccessToken } = require('../helpers/verifyToken');
const { verifyAdmin } = require('../middlewares/verifyAdmin');

const route = express.Router();

route.use(verifyAccessToken);
route.use(verifyAdmin);

// ? admin request
route.get('/revenue', readRevenue);
route.get('/recent_new_users', readRecentNewUsers);
route.get('/recent_carted_items', readRecentCartedItems);
route.get('/sales_by_category', readSalesByCategory);

module.exports = route;
