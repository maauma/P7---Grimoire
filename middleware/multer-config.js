const multer = require('multer');
const path = require('path');
const sharp = require('sharp');

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = path.extname(file.originalname);
    callback(null, name + Date.now() + extension);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },  // Limit filesize to 1MB
  fileFilter: (req, file, callback) => {
    const ext = path.extname(file.originalname);
    if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      return callback(new Error('Only images are allowed'))
    }
    callback(null, true)
  }
}).single('image');

module.exports = (req, res, next) => {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err)
    } else if (err) {
      return res.status(500).json(err)
    }
    // Image optimization with Sharp
    sharp(req.file.path)
      .resize(500)
      .jpeg({ quality: 50 })
      .toFile(
        path.resolve(req.file.destination, 'resized', req.file.filename)
      )
    next()
  })
};
