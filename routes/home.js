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

    // Initialize likedBy if it doesn't exist
    const likedBy = blog.likedBy || [];

    if (likedBy.includes(user)) {
      blog.likedBy = likedBy.filter(item => item !== user);
      console.log("User unliked this post");
    } else {
      blog.likedBy.push(user);
      console.log("User liked this post");
    }
    blog.likes = blog.likedBy.length

    await blog.save();
    res.redirect(`/post/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
router.post("/post/:id/comment",logger,async(req,res)=>{
  try{
    const blog = await Blog.findById(req.params.id);
    const user = req.user.username;
    const{comment}= await req.body;
    console.log(user)
    console.log(comment)
    blog.comments.push({
      user:user,
      text:comment
    })

    await blog.save()
  }
  catch(err){
    console.error(err);
    res.status(500).send("Server Error");
  }
  res.redirect(`/post/${req.params.id}`)

})

module.exports = router;
