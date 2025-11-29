const express = require("express")
const router = express.Router();
const Blog = require("../models/postData")
const logger = require("../middleware/loggerMiddleware")

router.get("/",async(req,res)=>{
    try {
        const searchQuery = req.query.search || "";
        const categoryFilter = req.query.category || "";
        const page = parseInt(req.query.page) || 1;
        const limit = 6; // Posts per page
        const skip = (page - 1) * limit;
        
        // Build query
        let query = {};
        if (searchQuery) {
            query.$or = [
                { title: { $regex: searchQuery, $options: 'i' } },
                { content: { $regex: searchQuery, $options: 'i' } },
                { category: { $regex: searchQuery, $options: 'i' } },
                { auther: { $regex: searchQuery, $options: 'i' } }
            ];
        }
        if (categoryFilter) {
            query.category = categoryFilter;
        }
        
        // Get total count and blogs
        const totalBlogs = await Blog.countDocuments(query);
        const blogs = await Blog.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);
        
        // Get categories for filter
        const categories = await Blog.distinct("category");
        
        // Get recent posts for sidebar
        const recentPosts = await Blog.find()
            .sort({ date: -1 })
            .limit(5)
            .select("title _id date");
        
        // Get popular posts (most views)
        const popularPosts = await Blog.find()
            .sort({ views: -1 })
            .limit(5)
            .select("title _id views");
        
        const totalPages = Math.ceil(totalBlogs / limit);
        
        res.render("index.ejs",{
            blogs, 
            user: req.user || null, 
            searchQuery,
            categoryFilter,
            categories,
            recentPosts,
            popularPosts,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            nextPage: page + 1,
            prevPage: page - 1
        })
    } catch (err) {
        console.error(err);
        res.render("index.ejs",{
            blogs: [], 
            user: req.user || null, 
            searchQuery: "",
            categoryFilter: "",
            categories: [],
            recentPosts: [],
            popularPosts: [],
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false
        })
    }
})

router.get("/post/:id",async(req,res)=>{
    try {
        // Only increment views if user is logged in
        if (req.user) {
            await Blog.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
        }
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).render("404.ejs", { user: req.user || null });
        }
        
        // Get related posts (same category, exclude current post)
        const relatedPosts = await Blog.find({
            category: blog.category,
            _id: { $ne: blog._id }
        })
        .sort({ views: -1, date: -1 })
        .limit(3)
        .select('title _id image category date views likes');
        
        // Check if user has bookmarked this post
        let isBookmarked = false;
        if (req.user) {
            isBookmarked = blog.bookmarkedBy && blog.bookmarkedBy.includes(req.user.username);
        }
        
        // SEO Meta Tags
        const pageTitle = blog.title + ' - Bloguu';
        const pageDescription = blog.excerpt || blog.content.substring(0, 160).replace(/<[^>]*>/g, '');
        const pageImage = blog.image ? `${req.protocol}://${req.get('host')}${blog.image}` : '';
        const pageUrl = `${req.protocol}://${req.get('host')}/post/${blog._id}`;
        
        res.render("single_post.ejs",{
            blog, 
            user: req.user || null,
            isLoggedIn: !!req.user,
            relatedPosts: relatedPosts || [],
            isBookmarked: isBookmarked,
            pageTitle,
            pageDescription,
            pageImage,
            pageUrl,
            pageType: 'article'
        })
    } catch (err) {
        console.error(err);
        res.status(404).render("404.ejs", { user: req.user || null });
    }
})


router.post("/post/:id/like", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Please login to like posts" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const user = req.user.username;

    if (!blog.likedBy.includes(user)) {
      blog.likedBy.push(user);
    } else {
      blog.likedBy = blog.likedBy.filter(u => u !== user);
    }

    blog.likes = blog.likedBy.length;
    await blog.save();

    res.json({
      success: true,
      likes: blog.likes,
      liked: blog.likedBy.includes(user)
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/post/:id/comment", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Please login to comment" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const user = req.user.username;
    const { comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Comment cannot be empty" });
    }

    const newComment = {
      user: user,
      text: comment.trim(),
      date: new Date()
    };

    blog.comments.push(newComment);
    await blog.save();

    res.json({
      success: true,
      comment: newComment
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Bookmark/Unbookmark post
router.post("/post/:id/bookmark", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Please login to bookmark posts" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const user = req.user.username;
    
    if (!blog.bookmarkedBy) {
      blog.bookmarkedBy = [];
    }

    if (!blog.bookmarkedBy.includes(user)) {
      blog.bookmarkedBy.push(user);
    } else {
      blog.bookmarkedBy = blog.bookmarkedBy.filter(u => u !== user);
    }

    await blog.save();

    res.json({
      success: true,
      bookmarked: blog.bookmarkedBy.includes(user)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;
