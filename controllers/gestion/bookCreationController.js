// Importation du modèle Book
const Book = require('../../models/Book');

// Fonction pour créer un nouveau livre
exports.createBook = (req, res, next) => {
  // Construction de l'URL de l'image du livre
  const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;

  // Création d'un nouvel objet Book avec les informations reçues et l'URL de l'image
  const book = new Book({
    ...JSON.parse(req.body.book),
    imageUrl: imageUrl,
  });
  
  // Sauvegarde du nouvel objet Book dans la base de données
  book.save()
    .then(() => res.status(201).json({ message: 'Enregistré avec succès !' }))  // Envoie un message de succès en tant que réponse
    .catch(error => {
      console.log(error);  // Affiche l'erreur dans la console
      res.status(400).json({ error });  // Envoie le message d'erreur en tant que réponse
    });
};
