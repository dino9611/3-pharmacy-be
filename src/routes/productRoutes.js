const express = require('express');
const {
  createProduct,
  // readProduct,
  // readProductComposition,
  // updateProduct,
} = require('../controllers/productControllers');
const uploader = require('../helpers/uploader');
// const {} = require('../helpers/verifyJWT');

const route = express.Router();
const productImgUploader = uploader('/products', 'PROD').fields([
  { name: 'image', maxCount: 3 },
]);

// ? admin request
route.post('/', productImgUploader, createProduct);
// ? admin request
// route.get('/:product_id?', readProduct);
// ? admin request
// route.get('/composition/:product_id', readProductComposition);
// ? admin request
// route.patch('/:product_id', updateProduct);

module.exports = route;
