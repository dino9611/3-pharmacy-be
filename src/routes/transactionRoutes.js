const { addToCart, deleteFromCart, getCart, editQuantity } = require('../controllers/transactionControllers');

const router = require('express').Router();

router.post('/addtocart/:user_id', addToCart)
router.delete('/deletefromcart/:user_id/:product_id', deleteFromCart)
router.get('/getcart/:user_id', getCart)
router.patch('/editqty/:user_id', editQuantity)

module.exports = router