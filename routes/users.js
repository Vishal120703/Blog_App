const express = require("express");
const router = express.Router();
const data = require("../models/userData");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../middleware/loggerMiddleware")

// JWT secret key
const SECRET_KEY = process.env.JWT_SECRET || "SECRET_KEY";

// Render login page
router.get("/", (req, res) => {
  // If already logged in, redirect to dashboard
  if (req.user) {
    return res.redirect("/user/dashboard");
  }
  res.render("login", { user: null });
});

router.get("/login", (req, res) => {
  // If already logged in, redirect to dashboard
  if (req.user) {
    return res.redirect("/user/dashboard");
  }
  const successMessage = req.session.successMessage;
  req.session.successMessage = null;
  res.render("login", { user: null, successMessage });
});

// LOGIN route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user in database
    const user = await data.findOne({ username });
    if (!user) {
      return res.render("login", { 
        user: null, 
        errorMessage: "Cannot find user",
        username: username 
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("login", { 
        user: null, 
        errorMessage: "Password is incorrect",
        username: username 
      });
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
  // If already logged in, redirect to dashboard
  if (req.user) {
    return res.redirect("/user/dashboard");
  }
  res.render("signup", { user: null });
});

router.post("/signup", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // Validation
    if (!name || !username || !email || !password) {
      return res.render("signup", { 
        user: null, 
        errorMessage: "All fields are required",
        formData: { name: name || '', username: username || '', email: email || '' } 
      });
    }

    if (password.length < 6) {
      return res.render("signup", { 
        user: null, 
        errorMessage: "Password must be at least 6 characters",
        formData: { name, username, email } 
      });
    }

    // Check if user already exists
    const existingUser = await data.findOne({ username });
    if (existingUser) {
      return res.render("signup", { 
        user: null, 
        errorMessage: "Username already exists",
        formData: { name, username, email } 
      });
    }

    // Check if email already exists
    const existingEmail = await data.findOne({ email });
    if (existingEmail) {
      return res.render("signup", { 
        user: null, 
        errorMessage: "Email already exists",
        formData: { name, username, email } 
      });
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
    req.session.successMessage = "Signup completed successfully! Please login.";
    res.redirect("/user/login");
  } catch (error) {
    console.error(error);
    res.render("signup", { 
      user: null, 
      errorMessage: "Server error. Please try again.",
      formData: { name, username, email } 
    });
  }
});

// DASHBOARD (protected route)
router.get("/dashboard", logger, async (req, res) => {
  try {
    const Blog = require("../models/postData");
    const userPosts = await Blog.find({ authorId: req.user.id }).sort({ date: -1 });
    const successMessage = req.session.successMessage;
    const errorMessage = req.session.errorMessage;
    req.session.successMessage = null;
    req.session.errorMessage = null;
    res.render("dashboard", { 
      user: req.user, 
      posts: userPosts,
      successMessage,
      errorMessage
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading dashboard");
  }
});

// LOGOUT route
router.get("/logout", (req, res) => {
  res.clearCookie("token"); // delete the cookie
  res.redirect("/user/login");
});

module.exports = router;
