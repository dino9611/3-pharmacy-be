const express = require('express');
const {
  createProduct,
  readProduct,
  readProductComposition,
  updateProduct,
} = require('../controllers/productControllers');
// const {} = require('../helpers/verifyJWT');

const route = express.Router();

// ? admin request
route.post('/', createProduct);
// ? admin request
route.get('/:product_id?', readProduct);
// ? admin request
route.get('/composition/:product_id', readProductComposition);
// ? admin request
route.patch('/:product_id', updateProduct);

module.exports = route;
