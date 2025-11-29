const express = require("express");
const router = express.Router();
const User = require("../models/userData");
const Blog = require("../models/postData");
const optionalAuth = require("../middleware/optionalAuth");

// Get user profile
router.get("/:username", optionalAuth, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).render("404", { user: req.user || null });
        }

        // Get user's posts
        const userPosts = await Blog.find({ authorId: user._id.toString() })
            .sort({ date: -1 })
            .limit(20);

        // Calculate stats
        const totalPosts = userPosts.length;
        const totalViews = userPosts.reduce((sum, post) => sum + (post.views || 0), 0);
        const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes || 0), 0);

        res.render("profile", {
            profileUser: user,
            posts: userPosts,
            totalPosts,
            totalViews,
            totalLikes,
            user: req.user || null,
            isOwnProfile: req.user && req.user.id === user._id.toString()
        });
    } catch (err) {
        console.error(err);
        res.status(500).render("404", { user: req.user || null });
    }
});

module.exports = router;

