const express = require('express');
const {
  createProduct,
  getProducts,
  getProductsPagination,
  readProduct,
  // readProductComposition,
  updateProduct,
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
route.get('/:product_id?', readProduct);
// ? admin/user request
// route.get('/composition/:product_id', readProductComposition);
// ? admin/user request
route.patch('/:product_id', updateProduct);

route.get('/getproducts/', getProducts);
route.get('/getproductspagination/:rowsPerPage/:page', getProductsPagination);

module.exports = route;
