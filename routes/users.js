var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");

require('../models/connection');
const User = require('../models/users');
const { checkBody } = require('../modules/users');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET

/* GET users listing. */
router.get('/', function(req, res, next) {
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

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.json({ result: false, error: 'Email déjà utilisé' });
    }

    const hash = bcrypt.hashSync(req.body.password, 10);
    const refreshToken = uid2(32);
    
    const newUser = new User({
      email: req.body.email,
      password: hash,
      token: refreshToken,
      created: new Date(),
    });

    await newUser.save();
    
    const accessToken = jwt.sign(
      { userId: newUser._id },
      SECRET_KEY,
      { expiresIn: '15m' }
    );

    res.json({ 
      result: true,
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresIn: 900,
      message: 'Inscription et connexion réussies'
    });

  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ result: false, error: 'Erreur serveur' });
  }
});

module.exports = router;
