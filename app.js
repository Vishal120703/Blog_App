const express = require("express")
const app = express()
const port = 3000
const session = require("express-session");
const connectDB = require("./config/dbConnect")
const cookieParser = require("cookie-parser");
const fileData = require("./routes/allFiles")

connectDB()
const userRoute = require("./routes/users")
app.set("view engine","ejs")
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());

app.use(session({
  secret: "mySecretKey",
  resave: false,
  saveUninitialized: true
}));

app.get("/",(req,res)=>{
    res.send("hello world")
})
app.use("/user",userRoute)
app.use("/user/dashboard/",fileData)

app.listen(port,(req,res)=>{
    console.log(`the port is running on : ${port}`)
})