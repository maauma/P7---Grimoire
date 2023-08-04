const Book = require('../../models/Book');

exports.createBook = (req, res, next) => {
  const book = new Book({
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  });
  book.save()
    .then(() => res.status(201).json({ message: 'Enregistré avec succès !' }))
    .catch(error => res.status(400).json({ error }));
};
