const multer = require("multer");
const fs = require('fs');

const uploader = (destination, initial) => {
    let defaultPath = "./public"
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            console.log(file);
            const dir = defaultPath + destination
            console.log(dir);
            if (fs.existsSync(dir)) {
                console.log("ada");
                cb(null, dir)
            } else {
                fs.mkdir(dir, { recursive: true }, (err) => cb(err, dir))
                console.log("buat ", dir);
            }
        },
        filename: (req, file, cb) => {
            let ogname = file.originalname
            let ext = ogname.split(".")
            console.log(ext);
            let filename = initial + Date.now() + "." + ext[ext.length - 1]
            cb(null, filename)
        }
    })

    const filefilter = (req, file, cb) => {
        const ext = /\.(jpg|jpeg|png|gif|pdf|doc|docx|xlsx)$/
        if (!file.originalname.match(ext)) {
            return cb(new Error("only selected file types are allowed"))
        }
        cb(null, true)
    }

    return multer({
        storage: storage,
        fileFilter: filefilter,
        limits: {
            fileSize: 2 * 1024 * 1024
        }
    })
}

module.exports = uploader;