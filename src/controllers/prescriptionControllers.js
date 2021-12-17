const pool = require('../connections/db');

exports.readPrescription = (req, res) => {
  res.json({ message: 'readPrescription' });
};
