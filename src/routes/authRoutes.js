const { logIn } = require('../controllers/authControllers')
const router = require('express').Router()

router.post("/login", logIn)

module.exports = router
