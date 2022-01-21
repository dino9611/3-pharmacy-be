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
  updateCostprofit,
} = prescriptionControllers;
const { verifyAccessToken } = require('../helpers/verifyToken');
const { verifyAdmin } = require('../middlewares/verifyAdmin');
const { verifyUser } = require('../middlewares/verifyUser');

const uploader = require('../helpers/uploader');

const customUploader = uploader('/prescription', 'CUST').fields([
  { name: 'custom', maxCount: 3 },
]);
const paymentUploader = uploader('/paymentproof', 'PAYM').fields([
  { name: 'proof', maxCount: 3 },
]);

router.use(verifyAccessToken);

// ! admin/user
router.get('/details/:id', getDetails);

//! route user
router.get('/usercustom', verifyUser, getUserCustom);
router.post('/confirm_delivery', verifyUser, userConfirmDelivery);
router.patch('/update/payment/:id', verifyUser, paymentUploader, paymentProof);
router.post('/upload', verifyUser, customUploader, customUpload);

router.use(verifyAdmin);

//! Route Admin
router.get('/', getDataCustom);
router.get('/medicine/:id', getMedicineName);
router.post('/create', verifyAccessToken, verifyAdmin, createPrescription);
router.patch('/nextstatus', updateStatus);
router.patch('/custname', updatePrescriptionName);
router.patch('/costprofit', updateCostprofit);

module.exports = router;
