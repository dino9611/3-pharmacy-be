const express = require('express');
const {
  createProduct,
  readProduct,
  // readProductCategories,
  getProducts,
  getProductsPagination,
  getCategories,
  AdminGetProducts,
  AdminGetProductsPagination,
  // readProductComposition,
  updateProduct,
  getDescription,
} = require('../controllers/productControllers');
const uploader = require('../helpers/uploader');
// const {} = require('../helpers/verifyJWT');

const route = express.Router();
const productImgUploader = uploader('/products', 'PROD').fields([
  { name: 'image', maxCount: 3 },
]);


// * zaky
route.get('/getcategories', getCategories);
route.get('/getdescription', getDescription)
// admin
route.get('/admingetproducts', AdminGetProducts);
route.get(
  '/getproductspagination/:rowsPerPage/:page',
  AdminGetProductsPagination
);
// user
route.get('/getproducts/', getProducts);
route.get('/gethomepagination/:page', getProductsPagination);

// ! CREATE
// ? admin request
route.post('/', productImgUploader, createProduct);
// ! READ
// ? admin request
// route.get('/category', readProductCategories);
// ? admin request
route.get('/:product_id?', readProduct);
// ? admin request
// route.get('/composition/:product_id', readProductComposition);
// ! UPDATE
// ? admin/user request
route.patch('/', productImgUploader, updateProduct);

module.exports = route;
