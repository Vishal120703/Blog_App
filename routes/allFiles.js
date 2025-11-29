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

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|avif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});


router.get("/post", logger, (req, res) => {
  const errorMessage = req.session.errorMessage;
  req.session.errorMessage = null;
  res.render("blog_post.ejs", {
    author: req.user.username,
    user: req.user,
    errorMessage
  });
});


router.post("/post", upload.single('image'), logger, async (req, res) => {
  try {
    const { title, category, content, excerpt } = req.body;
    
    // Validation
    if (!title || !title.trim()) {
      req.session.errorMessage = "Title is required";
      return res.redirect("/user/dashboard/post");
    }
    if (title.trim().length > 200) {
      req.session.errorMessage = "Title must be less than 200 characters";
      return res.redirect("/user/dashboard/post");
    }
    if (!category || !category.trim()) {
      req.session.errorMessage = "Category is required";
      return res.redirect("/user/dashboard/post");
    }
    if (!content || !content.trim()) {
      req.session.errorMessage = "Content is required";
      return res.redirect("/user/dashboard/post");
    }
    
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const author = req.user.username; 
    const authorId = req.user.id;

    const newBlog = new Blog({
      title: title.trim(),
      category: category.trim(),
      image: imagePath,
      content: content.trim(),
      excerpt: excerpt ? excerpt.trim().substring(0, 300) : "",
      auther: author,
      authorId: authorId,
      date: new Date(),
    });

    await newBlog.save();
    req.session.successMessage = "Blog post created successfully!";
    res.redirect("/user/dashboard");
  } catch (err) {
    console.error(err);
    if (err.message && err.message.includes('image')) {
      req.session.errorMessage = "Invalid image file. Only JPEG, PNG, GIF, WebP, and AVIF are allowed.";
    } else {
      req.session.errorMessage = "Error saving blog post";
    }
    res.redirect("/user/dashboard/post");
  }
});

// Edit post route - GET
router.get("/post/edit/:id", logger, async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) {
      req.session.errorMessage = "Post not found";
      return res.redirect("/user/dashboard");
    }
    
    // Check if user owns this post
    if (post.authorId !== req.user.id) {
      req.session.errorMessage = "You don't have permission to edit this post";
      return res.redirect("/user/dashboard");
    }
    
    const errorMessage = req.session.errorMessage;
    req.session.errorMessage = null;
    
    res.render("edit_post.ejs", { 
      post, 
      author: req.user.username,
      user: req.user,
      errorMessage
    });
  } catch (err) {
    console.error(err);
    req.session.errorMessage = "Error loading post";
    res.redirect("/user/dashboard");
  }
});

// Edit post route - POST
router.post("/post/edit/:id", upload.single('image'), logger, async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) {
      req.session.errorMessage = "Post not found";
      return res.redirect("/user/dashboard");
    }
    
    // Check if user owns this post
    if (post.authorId !== req.user.id) {
      req.session.errorMessage = "You don't have permission to edit this post";
      return res.redirect("/user/dashboard");
    }
    
    const { title, category, content, excerpt } = req.body;
    
    // Validation
    if (!title || !title.trim()) {
      req.session.errorMessage = "Title is required";
      return res.redirect(`/user/dashboard/post/edit/${req.params.id}`);
    }
    if (title.trim().length > 200) {
      req.session.errorMessage = "Title must be less than 200 characters";
      return res.redirect(`/user/dashboard/post/edit/${req.params.id}`);
    }
    if (!category || !category.trim()) {
      req.session.errorMessage = "Category is required";
      return res.redirect(`/user/dashboard/post/edit/${req.params.id}`);
    }
    if (!content || !content.trim()) {
      req.session.errorMessage = "Content is required";
      return res.redirect(`/user/dashboard/post/edit/${req.params.id}`);
    }
    
    let imagePath = post.image; // Keep existing image if no new one uploaded
    
    // If new image uploaded, delete old one and use new
    if (req.file) {
      // Delete old image if exists
      if (post.image) {
        const oldImagePath = path.join(__dirname, '..', post.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imagePath = `/uploads/${req.file.filename}`;
    }
    
    post.title = title.trim();
    post.category = category.trim();
    post.content = content.trim();
    post.excerpt = excerpt ? excerpt.trim().substring(0, 300) : "";
    post.image = imagePath;
    
    await post.save();
    req.session.successMessage = "Post updated successfully!";
    res.redirect("/user/dashboard");
  } catch (err) {
    console.error(err);
    if (err.message && err.message.includes('image')) {
      req.session.errorMessage = "Invalid image file. Only JPEG, PNG, GIF, WebP, and AVIF are allowed.";
    } else {
      req.session.errorMessage = "Error updating post";
    }
    res.redirect("/user/dashboard");
  }
});

// Delete post route
router.delete("/post/delete/:id", logger, async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) {
      return res.json({ success: false, message: "Post not found" });
    }
    
    // Check if user owns this post
    if (post.authorId !== req.user.id) {
      return res.json({ success: false, message: "You don't have permission to delete this post" });
    }
    
    // Delete image if exists
    if (post.image) {
      const imagePath = path.join(__dirname, '..', post.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Error deleting post" });
  }
});

// Get comments for a post (for dashboard)
router.get("/post/comments/:id", logger, async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) {
      return res.json({ success: false, message: "Post not found" });
    }
    
    // Check if user owns this post
    if (post.authorId !== req.user.id) {
      return res.json({ success: false, message: "You don't have permission to view comments for this post" });
    }
    
    res.json({ 
      success: true, 
      comments: post.comments || [] 
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Error loading comments" });
  }
});

// Delete comment from a post
router.delete("/post/comments/:postId/delete/:commentId", logger, async (req, res) => {
  try {
    const post = await Blog.findById(req.params.postId);
    if (!post) {
      return res.json({ success: false, message: "Post not found" });
    }
    
    // Check if user owns this post
    if (post.authorId !== req.user.id) {
      return res.json({ success: false, message: "You don't have permission to delete comments from this post" });
    }
    
    // Find and remove the comment by index
    const commentIndex = parseInt(req.params.commentId);
    
    if (commentIndex >= 0 && commentIndex < post.comments.length) {
      // Use MongoDB's $unset and $pull to remove the comment
      post.comments.splice(commentIndex, 1);
      await post.save();
      res.json({ success: true, message: "Comment deleted successfully" });
    } else {
      res.json({ success: false, message: "Comment not found" });
    }
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Error deleting comment" });
  }
});

module.exports = router;
