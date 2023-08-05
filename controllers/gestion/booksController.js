// Importation du modèle Book
const Book = require('../../models/Book');

// Fonction pour obtenir tous les livres
exports.getAllBooks = (req, res, next) => {
  // Recherche tous les livres dans la base de données
  Book.find()
    .then(books => res.status(200).json(books)) // Retourne tous les livres
    .catch(error => res.status(400).json({ error })); // En cas d'erreur, retourne l'erreur
};

// Fonction pour obtenir un livre par son ID
exports.getBookById = (req, res, next) => {
  // Recherche le livre par son ID
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book)) // Retourne le livre
    .catch(error => res.status(404).json({ error })); // En cas d'erreur, retourne l'erreur
};
