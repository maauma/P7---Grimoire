const Book = require('../../models/Book');

exports.createBook = (req, res, next) => {
  console.log(req.protocol, req.get('host'), req.file.filename); // Ajoutez cette ligne avant la création de imageUrl
  const book = new Book({
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  });
  console.log(book.imageUrl); // Ajoutez cette ligne après la création de imageUrl
  
  book.save()
    .then(() => res.status(201).json({ message: 'Enregistré avec succès !' }))
    .catch(error => {
      console.log(error); // Ajoutez cette ligne
      res.status(400).json({ error });
    });
};
