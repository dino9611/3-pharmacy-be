const {
  addToCart,
  deleteFromCart,
  getCart,
  editQuantity,
  transactionRequest,
  checkout,
  paymentProof,
  getCheckout,
  getOrder,
  historyDetails,
  adminGetOrder,
  boughtProducts,
  orderLength,
  adminOrderLength,
  confirmProductDelivery,
} = require('../controllers/transactionControllers');
const { uploader } = require('../helpers');
const { verifyAccessToken } = require('../helpers/verifyToken');
const { verifyAdmin } = require('../middlewares/verifyAdmin');
const { verifyUser } = require('../middlewares/verifyUser');

const router = require('express').Router();

router.use(verifyAccessToken);

const uploadProof = uploader('/payment', 'PAY').fields([
  { name: 'product', maxCount: 3 },
  { name: 'prescription', maxCount: 3 },
]);

// ? admin/user
router.get('/historydetails/:order_id', historyDetails);
router.get('/boughtproducts/:order_id', boughtProducts);

// ? admin
router.get('/adminorderlength', verifyAdmin, adminOrderLength);
router.get('/admingetorder', verifyAdmin, adminGetOrder);
router.patch('/transactionreq/:order_id', transactionRequest);

// ? user
router.use(verifyUser);

router.patch('/confirm_delivery/:order_id', confirmProductDelivery);
router.post('/addtocart/:user_id', addToCart);
router.delete('/deletefromcart/:user_id/:product_id', deleteFromCart);
router.get('/getcart/:user_id', getCart);
router.patch('/editqty/:user_id', editQuantity);
router.patch('/checkout/:user_id', checkout);
router.get('/getcheckout/:order_id', getCheckout);
router.get('/orderlength/:user_id', orderLength);
router.get('/getorder/:user_id/:offset', getOrder);
router.patch('/paymentproof/:order_id', uploadProof, paymentProof);

module.exports = router;
