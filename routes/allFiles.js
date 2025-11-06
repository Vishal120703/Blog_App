const express = require("express")
const router = express.Router();
const logger = require("../middleware/loggerMiddleware")
const Blog = require("../models/postData")

router.get("/post",logger,(req,res)=>{
    res.render("blog_post.ejs")
})
router.post("/post",(req,res)=>{
    res.redirect("/post");
})

module.exports = router