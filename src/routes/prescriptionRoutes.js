const express = require("express")
const router = express.Router()
const { prescriptionControllers } = require("../controllers")
const { customUpload, getDataCustom } = prescriptionControllers
const uploader = require('../helpers/uploader')

const customUploader = uploader('/prescription', 'CUST').fields([
    {name: 'custom', maxCount: 3}
])


router.get("/", getDataCustom)
router.post("/upload/:id", customUploader , customUpload)



module.exports = router