const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  token: String,
  email: String,
  password: String,
  created: { type: Date, default: Date.now }
});

const User = mongoose.model('users', userSchema);

module.exports = User;
