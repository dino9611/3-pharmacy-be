const express = require('express');
const {
  readRevenue,
  readNewUsers,
} = require('../controllers/statsControllers');
const { verifyAccessToken } = require('../helpers/verifyToken');
const { verifyAdmin } = require('../middlewares/verifyAdmin');

const route = express.Router();

route.use(verifyAccessToken);
route.use(verifyAdmin);

// ? admin request
route.get('/revenue', readRevenue);
route.get('/new_users', readNewUsers);

module.exports = route;
