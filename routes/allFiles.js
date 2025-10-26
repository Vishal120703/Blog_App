const express = require("express")
const router = express.Router();
const logger = require("../middleware/loggerMiddleware")

router.get("/hello",logger,(req,res)=>{
    res.send("hello");
})

module.exports = router