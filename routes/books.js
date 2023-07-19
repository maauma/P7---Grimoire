const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const Book = require('../models/Book');

router.get('/', (req, res, next) => {
  Book.find()
    .then(books => {
      console.log('Fetched all books:', books);
      res.status(200).json(books);
    })
    .catch(error => {
      console.error('Error while fetching books:', error);
      res.status(400).json({ error });
    });
});

router.get('/:id', (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book) {
        console.log('Fetched book:', book);
        res.status(200).json(book);
      } else {
        console.log('Book not found');
        res.status(404).json({ error: 'Book not found' });
      }
    })
    .catch(error => {
      console.error('Error while fetching book:', error);
      res.status(500).json({ error });
    });
});

router.post('/', auth, multer, (req, res, next) => {
  console.log('Received request to create a book:', req.body);

  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;

  console.log('Parsed book object:', bookObject);

  const book = new Book({
    ...bookObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  book.save()
    .then(() => {
      console.log('Book saved successfully');
      res.status(201).json({ message: 'Livre enregistré !'});
    })
    .catch(error => {
      console.error('Error while saving the book:', error);
      res.status(400).json({ error });
    });
});

router.put('/:id', auth, multer, (req, res, next) => {
  console.log('Received request to update a book:', req.body);

  // Rest of the code...
});

router.delete('/:id', auth, (req, res, next) => {
  console.log('Received request to delete a book:', req.params.id);

  // Rest of the code...
});

router.post('/:id/rating', auth, (req, res, next) => {
  console.log('Received request to add a rating for a book:', req.body);

  // Rest of the code...
});

module.exports = router;
