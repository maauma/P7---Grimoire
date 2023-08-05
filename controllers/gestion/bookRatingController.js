// Importation du modèle Book
const Book = require('../../models/Book');

// Fonction pour noter un livre
exports.rateBook = (req, res, next) => {
  // Récupère la note de l'utilisateur
  const rating = Number(req.body.rating);
  // Vérifie que la note est un nombre entre 0 et 5
  if (isNaN(rating) || rating < 0 || rating > 5) {
    return res.status(400).json({ error: 'La note doit être un nombre entre 0 et 5.' });
  }

  // Crée un objet avec l'ID de l'utilisateur et sa note
  const userRating = {
    userId: req.body.userId,
    grade: rating
  };

  // Recherche le livre par son ID
  Book.findOne({ _id: req.params.id })
    .then(book => {
      // Vérifie si l'utilisateur a déjà noté ce livre
      if (book.ratings.find(r => r.userId === userRating.userId)) {
        throw new Error('L\'utilisateur a déjà noté ce livre');
      }

      // Ajoute la note de l'utilisateur aux notes du livre
      book.ratings.push(userRating);

      // Calcule la note moyenne du livre
      if (book.ratings.length > 0) {
        book.averageRating = Math.round(book.ratings.reduce((acc, cur) => acc + cur.grade, 0) / book.ratings.length);
      } else {
        book.averageRating = 0;
      }

      // Sauvegarde le livre avec sa nouvelle note moyenne
      return book.save();
    })
    .then((book) => res.status(200).json(book))
    .catch(error => res.status(500).json({ error: error.message }));
};
