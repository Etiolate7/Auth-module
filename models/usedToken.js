const mongoose = require('mongoose');

const usedTokenSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  usedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
});

usedTokenSchema.index({ tokenHash: 1 });
usedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const UsedToken = mongoose.model('UsedToken', usedTokenSchema);
module.exports = UsedToken;