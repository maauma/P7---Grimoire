// Charger les variables d'environnement
require('dotenv').config();

// Importer l'application depuis app.js
const app = require('./app');

// Démarrer le serveur sur le port spécifié dans les variables d'environnement, ou sur le port 4000 par défaut
app.listen(process.env.PORT || 4000, () => console.log(`Le serveur fonctionne sur le port ${process.env.PORT || 4000}`));
