const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  refreshTokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true,default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  createdAt: { type: Date, default: Date.now },
  lastUsedAt: { type: Date, default: Date.now },
  userAgent: { type: String, default: 'Inconnu' },
  ipAddress: { type: String, default: 'Inconnue' },
  revokedAt: { type: Date, default: null }
});

sessionSchema.index({ refreshTokenHash: 1 });
sessionSchema.index({ userId: 1, revokedAt: 1 });

sessionSchema.methods.isValid = function() {
  return !this.revokedAt && this.expiresAt > new Date();
};

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;