const express = require('express');
const {
  createProduct,
  readProduct,
  getProducts,
  getProductsPagination,
  getCategories,
  AdminGetProducts,
  AdminGetProductsPagination,
  updateProduct,
  getDescription,
  getEdit,
  deleteProduct,
} = require('../controllers/productControllers');
const uploader = require('../helpers/uploader');
const { verifyAccessToken } = require('../helpers/verifyToken');
const { verifyAdmin } = require('../middlewares/verifyAdmin');

const route = express.Router();
const productImgUploader = uploader('/products', 'PROD').fields([
  { name: 'image', maxCount: 3 },
]);

// * zaky
route.get('/getcategories', getCategories);
route.get('/getdescription/:product_id', getDescription);
// admin
route.get('/admingetproducts', AdminGetProducts);
route.get(
  '/getproductspagination/:rowsPerPage/:page',
  AdminGetProductsPagination
);
// user
route.get('/getproducts/', getProducts);
route.get('/gethomepagination/:page', getProductsPagination);

// ? admin request
route.use(verifyAccessToken);
route.use(verifyAdmin);

// ! CREATE
route.post('/', productImgUploader, createProduct);
// ! READ
route.get('/admingetproducts', AdminGetProducts);
route.get(
  '/getproductspagination/:rowsPerPage/:page',
  AdminGetProductsPagination
);
route.get('/:product_id?', readProduct);
// ? GetEditCategories
route.get('/editcategory/:id', getEdit);
// ! UPDATE
route.patch('/', productImgUploader, updateProduct);
// ! DELETE
route.delete('/delete/:id', deleteProduct);

module.exports = route;
