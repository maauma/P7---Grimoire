const mongoose = require('mongoose');


const bookSchema = mongoose.Schema({
  userId: { type: String, required: true }, // Identifiant de l'utilisateur lié au livre
  title: { type: String, required: true }, // Titre du livre
  author: { type: String, required: true }, // Auteur du livre
  imageUrl: { type: String, required: true }, // URL de l'image du livre
  year: { type: Number, required: true }, // Année de publication du livre
  genre: { type: String, required: true }, // Genre du livre
  ratings: [
    {
      userId: { type: String, required: true }, // Identifiant de l'utilisateur qui a noté le livre
      grade: { type: Number, required: true }, // Note attribuée au livre par l'utilisateur
    }
  ],
  averageRating: { type: Number, required: true }, // Note moyenne du livre
});

module.exports = mongoose.model('Book', bookSchema);
