const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

const authenticateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      result: false, 
      error: 'Token manquant' 
    });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          result: false, 
          error: 'Token expiré' 
        });
      }
      return res.status(403).json({ 
        result: false, 
        error: 'Token invalide' 
      });
    }

    req.user = decoded;
    next();
  });
};

module.exports = authenticateJwt;