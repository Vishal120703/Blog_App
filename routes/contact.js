const express = require("express")
const router = express.Router()

router.get("/", (req, res) => {
    const successMessage = req.session.successMessage;
    req.session.successMessage = null;
    res.render("contact", { user: req.user || null, successMessage });
})

router.post("/", (req, res) => {
    const { name, email, message } = req.body;
    // In a real application, you would send an email or save to database
    req.session.successMessage = "Thank you for your message! We'll get back to you soon.";
    res.redirect("/contact");
})

module.exports = router

