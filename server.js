require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const path = require('path');

const app = express();

// Connect to MongoDB
mongoose
  .connect('mongodb+srv://utilisateurtest:mdpdetest@grimoire.fnnalvn.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(cors({ origin: 'http://localhost:3000' }));  // Enable CORS from client-side
app.use(bodyParser.json());  // Body Parser
app.use('/images', express.static(path.join(__dirname, 'images')));  // Serve the static image files

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

app.listen(process.env.PORT || 4000, () => console.log(`Server is running on port ${process.env.PORT || 4000}`));
