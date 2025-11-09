const mongoose = require("mongoose")
const postData = mongoose.Schema({
    title:{type:String,required:true},
    category:{type:String,required:true},
    image:{type:String},
    content : {type:String,required:true},
    auther:{type:String,required:true},
    date:{type:Date,default:Date.now},
    views:{type:Number,default:0},
    likes:{type:Number,default:0},
    likedBy:{
        type: [String],
        default: []
    },
    comments: [
        {
    user: String,
    text: String,
    date: { type: Date, default: Date.now }
  }
]

})
module.exports = mongoose.model("Blog",postData);