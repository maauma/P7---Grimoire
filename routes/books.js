// Importation des modules nécessaires
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const Book = require('../models/Book');

// Route pour obtenir les livres les mieux notés
router.get('/bestrating', (req, res, next) => {
  console.log("Recherche des livres les mieux notés...");
  // On trouve les livres, on les trie par note moyenne (décroissante) et on limite à 5
  Book.find().sort({averageRating: -1}).limit(5)
    .then(books => {
      console.log("Livres les mieux notés: ", books);
      // On renvoie les livres en réponse
      res.status(200).json(books);
    })
    .catch(error => {
      console.log("Erreur lors de la recherche des livres les mieux notés: ", error);
      res.status(400).json({ error });
    });
});

// Route pour obtenir tous les livres
router.get('/', (req, res, next) => {
  // On trouve tous les livres
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
});

// Route pour obtenir un livre par son ID
router.get('/:id', (req, res, next) => {
  // On trouve le livre par son ID
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
});

// Route pour créer un nouveau livre
router.post('/', auth, multer, (req, res, next) => {
  // On crée un nouveau livre avec les données reçues
  const book = new Book({
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  });
  // On sauvegarde le nouveau livre
  book.save()
    .then(() => res.status(201).json({ message: 'Enregistré avec succès !' }))
    .catch(error => res.status(400).json({ error }));
});

// Route pour supprimer un livre par son ID
router.delete('/:id', auth, (req, res, next) => {
  // On supprime le livre par son ID
  Book.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Supprimé !' }))
    .catch(error => res.status(400).json({ error }));
});

// Route pour noter un livre
router.post('/:id/rating', auth, (req, res, next) => {
  const rating = Number(req.body.rating);

  // On vérifie que la note est un nombre entre 0 et 5
  if (isNaN(rating) || rating < 0 || rating > 5) {
    return res.status(400).json({ error: 'La note doit être un nombre entre 0 et 5.' });
  }

  // On crée l'objet de notation de l'utilisateur
  const userRating = {
    userId: req.body.userId,
    grade: rating
  };

  // On trouve le livre par son ID
  Book.findOne({ _id: req.params.id })
    .then(book => {
      // Si le livre n'est pas trouvé, on lance une erreur
      if (!book) {
        throw new Error('Livre non trouvé');
      }

      // Si l'utilisateur a déjà noté ce livre, on lance une erreur
      if (book.ratings.find(r => r.userId === userRating.userId)) {
        throw new Error('L\'utilisateur a déjà noté ce livre');
      }

      // On ajoute la note de l'utilisateur aux notes du livre
      book.ratings.push(userRating);

      // On calcule la note moyenne du livre
      if (book.ratings.length > 0) {
        book.averageRating =
          book.ratings.reduce((acc, cur) => acc + cur.grade, 0) / book.ratings.length;
      } else {
        book.averageRating = 0;
      }

      // On sauvegarde le livre avec la nouvelle note
      return book.save();
    })
    .then((book) => res.status(200).json(book))
    .catch(error => {
      console.log(error);
      res.status(500).json({ error: error.message });
    });
});

// Route pour mettre à jour un livre
router.put('/:id', auth, (req, res, next) => {
  console.log('Requête reçue pour mettre à jour un livre :', req.body);

  const bookId = req.params.id;
  let bookObject;

  // On parse l'objet livre si il est présent dans le corps de la requête
  if (req.body.book) {
    bookObject = JSON.parse(req.body.book);
  } else {
    bookObject = { ...req.body };
  }

  // Si un fichier est présent dans la requête, on met à jour l'URL de l'image du livre
  if (req.file) {
    bookObject.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
  }

  // On met à jour le livre
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

// Fonction pour mettre à jour un livre
function updateBook(bookId, bookObject, res) {
  // On trouve le livre par son ID et on met à jour
  Book.findByIdAndUpdate(bookId, { ...bookObject }, { new: true })
    .then(updatedBook => {
      // Si le livre est trouvé et mis à jour, on renvoie le livre mis à jour
      if (updatedBook) {
        console.log('Livre mis à jour avec succès :', updatedBook);
        res.status(200).json(updatedBook);
      } else {
        // Sinon, on renvoie une erreur
        console.log('Livre introuvable');
        res.status(404).json({ error: 'Livre introuvable' });
      }
    })
    .catch(error => {
      console.error('Erreur lors de la mise à jour du livre :', error);
      res.status(500).json({ error });
    });
}

// Exportation du routeur
module.exports = router;
