// Importation du module jsonwebtoken
const jwt = require('jsonwebtoken');

// Exportation d'un middleware pour l'authentification basée sur les tokens JWT
module.exports = (req, res, next) => {
  try {
    // Extraction du token du header d'autorisation
    const token = req.headers.authorization.split(' ')[1];
    // Vérification et décryptage du token
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    // Récupération de l'identifiant de l'utilisateur à partir du token décrypté
    const userId = decodedToken.userId;
    // Comparaison de l'identifiant utilisateur dans le corps de la requête avec celui extrait du token
    if (req.body.userId && req.body.userId !== userId) {
      throw 'Identifiant utilisateur invalide';
    } else {
      // Appel de la fonction suivante si l'identifiant utilisateur est valide
      next();
    }
  } catch {
    // En cas d'erreur, renvoie une réponse d'erreur avec un message approprié
    res.status(401).json({
      error: new Error('Requête invalide !')
    });
  }
};
