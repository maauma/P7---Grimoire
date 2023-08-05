// Importation des modules nécessaires
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

// Récupération du secret pour JWT depuis les variables d'environnement
const JWT_SECRET = process.env.JWT_SECRET;

exports.login = (req, res, next) => {
  // On tente de trouver un utilisateur avec l'email reçu dans la requête
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        // Si aucun utilisateur n'est trouvé, on renvoie une erreur
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }

      // Si un utilisateur est trouvé, on compare le mot de passe reçu avec le hash enregistré
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            // Si le mot de passe ne correspond pas, on renvoie une erreur
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }

          // Si le mot de passe est correct, on renvoie l'ID de l'utilisateur et un token JWT
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              JWT_SECRET,
              { expiresIn: '24h' } // Le token expirera après 24h
            )
          });
        })
        .catch(error => {
          // Si une erreur se produit lors de la comparaison des mots de passe, on renvoie une erreur
          res.status(500).json({ error });
        });
    })
    .catch(error => {
      // Si une erreur se produit lors de la recherche de l'utilisateur, on renvoie une erreur
      res.status(500).json({ error });
    });
};
