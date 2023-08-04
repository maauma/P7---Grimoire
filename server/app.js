// Importer les modules nécessaires
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('../routes/auth');
const bookRoutes = require('../routes/books');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Trop de tentatives de connexion à partir de cette adresse IP. Veuillez réessayer dans 15 minutes.'
});


// Se connecter à MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));

// Activer CORS depuis le client-side
app.use(cors({ origin: 'http://localhost:3000' }));

// Utiliser le Body Parser
app.use(bodyParser.json());

// Servir les fichiers d'images statiques
app.use('/images', express.static(path.join(__dirname, '../images')));

// Utilisation de la limite de taux sur les routes d'authentification
app.use('/api/auth', authLimiter, authRoutes);

// Définir les routes pour les livres
app.use('/api/books', bookRoutes);

// Définir les routes pour les livres
app.use('/api/auth', authRoutes);

// Exporter l'application pour une utilisation dans server.js
module.exports = app;
