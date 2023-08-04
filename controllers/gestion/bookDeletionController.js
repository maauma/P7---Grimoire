const Book = require('../../models/Book');
const fs = require('fs');

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      const filename = book.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Supprimé !' }))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(400).json({ error }));
};
