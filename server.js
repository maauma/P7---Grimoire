// Charger les variables d'environnement
require('dotenv').config();

// Importer les modules nécessaires
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const path = require('path');

const app = express();

// Se connecter à MongoDB
mongoose.connect('mongodb+srv://utilisateurtest:mdpdetest@grimoire.fnnalvn.mongodb.net/?retryWrites=true&w=majority', {
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
app.use('/images', express.static(path.join(__dirname, 'images')));

// Définir les routes pour l'authentification
app.use('/api/auth', authRoutes);

// Définir les routes pour les livres
app.use('/api/books', bookRoutes);

// Démarrer le serveur sur le port spécifié dans les variables d'environnement, ou sur le port 4000 par défaut
app.listen(process.env.PORT || 4000, () => console.log(`Le serveur fonctionne sur le port ${process.env.PORT || 4000}`));
