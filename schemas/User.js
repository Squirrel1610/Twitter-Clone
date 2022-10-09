const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            trim: true,
            required: true
        },
        lastName: {
            type: String,
            trim: true,
            required: true
        },
        username: {
            type: String,
            trim: true,
            required: true,
            unique: true
        },
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        profilePic: {
            type: String, 
            default: "images/profilePic.png"
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Post"
            }
        ],
        retweets: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Post"
            }
        ],
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("User", UserSchema);