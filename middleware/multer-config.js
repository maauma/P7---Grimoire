// Importation des modules nécessaires
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');

// Configuration du stockage des fichiers téléchargés avec multer
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    // Spécifie le dossier de destination des fichiers téléchargés
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    // Renomme le fichier en remplaçant les espaces par des underscores
    const name = file.originalname.split(' ').join('_');
    // Récupère l'extension du fichier
    const extension = path.extname(file.originalname);
    // Génère un nom de fichier unique en ajoutant la date actuelle
    callback(null, name + Date.now() + extension);
  }
});

// Configuration de multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limite la taille des fichiers à 1 Mo
  fileFilter: (req, file, callback) => {
    // Récupère l'extension du fichier
    const ext = path.extname(file.originalname);
    // Vérifie si le fichier est une image
    if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      return callback(new Error('Seules les images sont autorisées'));
    }
    callback(null, true);
  }
}).single('image'); // Accepte un seul fichier du champ 'image'

// Exportation d'un middleware pour le téléchargement et l'optimisation d'images
module.exports = (req, res, next) => {
  upload(req, res, function(err) {
    // Gestion des erreurs liées à Multer
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    }
    // Gestion des autres erreurs
    else if (err) {
      return res.status(500).json(err);
    }
    // Optimisation de l'image avec Sharp
    sharp(req.file.path)
      .resize(500) // Redimensionne l'image à une largeur de 500 pixels (la hauteur est ajustée proportionnellement)
      .jpeg({ quality: 50 }) // Convertit l'image en format JPEG avec une qualité de 50%
      .toFile(
        // Enregistre l'image redimensionnée dans le dossier "resized"
        path.resolve(req.file.destination, 'resized', req.file.filename)
      );
    next(); // Appel de la fonction suivante
  });
};
