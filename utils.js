const crypto = require("crypto");

const createHash = (userId) => {
  // Hash by the day. Let's hope nobody does this near midnight.
  const salt = Date.now() / (24 * 60 * 60);
  const hash = Number.parseInt(userId) + salt;
  return crypto.createHash("md5").update(hash.toString()).digest("hex");
};

const getAccessCodeUrl = (accessCode) => {
  return `https://guya.cubari.moe/pages/tss-access-code/?c=${accessCode}`;
};

module.exports = {
  createHash,
  getAccessCodeUrl,
};
