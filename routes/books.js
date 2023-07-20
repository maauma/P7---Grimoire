const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const Book = require('../models/Book');

// Récupérer tous les livres
router.get('/', (req, res, next) => {
  Book.find()
    .then(books => {
      console.log('Récupération de tous les livres :', books);
      res.status(200).json(books);
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des livres :', error);
      res.status(400).json({ error });
    });
});

// Récupérer un livre par son ID
router.get('/:id', (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book) {
        console.log('Récupération du livre :', book);
        res.status(200).json(book);
      } else {
        console.log('Livre introuvable');
        res.status(404).json({ error: 'Livre introuvable' });
      }
    })
    .catch(error => {
      console.error('Erreur lors de la récupération du livre :', error);
      res.status(500).json({ error });
    });
});

// Créer un nouveau livre
router.post('/', auth, multer, (req, res, next) => {
  console.log('Requête reçue pour créer un livre :', req.body);

  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;

  console.log('Objet livre analysé :', bookObject);

  const book = new Book({
    ...bookObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  book.save()
    .then(() => {
      console.log('Livre enregistré avec succès');
      res.status(201).json({ message: 'Livre enregistré !' });
    })
    .catch(error => {
      console.error('Erreur lors de l\'enregistrement du livre :', error);
      res.status(400).json({ error });
    });
});

// Mettre à jour un livre
router.put('/:id', auth, multer, (req, res, next) => {
  console.log('Requête reçue pour mettre à jour un livre :', req.body);

  const bookId = req.params.id;
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;

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
});

// Supprimer un livre
router.delete('/:id', auth, (req, res, next) => {
  console.log('Requête reçue pour supprimer un livre :', req.params.id);

  const bookId = req.params.id;

  Book.findByIdAndRemove(bookId)
    .then(deletedBook => {
      if (deletedBook) {
        console.log('Livre supprimé avec succès :', deletedBook);
        res.status(200).json({ message: 'Livre supprimé avec succès' });
      } else {
        console.log('Livre introuvable');
        res.status(404).json({ error: 'Livre introuvable' });
      }
    })
    .catch(error => {
      console.error('Erreur lors de la suppression du livre :', error);
      res.status(500).json({ error });
    });
});

// Ajouter une note à un livre
router.post('/:id/rating', auth, (req, res, next) => {
  console.log('Requête reçue pour ajouter une note à un livre :', req.body);

  const bookId = req.params.id;
  const rating = req.body.rating;

  Book.findByIdAndUpdate(bookId, { $push: { ratings: rating } }, { new: true })
    .then(updatedBook => {
      if (updatedBook) {
        console.log('Note ajoutée au livre avec succès :', updatedBook);
        res.status(200).json(updatedBook);
      } else {
        console.log('Livre introuvable');
        res.status(404).json({ error: 'Livre introuvable' });
      }
    })
    .catch(error => {
      console.error('Erreur lors de l\'ajout de la note au livre :', error);
      res.status(500).json({ error });
    });
});

module.exports = router;
