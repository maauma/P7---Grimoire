const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const bestRatingBooksController = require('../controllers/gestion/bestRatingBooksController');
const booksController = require('../controllers/gestion/booksController');
const bookCreationController = require('../controllers/gestion/bookCreationController');
const bookDeletionController = require('../controllers/gestion/bookDeletionController');
const bookRatingController = require('../controllers/gestion/bookRatingController');
const bookUpdateController = require('../controllers/gestion/bookUpdateController');

router.get('/bestrating', bestRatingBooksController.getBestRatingBooks);
router.get('/', booksController.getAllBooks);
router.get('/:id', booksController.getBookById);
router.post('/', auth, multer, bookCreationController.createBook);
router.delete('/:id', auth, bookDeletionController.deleteBook);
router.post('/:id/rating', auth, bookRatingController.rateBook);
router.put('/:id', auth, multer, bookUpdateController.updateBook);

module.exports = router;
