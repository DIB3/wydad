const jwt = require('jsonwebtoken');

// Middleware d'authentification optionnelle
// Tente de valider le token s'il existe, mais continue même s'il n'y en a pas
module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt');
    req.user = decoded;
    next();
  } catch (err) {
    req.user = null;
    next();
  }
};

