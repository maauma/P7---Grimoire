// Importation des modules nécessaires
const Book = require('../../models/Book');
const fs = require('fs');
const path = require('path');

// Fonction pour mettre à jour un livre
exports.updateBook = (req, res, next) => {
  const bookId = req.params.id; // Récupération de l'ID du livre

  // Recherche du livre dans la base de données
  Book.findById(bookId).then(oldBook => {
    let oldFilename = null;
    // Si le livre a une image, récupération du nom de fichier de l'ancienne image
    if (oldBook && oldBook.imageUrl) {
      oldFilename = oldBook.imageUrl.split('/images/')[1];
    }

    // Création de l'objet livre à partir des données reçues
    const bookObject = req.body.book ? JSON.parse(req.body.book) : { ...req.body };

    // Si une nouvelle image est fournie, mise à jour de l'URL de l'image
    if (req.file) {
      bookObject.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
    }

    // Mise à jour du livre dans la base de données
    Book.findByIdAndUpdate(bookId, { ...bookObject }, { new: true })
      .then(updatedBook => {
        if (updatedBook) {
          res.status(200).json(updatedBook);

          // Si une ancienne image existe et qu'une nouvelle image a été téléchargée, suppression de l'ancienne image
          if (oldFilename && req.file) {
            const filepath = path.resolve(__dirname, '../../images', oldFilename);
            fs.unlink(filepath, (err) => {
              if (err) {
                console.error(err);
              } else {
                console.log('Old image file deleted');
              }
            });
          }
        } else {
          res.status(404).json({ error: 'Book not found' });
        }
      })
      .catch(error => res.status(500).json({ error }));
  });
};
