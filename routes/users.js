const express = require("express");
const router = express.Router();
const data = require("../models/userData");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../middleware/loggerMiddleware")

// JWT secret key (keep this in .env in real projects)
const SECRET_KEY = "SECRET_KEY"; // replace with process.env.JWT_SECRET in production

// Render login page
router.get("/", (req, res) => {
  res.render("login");
});

router.get("/login", (req, res) => {
  res.render("login");
});

// LOGIN route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user in database
    const user = await data.findOne({ username });
    if (!user) {
      return res.send("Cannot find user");
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.send("Password is incorrect");
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      SECRET_KEY,
      { expiresIn: "7d" } // Token valid for 7 days
    );

    // Store token in cookie
    res.cookie("token", token, {
      httpOnly: true, // prevents XSS
      secure: false,  // use true if HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.redirect("/user/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// SIGNUP route
router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await data.findOne({ username });
    if (existingUser) {
      return res.send("User already exists");
    }

    // Hash password
    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(password, saltRound);

    // Create new user
    const newUser = new data({
      name,
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.send("Signup completed successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// DASHBOARD (protected route)
router.get("/dashboard", logger, (req, res) => {
  res.render("dashboard", { user: req.user }); // use req.user from JWT
});

// LOGOUT route
router.get("/logout", (req, res) => {
  res.clearCookie("token"); // delete the cookie
  res.redirect("/user/login");
});

module.exports = router;
