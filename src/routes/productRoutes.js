const express = require('express');
const {
  createProduct, getProducts, getProductsPagination, getCategories, AdminGetProducts, AdminGetProductsPagination,
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

const testBodyData = (req, res, next) => {
  req.body.data = {
    productName: 'catropil',
    stock: 11111,
    description: 'description',
    categories: [1, 2, 4], // array of product_category_id
    compositions: [
      [1, 1.3],
      [2, 3.1],
      [3, 6.9],
    ], // array of [raw_material_id, amountInUnit]
  };
  req.body.data = JSON.stringify(req.body.data);
  next();
};

// ? admin request
route.post('/', productImgUploader, testBodyData, createProduct);
// ? user request
// route.get('/:product_id?', readProduct);
// ? admin request
// route.get('/composition/:product_id', readProductComposition);
// ? admin request
// route.patch('/:product_id', updateProduct);

route.get("/getcategories", getCategories)
// admin
route.get('/admingetproducts', AdminGetProducts)
route.get("/getproductspagination/:rowsPerPage/:page", AdminGetProductsPagination)
// user
route.get("/getproducts/", getProducts)
route.get("/gethomepagination/:page", getProductsPagination)

module.exports = route;
