const multer = require('multer');
const fs = require('fs');

// destination  adalah tempat dimana kita mau menyimpan filenya
// filenamePrefix adalah nama depan dari filenya 32131313313173
const uploader = (destination, filenamePrefix) => {
  // expectation destination = '/products'
  let defaultPath = './public';
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // console.log('line 10 isi file : ', file);
      const dir = defaultPath + destination;
      // console.log('dir :', dir);
      if (fs.existsSync(dir)) {
        // console.log(dir, 'exist');
        cb(null, dir);
      } else {
        fs.mkdir(dir, { recursive: true }, (err) => cb(err, dir));
        // console.log(dir, 'make');
      }
    },
    filename: (req, file, cb) => {
      let originalName = file.originalname;
      let ext = originalName.split('.'); // nama file 'dino.png' -> [dino,png]
      let filename = filenamePrefix + Date.now() + '.' + ext[ext.length - 1]; // ext[ext.length - 1] = png
      cb(null, filename);
    },
  });

  const imageFilter = (req, file, callback) => {
    const ext = /\.(jpg|jpeg|png|gif|pdf|doc|docx|xlsx)$/; //regex
    if (!file.originalname.match(ext)) {
      return callback(new Error('Only selected file type are allowed'), false);
    }
    callback(null, true);
  };

  return multer({
    storage: storage,
    fileFilter: imageFilter,
    limits: {
      fileSize: 2 * 1024 * 1024, //2mb
    },
  });
};

module.exports = uploader;
