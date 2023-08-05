// Importation des modules nécessaires
const bcrypt = require('bcrypt');
const User = require('../../models/User');
const emailValidator = require('email-validator');
const PasswordValidator = require('password-validator');

// Création d'un schéma de validation du mot de passe
const passwordSchema = new PasswordValidator();
passwordSchema
  .is().min(6)  // Le mot de passe doit avoir au moins 6 caractères
  .is().max(100)  // Le mot de passe doit avoir au plus 100 caractères
  .has().uppercase()  // Le mot de passe doit contenir au moins une majuscule
  .has().symbols()  // Le mot de passe doit contenir au moins un symbole
  .has().not().spaces();  // Le mot de passe ne doit pas contenir d'espaces

exports.signup = (req, res, next) => {
  // Extraction de l'email et du mot de passe de la requête
  const email = req.body.email;
  const password = req.body.password;

  // Vérification du format de l'email
  if (!emailValidator.validate(email)) {
    return res.status(400).json({ error: 'Format de l\'email invalide!' });
  }

  // Vérification du format du mot de passe
  if (!passwordSchema.validate(password)) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères, une majuscule et un caractère spécial!' });
  }

  // Hachage du mot de passe avec bcrypt
  bcrypt.hash(password, 10)
    .then(hash => {
      // Création du nouvel utilisateur avec l'email reçu et le mot de passe haché
      const user = new User({ email, password: hash });

      // Sauvegarde du nouvel utilisateur
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};
