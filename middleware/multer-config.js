const multer = require('multer');
const path = require('path');
const sharp = require('sharp');

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images'); // Spécifie le dossier de destination des fichiers téléchargés
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_'); // Renomme le fichier en remplaçant les espaces par des underscores
    const extension = path.extname(file.originalname); // Récupère l'extension du fichier
    callback(null, name + Date.now() + extension); // Génère un nom de fichier unique en ajoutant la date actuelle
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limite la taille des fichiers à 1 Mo
  fileFilter: (req, file, callback) => {
    const ext = path.extname(file.originalname); // Récupère l'extension du fichier
    if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      return callback(new Error('Seules les images sont autorisées')); // Vérifie si le fichier est une image
    }
    callback(null, true);
  }
}).single('image');

module.exports = (req, res, next) => {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err); // Gestion des erreurs liées à Multer
    } else if (err) {
      return res.status(500).json(err); // Gestion des autres erreurs
    }
    // Optimisation de l'image avec Sharp
    sharp(req.file.path)
      .resize(500) // Redimensionne l'image à une largeur de 500 pixels (la hauteur est ajustée proportionnellement)
      .jpeg({ quality: 50 }) // Convertit l'image en format JPEG avec une qualité de 50%
      .toFile(
        path.resolve(req.file.destination, 'resized', req.file.filename) // Enregistre l'image redimensionnée dans le dossier "resized"
      );
    next(); // Appel de la fonction suivante
  });
};
