var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");

require('../models/connection');
const User = require('../models/users');
const Session = require('../models/sessions');
const UsedToken = require('../models/usedToken');
const { checkBody } = require('../modules/users');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET
const authenticateJwt = require('../middleware/authorization');
const hashToken = require('../utilitaires/hashToken');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});


router.post('/inscription', async (req, res) => {
  try {
    if (!checkBody(req.body, ['email', 'password'])) {
      return res.json({ result: false, error: 'Missing or empty fields' });
    }

    const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!EMAIL_REGEX.test(req.body.email)) {
      return res.json({ result: false, error: 'Format email invalide' });
    }

    if (req.body.password.length < 8) {
      console.log('mdp court');
      return res.json({
        result: false,
        error: 'Le mot de passe doit contenir au moins 8 caractères'
      });
    }

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.json({ result: false, error: 'Email déjà utilisé' });
    }

    const hash = bcrypt.hashSync(req.body.password, 10);
    const refreshToken = uid2(32);

    const newUser = new User({
      email: req.body.email,
      password: hash,
      created: new Date(),
    });

    await newUser.save();

    const tokenHash = hashToken(refreshToken);
    const userAgent = req.headers['user-agent'] || 'Inconnu';
    const ipAddress = req.ip || req.connection.remoteAddress;

    const session = new Session({
      userId: newUser._id,
      refreshTokenHash: tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: userAgent,
      ipAddress: ipAddress
    });

    await session.save();

    const accessToken = jwt.sign(
      { userId: newUser._id },
      SECRET_KEY,
      { expiresIn: '15m' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      //secure: process.env.NODE_ENV === 'production' or 'true',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/users/refresh'
    });

    res.json({
      result: true,
      accessToken: accessToken,
      expiresIn: 900,
      message: 'Inscription et connexion réussies'
    });

  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ result: false, error: 'Erreur serveur' });
  }
});


router.post('/connexion', async (req, res) => {
  try {
    if (!checkBody(req.body, ['email', 'password'])) {
      return res.json({ result: false, error: 'Missing or empty fields' });
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({
        result: false,
        error: 'Identifiants invalides'
      });
    }

    const validPassword = bcrypt.compareSync(req.body.password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        result: false,
        error: 'Identifiants invalides'
      });
    }

    const refreshToken = uid2(32);
    const tokenHash = hashToken(refreshToken);

    const userAgent = req.headers['user-agent'] || 'Inconnu';
    const ipAddress = req.ip || req.connection.remoteAddress;

    const session = new Session({
      userId: user._id,
      refreshTokenHash: tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: userAgent,
      ipAddress: ipAddress
    });

    await session.save();

    const accessToken = jwt.sign(
      { userId: user._id },
      SECRET_KEY,
      { expiresIn: '15m' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      //secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/users/refresh'
    });

    res.json({
      result: true,
      accessToken: accessToken,
      expiresIn: 900,
      message: 'Connexion réussie'
    });

  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ result: false, error: 'Erreur serveur' });
  }
});


router.post('/refresh', async (req, res) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      return res.status(401).json({
        result: false,
        error: 'Refresh token manquant'
      });
    }

    const oldTokenHash = hashToken(oldRefreshToken);

    const wasUsed = await UsedToken.findOne({ tokenHash: oldTokenHash });
    if (wasUsed) {
      await Session.deleteMany({ userId: wasUsed.userId });
      res.clearCookie('refreshToken', { path: '/users/refresh' });
      
      return res.status(403).json({
        result: false,
        error: 'Sessions ont été révoquées, compromises'
      });
    }

    const session = await Session.findOne({
      refreshTokenHash: oldTokenHash,
      revokedAt: null,
    });

    if (!session) {
      const oldSession = await Session.findOne({
        refreshTokenHash: oldTokenHash
      });
      
      if (oldSession) {
        await UsedToken.create({
          tokenHash: oldTokenHash,
          userId: oldSession.userId
        });
        
        await Session.deleteMany({ userId: oldSession.userId });
        res.clearCookie('refreshToken', { path: '/users/refresh' });
        return res.status(403).json({
          result: false,
          error: 'Session révoquée'
        });
      }
      
      res.clearCookie('refreshToken', { path: '/users/refresh' });
      return res.status(403).json({
        result: false,
        error: 'Token invalide'
      });
    }


    if (session.expiresAt < new Date()) {
      await Session.deleteOne({ _id: session._id });
      res.clearCookie('refreshToken', { path: '/users/refresh' });
      return res.status(403).json({
        result: false,
        error: 'Session expirée'
      });
    }

    const newRefreshToken = uid2(32);
    const newTokenHash = hashToken(newRefreshToken);

    await UsedToken.create({
      tokenHash: oldTokenHash,
      userId: session.userId
    });

    session.refreshTokenHash = newTokenHash;
    session.lastUsedAt = new Date();
    await session.save();

    const newAccessToken = jwt.sign(
      { userId: session.userId._id },
      SECRET_KEY,
      { expiresIn: '15m' }
    );

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: false,
      //secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/users/refresh'
    });

    res.json({
      result: true,
      accessToken: newAccessToken,
      expiresIn: 900
    });

  } catch (error) {
    console.error('Erreur refresh:', error);
    res.status(500).json({
      result: false,
      error: 'Erreur serveur'
    });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.json({ result: true, message: 'Déjà déconnecté' });
    }

    const tokenHash = hashToken(refreshToken);
    
    const session = await Session.findOne({ refreshTokenHash: tokenHash });
    
    if (session) {
      console.log(`Déconnexion ${session._id} pour utilisateur ${session.userId}`);
      
      await Session.deleteOne({ _id: session._id });
    }

    res.clearCookie('refreshToken', { path: '/users/refresh' });
    res.json({ result: true, message: 'Déconnexion réussie' });

  } catch (error) {
    console.error('Erreur logout:', error);
    res.status(500).json({ result: false, error: 'Erreur serveur' });
  }
});


router.get('/sessions', authenticateJwt, async (req, res) => {
  try {
    const sessions = await Session.find({
      userId: req.user.userId,
      revokedAt: null,
      expiresAt: { $gt: new Date() }
    }).select('-refreshTokenHash');

    const currentToken = req.cookies.refreshToken;
    const currentTokenHash = currentToken ? hashToken(currentToken) : null;

    res.json({
      result: true,
      sessions: sessions.map(s => ({
        id: s._id, expiresAt: s.expiresAt, createdAt: s.createdAt, lastUsedAt: s.lastUsedAt, userAgent: s.userAgent, ipAddress: s.ipAddress, isCurrent: s.refreshTokenHash === currentTokenHash
      }))
    });

  } catch (error) {
    res.status(500).json({ result: false, error: 'Erreur serveur' });
  }
});


router.get('/profil', authenticateJwt, (req, res) => {

  User.findById(req.user.userId)
    .then(user => {
      if (!user) {
        return res.status(404).json({
          result: false,
          error: 'Utilisateur introuvable'
        });
      }

      res.json({
        result: true,
        user: { id: user._id, email: user.email }
      });
    })
    .catch(err => {
      res.status(500).json({ result: false, error: 'Erreur serveur' });
    });
});

module.exports = router;
