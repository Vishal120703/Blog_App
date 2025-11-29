require('dotenv').config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");

// Import custom modules
const connectDB = require("./config/dbConnect");
const optionalAuth = require("./middleware/optionalAuth");
const homeRouter = require("./routes/home");
const userRoute = require("./routes/users");
const fileData = require("./routes/allFiles");
const aboutPage = require("./routes/about");
const contactPage = require("./routes/contact");
const profileRoute = require("./routes/profile");
const fs = require("fs")

// Initialize app and environment setup
const app = express(); 
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static('public'))


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mySecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 days
  })
);

// Optional auth middleware - makes user available to all views
app.use(optionalAuth);

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Routes
app.use("/", homeRouter);
app.use("/about", aboutPage);
app.use("/contact", contactPage);
app.use("/profile", profileRoute);
app.use("/user", userRoute);
app.use("/user/dashboard", fileData);

// 404 handler
app.use((req, res) => {
  res.status(404).render("404", { user: req.user || null });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
