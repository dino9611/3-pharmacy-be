const express = require('express');
const router = express.Router();
const { prescriptionControllers } = require('../controllers');
const {
  customUpload,
  getDataCustom,
  createPrescription,
  updateStatus,
  updatePrescriptionName,
  getDetails,
  getMedicineName,
  getUserCustom,
  paymentProof,
  userConfirmDelivery,
} = prescriptionControllers;
const { verifyAccessToken } = require('../helpers/verifyToken');
const { verifyAdmin } = require('../middlewares/verifyAdmin');

const uploader = require('../helpers/uploader');

const customUploader = uploader('/prescription', 'CUST').fields([
  { name: 'custom', maxCount: 3 },
]);
const paymentUploader = uploader('/paymentproof', 'PAYM').fields([
  { name: 'proof', maxCount: 3 },
]);

router.use(verifyAccessToken);

//! route user
router.get('/usercustom', getUserCustom);
router.post('/confirm_delivery', userConfirmDelivery);
router.patch('/update/payment/:id', paymentUploader, paymentProof);

router.use(verifyAdmin);

//! Route Admin
router.get('/', getDataCustom);
router.get('/details/:id', getDetails);
router.get('/medicine/:id', getMedicineName);
router.post('/upload', customUploader, customUpload);
router.post('/create', verifyAccessToken, verifyAdmin, createPrescription);
router.patch('/nextstatus', updateStatus);
router.patch('/custname', updatePrescriptionName);

module.exports = router;
