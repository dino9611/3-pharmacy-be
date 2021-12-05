const express = require('express');
const {
  createRawMaterial,
  readRawMaterial,
  readRawMaterialRecord,
  updateRawMaterial,
} = require('../controllers/rawMaterialControllers');
// const {} = require('../helpers/verifyJWT');

const route = express.Router();

// route.use(someAdminVerifierMiddleware())

// ? admin request
route.post('/', createRawMaterial);
// ? admin request
route.get('/record', readRawMaterialRecord);
// ? admin request
route.get('/:raw_material_id?', readRawMaterial);
// ? admin request
route.patch('/:raw_material_id', updateRawMaterial);

module.exports = route;
