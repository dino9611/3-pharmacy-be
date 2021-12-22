const express = require('express');
const {
  // createPrescription,
  readPrescription,
  // updatePrescription,
} = require('../controllers/prescriptionControllers');

const route = express.Router();

// ? admin request
// route.post('/', createPrescription);
// ? admin request
route.get('/', readPrescription);
// ? admin request
// route.patch('/:raw_material_id', updateRawMaterial);

module.exports = route;
