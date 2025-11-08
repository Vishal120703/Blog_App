const express = require("express")
const router = express.Router();
const Blog = require("../models/postData")

router.get("/",async(req,res)=>{
    const blogs = await Blog.find();
    res.render("index.ejs",{blogs})
})

module.exports = router;
