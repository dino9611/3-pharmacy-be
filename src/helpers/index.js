<<<<<<< HEAD
const uploader = require('./uploader');

module.exports = {
    uploader
};
=======
const createToken = require ("./emailToken")
const transporter = require("./transporter")
const verifyToken = require("./verifyToken")

module.exports = {
    createToken,
    transporter,
    verifyToken,
}
>>>>>>> develop-be
