const Book = require('../../models/Book');
const fs = require('fs');
const path = require('path'); // Add this

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      const filename = book.imageUrl.split('/images/')[1];
      const filepath = path.resolve(__dirname, '../../images', filename); // Add this
      fs.unlink(filepath, (err) => { // Modify this
        if (err) {
          console.log(err);
          return res.status(500).json({ error: err });
        }
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
