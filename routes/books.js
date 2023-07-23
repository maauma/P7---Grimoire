const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const Book = require('../models/Book');

router.get('/bestrating', (req, res, next) => {
  console.log("Getting best rated books...");
  Book.find().sort({averageRating: -1}).limit(5)
    .then(books => {
      console.log("Best rated books: ", books);
      res.status(200).json(books);
    })
    .catch(error => {
      console.log("Error getting best rated books: ", error);
      res.status(400).json({ error });
    });
});


router.get('/', (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
});


router.get('/:id', (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
});


router.post('/', auth, multer, (req, res, next) => {
  const book = new Book({
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  });
  book.save()
    .then(() => res.status(201).json({ message: 'Saved successfully!' }))
    .catch(error => res.status(400).json({ error }));
});

router.delete('/:id', auth, (req, res, next) => {
  Book.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Deleted!' }))
    .catch(error => res.status(400).json({ error }));
});

// Ajouter une note à un livre
router.post('/:id/rating', auth, (req, res, next) => {
  if (req.body.grade < 1 || req.body.grade > 5) {
    return res.status(400).json({ error: 'Rating should be a number between 1 and 5.' });
  }

  const rating = {
    userId: req.body.userId,
    grade: req.body.grade
  };

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        throw new Error('Book not found');
      }

      if (book.ratings.find(r => r.userId === rating.userId)) {
        throw new Error('User has already rated this book');
      }

      book.ratings.push(rating);
      book.averageRating =
        book.ratings.reduce((acc, cur) => acc + cur.grade, 0) / book.ratings.length;
      return book.save();
    })
    .then(() => res.status(200).json({ message: 'Rating added successfully!' }))
    .catch(error => res.status(500).json({ error: error.message }));
});

// Mettre à jour un livre
router.put('/:id', auth, (req, res, next) => {
  console.log('Requête reçue pour mettre à jour un livre :', req.body);

  const bookId = req.params.id;
  let bookObject;

  if (req.body.book) {
    // Si un livre est fourni en tant que chaîne de caractères JSON, l'analyser
    bookObject = JSON.parse(req.body.book);
  } else {
    // Si aucun livre n'est fourni en tant que chaîne de caractères JSON, utiliser req.body directement
    bookObject = { ...req.body };
  }

  // Si une image est fournie, mettre à jour l'URL de l'image
  if (req.file) {
    bookObject.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
  }

  // Supprimer l'appel au middleware Multer pour cette route si aucune image n'est fournie
  if (!req.file) {
    // Appeler la fonction de mise à jour directement
    updateBook(bookId, bookObject, res);
  } else {
    // Sinon, utiliser le middleware Multer pour gérer l'image et l'optimisation avec Sharp
    multer(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(500).json(err); // Gestion des erreurs liées à Multer
      } else if (err) {
        return res.status(500).json(err); // Gestion des autres erreurs
      }
      // Appeler la fonction de mise à jour une fois l'optimisation terminée
      updateBook(bookId, bookObject, res);
    });
  }
});

// Fonction pour mettre à jour le livre dans la base de données
function updateBook(bookId, bookObject, res) {
  Book.findByIdAndUpdate(bookId, { ...bookObject }, { new: true })
    .then(updatedBook => {
      if (updatedBook) {
        console.log('Livre mis à jour avec succès :', updatedBook);
        res.status(200).json(updatedBook);
      } else {
        console.log('Livre introuvable');
        res.status(404).json({ error: 'Livre introuvable' });
      }
    })
    .catch(error => {
      console.error('Erreur lors de la mise à jour du livre :', error);
      res.status(500).json({ error });
    });
}

module.exports = router;
