// Importation des modules nécessaires
const Book = require('../../models/Book');
const fs = require('fs');
const path = require('path');

// Fonction pour supprimer un livre
exports.deleteBook = (req, res, next) => {
  // Recherche le livre par son ID
  Book.findOne({ _id: req.params.id })
    .then(book => {
      // Extrait le nom du fichier à partir de l'URL de l'image
      const filename = book.imageUrl.split('/images/')[1];
      // Construit le chemin absolu du fichier
      const filepath = path.resolve(__dirname, '../../images', filename);
      // Supprime le fichier de l'image du livre
      fs.unlink(filepath, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: err });
        }
        // Supprime le livre de la base de données
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Supprimé !' }))
          .catch(error => {
            console.log(error);
            res.status(400).json({ error });
          });
      });
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ error });
    });
};
