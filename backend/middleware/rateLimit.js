const rateLimit = require('express-rate-limit');

const authRoutesLimite = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { result: false, error: 'Trop de tentatives de routes, réessayer dans une minute.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  }
});

const refreshLimite = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { result: false, error: "Trop de tentatives de refresh, réessayer dans une minute." }
});

const registerLimite = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { result: false, error: "Trop de tentatives d'inscription, réessayer dans ne heure." }
});

module.exports = { authRoutesLimite, refreshLimite, registerLimite };