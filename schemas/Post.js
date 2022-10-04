const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            trim: true,
            required: true
        },
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        pinned: {
            type: Boolean,
            default: false
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Post", PostSchema);