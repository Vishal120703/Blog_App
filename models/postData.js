const mongoose = require("mongoose")
const postData = mongoose.Schema({
    title:{type:String,required:true},
    category:{type:String,required:true},
    image:{type:String},
    content : {type:String,required:true},
    auther:{type:String,required:true},
    date:{type:Date,default:Date.now}
})
module.exports = mongoose.model("Blog",postData);