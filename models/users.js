const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  email: String,
  password: String,
  token: String,
  created: { type: Date, default: Date.now }
});

const User = mongoose.model('users', userSchema);

module.exports = User;
