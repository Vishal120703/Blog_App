const jwt = require("jsonwebtoken");
const SECRET_KEY = "SECRET_KEY"; // same as used during login

const logger = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/user/login");
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      console.log("Invalid or expired token:", err.message);
      return res.redirect("/user/login");
    }

    req.user = decoded; // store user data (id, username)
    next();
  });
};

module.exports = logger;
