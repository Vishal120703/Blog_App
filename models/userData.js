const mongoose = require("mongoose")
const studentData = mongoose.Schema({
    name:{type:String,required:true},
    username:{type:String, required:true, unique:true},
    email:{type:String,required:true,unique:true},
    password:{type:String, required:true},
    bio:{type:String, default:""},
    avatar:{type:String, default:""},
    bookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog"
    }],
    createdAt: {type:Date, default:Date.now}
}) 
const data = mongoose.model("data",studentData)
module.exports = data