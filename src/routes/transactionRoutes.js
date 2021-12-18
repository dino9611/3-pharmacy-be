const { addToCart, deleteFromCart, getCart } = require('../controllers/transactionControllers');

const router = require('express').Router();

router.post('/addtocart/:user_id', addToCart)
router.delete('/deletefromcart/:user_id/:product_id', deleteFromCart)
router.get('/getcart/:user_id', getCart)

module.exports = router