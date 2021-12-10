const express = require('express');
const {
  createProduct,
  getProducts,
  getProductsPagination,
  readProduct,
  readProductCategories,
  // readProductComposition,
  updateProduct,
} = require('../controllers/productControllers');
const uploader = require('../helpers/uploader');
// const {} = require('../helpers/verifyJWT');

const route = express.Router();
const productImgUploader = uploader('/products', 'PROD').fields([
  { name: 'image', maxCount: 3 },
]);

// ! CREATE
// ? admin request
route.post('/', productImgUploader, createProduct);
// ! READ
// ? admin request
route.get('/category', readProductCategories);
// ? admin request
route.get('/:product_id?', readProduct);
// ? admin request
// route.get('/composition/:product_id', readProductComposition);
// ! UPDATE
// ? admin/user request
route.patch('/:product_id', updateProduct);

route.get('/getproducts/', getProducts);
route.get('/getproductspagination/:rowsPerPage/:page', getProductsPagination);

module.exports = route;
