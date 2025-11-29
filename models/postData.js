const mongoose = require("mongoose")
const postData = mongoose.Schema({
    title:{type:String,required:true},
    category:{type:String,required:true},
    image:{type:String},
    content : {type:String,required:true},
    excerpt: {type:String, default:""}, // Short description for preview
    auther:{type:String,required:true},
    authorId:{type:String,required:true}, // Store user ID for ownership verification
    date:{type:Date,default:Date.now},
    views:{type:Number,default:0},
    likes:{type:Number,default:0},
    likedBy:{
        type: [String],
        default: []
    },
    bookmarkedBy: {
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