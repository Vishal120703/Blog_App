const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const logger = require("../middleware/loggerMiddleware"); 
const Blog = require("../models/postData");
const fs = require("fs")


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });


router.get("/post", logger, (req, res) => {
  
  res.render("blog_post.ejs",{author:req.user.username});
});


router.post("/post", upload.single('image'), logger, async (req, res) => {
  try {
    const { title, category, content } = req.body;
    const imagePath =  req.file ? `/uploads/${req.file.filename}` : null
    const author = req.user.username; 

    const newBlog = new Blog({
      title:title,
      category:category,
      image:imagePath,
      content:content,
      auther:author,
      date: new Date(),
    });

    await newBlog.save();
    res.redirect("/user/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving blog post");
  }
});

module.exports = router;
