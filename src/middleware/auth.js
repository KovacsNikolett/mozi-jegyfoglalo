const jwt = require("jsonwebtoken");

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return next();

  const token = header.replace("Bearer ", "");
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
  } catch {
    return res.status(401).json({ message: "Érvénytelen token." });
  }
  next();
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Bejelentkezés szükséges." });

  const token = header.replace("Bearer ", "");
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    next();
  } catch {
    res.status(401).json({ message: "Érvénytelen token." });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin jogosultság szükséges." });
  }
  next();
}

module.exports = { optionalAuth, requireAuth, requireAdmin };
