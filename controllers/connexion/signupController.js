const bcrypt = require('bcrypt');
const User = require('../../models/User');
const emailValidator = require('email-validator');
const PasswordValidator = require('password-validator');

const passwordSchema = new PasswordValidator();
passwordSchema
  .is().min(6)                                    
  .is().max(100)                                  
  .has().uppercase()                              
  .has().symbols()                                
  .has().not().spaces();                          

exports.signup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!emailValidator.validate(email)) {
    return res.status(400).json({ error: 'Format de l\'email invalide!' });
  }

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
