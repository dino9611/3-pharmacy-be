const { addToCart, deleteFromCart, getCart, editQuantity, transactionRequest, checkout, paymentProof, getCheckout, getOrder, historyDetails, adminGetOrder } = require('../controllers/transactionControllers');
const { uploader } = require('../helpers');

const router = require('express').Router();

const uploadProof = uploader('/payment', "PAY").fields([
    { name: "product", maxCount: 3 },
    { name: "prescription", maxCount: 3 }
])

router.post('/addtocart/:user_id', addToCart)
router.delete('/deletefromcart/:user_id/:product_id', deleteFromCart)
router.get('/getcart/:user_id', getCart)
router.patch('/editqty/:user_id', editQuantity)
router.patch('/checkout/:user_id', checkout)
router.get('/getcheckout/:order_id', getCheckout)
router.get('/admingetorder', adminGetOrder)
router.get('/getorder/:user_id', getOrder)
router.patch('/paymentproof/:order_id', uploadProof, paymentProof)
router.patch('/transactionreq/:order_id', transactionRequest)
router.get('/historydetails/:order_id', historyDetails)

module.exports = router