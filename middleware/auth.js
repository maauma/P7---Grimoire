const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Extraction du token du header d'autorisation
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); // Vérification et décryptage du token
    const userId = decodedToken.userId; // Récupération de l'identifiant de l'utilisateur à partir du token décrypté
    if (req.body.userId && req.body.userId !== userId) {
      throw 'Identifiant utilisateur invalide'; // Comparaison de l'identifiant utilisateur dans le corps de la requête avec celui extrait du token
    } else {
      next(); // Appel de la fonction suivante si l'identifiant utilisateur est valide
    }
  } catch {
    res.status(401).json({
      error: new Error('Requête invalide !') // En cas d'erreur, renvoie une réponse d'erreur avec un message approprié
    });
  }
};
