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

router.post('/:id/rating', auth, (req, res, next) => {
  const rating = Number(req.body.rating);

  if (isNaN(rating) || rating < 0 || rating > 5) {
    return res.status(400).json({ error: 'Rating should be a number between 0 and 5.' });
  }

  const userRating = {
    userId: req.body.userId,
    grade: rating // Change 'rating' to 'grade'
  };

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        throw new Error('Book not found');
      }

      if (book.ratings.find(r => r.userId === userRating.userId)) {
        throw new Error('User has already rated this book');
      }

      book.ratings.push(userRating);
      
      // Add a condition to prevent division by zero
      if (book.ratings.length > 0) {
        book.averageRating =
          book.ratings.reduce((acc, cur) => acc + cur.grade, 0) / book.ratings.length; // Change 'cur.rating' to 'cur.grade'
      } else {
        book.averageRating = 0;
      }

      return book.save();
    })
    .then((book) => res.status(200).json(book)) // Pass 'book' as a parameter here
    .catch(error => {
      console.log(error);
      res.status(500).json({ error: error.message });
    });
});




router.put('/:id', auth, (req, res, next) => {
  console.log('Requête reçue pour mettre à jour un livre :', req.body);

  const bookId = req.params.id;
  let bookObject;

  if (req.body.book) {
    bookObject = JSON.parse(req.body.book);
  } else {
    bookObject = { ...req.body };
  }

  if (req.file) {
    bookObject.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
  }

  if (!req.file) {
    updateBook(bookId, bookObject, res);
  } else {
    multer(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(500).json(err);
      } else if (err) {
        return res.status(500).json(err);
      }
      updateBook(bookId, bookObject, res);
    });
  }
});

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
