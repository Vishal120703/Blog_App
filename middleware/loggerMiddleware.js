const jwt = require("jsonwebtoken")

const SECRET_KEY = "SECRET_KEY";
const logger = (req, res, next) => {
  const token = req.cookies.token; // Get token from cookies
  if (!token) {
    return res.redirect("/user/login"); // No token → redirect to login
  }

  // Verify token
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      console.log("Invalid or expired token:", err.message);
      return res.redirect("/user/login");
    }

    req.user = decoded; // Store decoded user info
    next(); // Move to next route
  });
};

module.exports = logger