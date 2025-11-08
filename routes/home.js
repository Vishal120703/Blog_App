const express = require("express")
const router = express.Router();
const Blog = require("../models/postData")
const logger = require("../middleware/loggerMiddleware")

router.get("/",async(req,res)=>{
    const blogs = await Blog.find();
    res.render("index.ejs",{blogs})
})
router.get("/post/:id",logger,async(req,res)=>{
    const blog = await Blog.findById(req.params.id);
    res.render("single_post.ejs",{blog})
})

module.exports = router;
