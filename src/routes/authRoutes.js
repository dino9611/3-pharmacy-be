const express = require("express")
const router = express.Router()
const { authControllers } = require("../controllers")
const { register, verifyAcc, sendVerifiedEmail, changePassword, passValidation } = authControllers
const { verifyToken } = require('../helpers')
const { verifyEmailToken } = verifyToken
const { logIn, keepLoggedIn } = require('../controllers/authControllers')
const { verifyAccessToken } = require("../helpers/verifyToken")



router.post("/register", register)
router.get("/verified", verifyEmailToken, verifyAcc)
router.get("/send/verified/:username", sendVerifiedEmail)
router.get("/validasi/password", passValidation)
router.patch("/change/password", verifyEmailToken, changePassword)
router.post("/login", logIn)
router.get("/keeploggedin", verifyAccessToken, keepLoggedIn)


module.exports = router
