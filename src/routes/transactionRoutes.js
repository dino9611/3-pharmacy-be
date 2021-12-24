const { addToCart, deleteFromCart, getCart, editQuantity, transactionRequest, checkout, paymentProof } = require('../controllers/transactionControllers');
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
router.patch('/paymentproof/:user_id', uploadProof, paymentProof)
router.patch('/transactionreq/:user_id', transactionRequest)

module.exports = router