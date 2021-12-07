const express = require("express")
const router = express.Router()
const {authControllers} = require("../controllers")
const {register, verifyAcc, sendVerifiedEmail, changePassword, passValidation} = authControllers
const {verifyToken} = require('../helpers')
const {verifyEmailToken} = verifyToken



router.post("/register", register)
router.get("/verified", verifyEmailToken, verifyAcc)
router.get("/send/verified/:username", sendVerifiedEmail)
router.get("/validasi/password", passValidation)
router.patch("/change/password", verifyEmailToken, changePassword)


module.exports = router