const Book = require('../../models/Book');

exports.rateBook = (req, res, next) => {
  const rating = Number(req.body.rating);
  if (isNaN(rating) || rating < 0 || rating > 5) {
    return res.status(400).json({ error: 'La note doit être un nombre entre 0 et 5.' });
  }

  const userRating = {
    userId: req.body.userId,
    grade: rating
  };

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.ratings.find(r => r.userId === userRating.userId)) {
        throw new Error('L\'utilisateur a déjà noté ce livre');
      }

      book.ratings.push(userRating);

      if (book.ratings.length > 0) {
        book.averageRating = Math.round(book.ratings.reduce((acc, cur) => acc + cur.grade, 0) / book.ratings.length);
      } else {
        book.averageRating = 0;
      }
      

      return book.save();
    })
    .then((book) => res.status(200).json(book))
    .catch(error => res.status(500).json({ error: error.message }));
};
