// Importation des modules nécessaires
const Book = require('../../models/Book');
const fs = require('fs');

// Fonction pour mettre à jour un livre
exports.updateBook = (req, res, next) => {
  // Récupère l'ID du livre à partir des paramètres de la requête
  const bookId = req.params.id;

  // Recherche le livre par son ID
  Book.findById(bookId).then(oldBook => {
    let oldFilename = null;
    // Si le livre existe et a une image, récupère le nom du fichier de l'image
    if (oldBook && oldBook.imageUrl) {
      oldFilename = oldBook.imageUrl.split('/images/')[1];
    }

    // Construit l'objet du livre avec les données reçues
    const bookObject = req.body.book ? JSON.parse(req.body.book) : { ...req.body };

    // Si un fichier est inclus dans la requête, met à jour l'URL de l'image du livre
    if (req.file) {
      bookObject.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
    }

    // Met à jour le livre dans la base de données
    Book.findByIdAndUpdate(bookId, { ...bookObject }, { new: true })
      .then(updatedBook => {
        // Si le livre a été mis à jour, retourne le livre mis à jour
        if (updatedBook) {
          res.status(200).json(updatedBook);

          // Si un ancien fichier existait et qu'un nouveau fichier a été téléchargé, supprime l'ancien fichier
          if (oldFilename && req.file) {
            fs.unlink(`images/${oldFilename}`, () => {
              console.log('Ancienne image supprimée');
            });
          }
        } else {
          // Si le livre n'a pas été trouvé, retourne une erreur
          res.status(404).json({ error: 'Livre introuvable' });
        }
      })
      .catch(error => res.status(500).json({ error })); // En cas d'erreur, retourne l'erreur
  });
};
