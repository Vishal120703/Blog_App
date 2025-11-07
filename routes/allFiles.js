const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const logger = require("../middleware/loggerMiddleware"); 
const Blog = require("../models/postData");


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });


router.get("/post", logger, (req, res) => {
  
  res.render("blog_post.ejs",{author:req.user.username});
});


router.post("/post", upload.none(), logger, async (req, res) => {
  try {
    const { title, category, content } = req.body;
    const author = req.user.username; 
    console.log("Author:", author);

    const newBlog = new Blog({
      title,
      category,
      content,
      author,
      date: new Date(),
    });
    console.log(newBlog)

    // await newBlog.save();
    res.redirect("/user/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving blog post");
  }
});

module.exports = router;
