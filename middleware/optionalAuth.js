const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "SECRET_KEY";

// Optional auth middleware - doesn't redirect, just sets req.user if token is valid
const optionalAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      req.user = null;
    } else {
      req.user = decoded; // store user data (id, username)
    }
    next();
  });
};

module.exports = optionalAuth;


