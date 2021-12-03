const express = require('express');
const { getRoot } = require('../controllers/rootControllers');

const route = express.Router();

route.get('/', getRoot);

module.exports = route;
