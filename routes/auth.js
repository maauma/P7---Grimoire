// Importation des modules nécessaires
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Récupération de la clé secrète depuis les variables d'environnement
const JWT_SECRET = process.env.JWT_SECRET;

// Route d'inscription
router.post('/signup', (req, res, next) => {
  // Hachage du mot de passe avec bcrypt
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      // Création du nouvel utilisateur avec l'email reçu et le mot de passe haché
      const user = new User({
        email: req.body.email,
        password: hash
      });
      // Sauvegarde du nouvel utilisateur
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
});

// Route de connexion
router.post('/login', (req, res, next) => {
  // On tente de trouver l'utilisateur avec l'email reçu
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              JWT_SECRET, // Utilisation de la clé secrète de la variable d'environnement
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
});

// Exportation du routeur
module.exports = router;
