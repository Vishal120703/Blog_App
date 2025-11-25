const express = require("express")
const router = express.Router();
const Blog = require("../models/postData")
const logger = require("../middleware/loggerMiddleware")

router.get("/",async(req,res)=>{
    const blogs = await Blog.find();
    res.render("index.ejs",{blogs})
})

router.get("/post/:id",logger,async(req,res)=>{
    await Blog.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    const blog = await Blog.findById(req.params.id);
    res.render("single_post.ejs",{blog})
})


router.post("/post/:id/like", logger, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    const user = req.user.username;

    if (!blog.likedBy.includes(user)) {
      blog.likedBy.push(user);
    } else {
      blog.likedBy = blog.likedBy.filter(u => u !== user);
    }

    blog.likes = blog.likedBy.length;
    await blog.save();

    // IMPORTANT: return JSON instead of redirect
    res.json({
      success: true,
      likes: blog.likes,
      liked: blog.likedBy.includes(user)
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

router.post("/post/:id/comment", logger, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    const user = req.user.username;
    const { comment } = req.body;

    const newComment = {
      user: user,
      text: comment
    };

    blog.comments.push(newComment);
    await blog.save();

    // Send JSON instead of redirect
    res.json({
      success: true,
      comment: newComment
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


module.exports = router;
