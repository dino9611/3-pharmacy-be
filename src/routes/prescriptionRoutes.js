const express = require("express")
const router = express.Router()
const { prescriptionControllers } = require("../controllers")
const { customUpload, getDataCustom, createPrescription, updateStatus, updatePrescriptionName, getDetails, getMedicineName, getUserCustom, paymentProof } = prescriptionControllers
const uploader = require('../helpers/uploader')

const customUploader = uploader('/prescription', 'CUST').fields([
    {name: 'custom', maxCount: 3}
])
const paymentUploader = uploader('/paymentproof', 'PAYM').fields([
    {name: 'proof', maxCount: 3}
])

//! route user
router.get("/usercustom", getUserCustom)
router.patch("/update/payment/:id", paymentUploader, paymentProof)

//! Route Admin
router.get("/", getDataCustom)
router.get("/details/:id", getDetails)
router.get("/medicine/:id", getMedicineName)
router.post("/upload/:id", customUploader , customUpload)
router.post("/create", createPrescription)
router.patch("/nextstatus", updateStatus)
router.patch("/custname", updatePrescriptionName)


module.exports = router