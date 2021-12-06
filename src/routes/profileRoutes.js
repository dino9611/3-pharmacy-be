const { editProfile, editAvatar } = require("../controllers/profileControllers");
const { uploader } = require("../helpers");
const router = require('express').Router();

const uploadFile = uploader("/avatar", "AVA").fields([
    { name: "avatar", maxCount: 3 },
]);

router.patch('/edit/:id', uploadFile, editProfile)
// router.patch('/editavatar/:id', uploadFile, editAvatar)

module.exports = router