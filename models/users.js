const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  token: { type: String, default: null },
  created: { type: Date, default: Date.now }
});

const User = mongoose.model('users', userSchema);

module.exports = User;
