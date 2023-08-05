// Importation des modules nécessaires
const multer = require('multer');
const path = require('path');

// Configuration du stockage des fichiers téléchargés avec multer
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    // Spécifie le dossier de destination des fichiers téléchargés
    callback(null, path.join(__dirname, '../images'));
  },

  filename: (req, file, callback) => {
    // Renomme le fichier en remplaçant les espaces par des underscores
    const name = file.originalname.split(' ').join('_').split('.')[0]; // Remove the original extension
    // Génère un nom de fichier unique en ajoutant la date actuelle
    callback(null, name + Date.now() + path.extname(file.originalname)); // Use the original extension
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

module.exports = (req, res, next) => {
  upload(req, res, function(err) {
    // Gestion des erreurs liées à Multer
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        console.log('Le fichier est trop lourd'); // Affiche le message dans la console
      }
      console.log(err);
      return res.status(500).json(err);
    }
    // Gestion des autres erreurs
    else if (err) {
      console.log(err); 
      return res.status(500).json(err);
    }

    // Vérifie si le fichier existe
    if (req.file && req.file.size > 1000000) {
      console.log('Le fichier est trop lourd');
      return res.status(400).json({ message: 'Le fichier est trop lourd' });
    }

    next(); // Appel de la fonction suivante
  });
};
