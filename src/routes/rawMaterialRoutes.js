const express = require('express');
const {
  createRawMaterial,
  readRawMaterial,
  readRawMaterialRecord,
  updateRawMaterial,
} = require('../controllers/rawMaterialControllers');
const { verifyAccessToken } = require('../helpers/verifyToken');
const { verifyAdmin } = require('../middlewares/verifyAdmin');

const route = express.Router();

route.use(verifyAccessToken);
route.use(verifyAdmin);

// ? all admin request
route.post('/', createRawMaterial);
route.get('/record', readRawMaterialRecord);
route.get('/:raw_material_id?', readRawMaterial);
route.patch('/:raw_material_id', updateRawMaterial);

module.exports = route;
