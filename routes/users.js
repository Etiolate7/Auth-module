var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");

require('../models/connection');
const User = require('../models/users');
const { checkBody } = require('../modules/users');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.post('/inscription', (req, res) => {
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (EMAIL_REGEX.test(req.body.email)) {

          User.findOne({ email: req.body.email }).then(data => {
            if (data === null) {
              const hash = bcrypt.hashSync(req.body.password, 10);
              const newToken = uid2(32);
              const newUser = new User({
                token: newToken,
                email: req.body.email,
                password: hash,
                created: new Date(),
              });

              newUser.save().then(data => {
                res.json({ result: true, token: newToken });
              });

            } else {
              res.json({ result: false, error: 'Utilisateur déjà enregistré' });
            }
          });
        } else {
      res.json({ result: false, error: 'Format email invalide' });
    }
  });

  router.post('/connexion', (req, res) => {
  const newToken = uid2(32);

  if (!checkBody(req.body, ['email', 'password'])) {
    return res.json({ result: false, error: 'Missing or empty fields' });
  }

  User.findOne({ email: req.body.email })
    .then(data => {
      if (!data) {
        return res.json({ result: false, error: 'Utilisateur introuvable' });
      }

      if (!bcrypt.compareSync(req.body.password, data.password)) {
        return res.json({ result: false, error: 'Mot de passe invalide' });
      }


      return User.updateOne(
        { _id: data._id },
        { token: newToken }
      ).then(() => {
        return res.json({
          result: true,
          token: newToken,
        });
      });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ result: false, error: 'Server error' });
    });
});

module.exports = router;
