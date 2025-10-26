const mongoose = require("mongoose")
const studentData = mongoose.Schema({
    name:{type:String,required:true},
    username:{type:String, required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String, required:true}
}) 
const data = mongoose.model("data",studentData)
module.exports = data