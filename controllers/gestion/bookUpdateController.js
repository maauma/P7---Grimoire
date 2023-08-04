const Book = require('../../models/Book');
const fs = require('fs');

exports.updateBook = (req, res, next) => {
  const bookId = req.params.id;

  Book.findById(bookId).then(oldBook => {
    let oldFilename = null;
    if (oldBook && oldBook.imageUrl) {
      oldFilename = oldBook.imageUrl.split('/images/')[1];
    }

    const bookObject = req.body.book ? JSON.parse(req.body.book) : { ...req.body };

    if (req.file) {
      bookObject.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
    }

    Book.findByIdAndUpdate(bookId, { ...bookObject }, { new: true })
      .then(updatedBook => {
        if (updatedBook) {
          res.status(200).json(updatedBook);

          if (oldFilename && req.file) {
            fs.unlink(`images/${oldFilename}`, () => {
              console.log('Ancienne image supprimée');
            });
          }
        } else {
          res.status(404).json({ error: 'Livre introuvable' });
        }
      })
      .catch(error => res.status(500).json({ error }));
  });
};
