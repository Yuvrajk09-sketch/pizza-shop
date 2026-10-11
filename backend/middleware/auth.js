const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ detail: "Not authenticated." });

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return res.status(500).json({ detail: "Server misconfiguration: JWT_SECRET missing." });

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.status(401).json({ detail: "Invalid token." });
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (!req.user || !req.user.is_admin) {
      return res.status(403).json({ detail: "Admin privileges required." });
    }
    next();
  });
}
module.exports = { authenticateToken, requireAdmin };
