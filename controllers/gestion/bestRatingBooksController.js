// Importation du modèle Book
const Book = require('../../models/Book');

// Fonction pour obtenir les 3 livres les mieux notés
exports.getBestRatingBooks = (req, res, next) => {
  // Recherche tous les livres, les trie par note moyenne décroissante, et renvoie les 3 premiers
  Book.find().sort({ averageRating: -1 }).limit(3)
    .then(books => res.status(200).json(books))  // Envoie les livres trouvés en tant que réponse
    .catch(error => res.status(400).json({ error }));  // En cas d'erreur, renvoie le message d'erreur
};
