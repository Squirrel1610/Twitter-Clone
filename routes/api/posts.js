const router = require("express").Router();
const Post = require("../../schemas/Post");
const User = require("../../schemas/User");

//create post
router.post("/", async (req, res, next) => {
    if(!req.body.content){
        console.log("Request sent with no content");
        return res.sendStatus(400);
    }

    var postData = {
        content: req.body.content,
        postedBy: req.session.user._id
    }

    Post.create(postData)
    .then(async (newPost) => {
        newPost = await User.populate(newPost, {path: "postedBy"});
        return res.status(201).send(newPost);
    })
    .catch((err) =>{
        console.log(err.message);
        return res.sendStatus(400);
    })
})

//get timeline
router.get("/", async (req, res, next) => {
    Post.find({})
    .populate("postedBy")
    .populate("retweetData")
    .sort({
        createdAt: -1
    })
    .then(async (results) => {
        results = await User.populate(results, {path: "retweetData.postedBy"});
        return res.status(200).send(results)
    })
    .catch((err) => {
        console.log(err.message);
        return res.sendStatus(400);
    })
})

//like and unlike post
router.put("/:postId/like", async (req, res, next) => {
    var postId = req.params.postId;
    var user = req.session.user;

    var isLiked = user.likes && user.likes.includes(postId);

    var option = isLiked ? "$pull" : "$addToSet";

    //Insert user like
    req.session.user = await User.findByIdAndUpdate(user._id,{
        [option] : {likes: postId}
    }, {
        new: true
    })
    .catch(err => {
        console.log(err.message);
        return res.sendStatus(400);
    })

    //Insert post like
    var post = await Post.findByIdAndUpdate(postId, {
        [option]: {likes: user._id}
    }, {
        new: true
    })
    .catch(err => {
        console.log(err.message);
        return res.sendStatus(400);
    })

    return res.status(200).send(post);
})

//retweet post
router.post("/:postId/retweet", async (req, res, next) => {
    var postId = req.params.postId;
    var user = req.session.user;
    
    var deletedPost = await Post.findOneAndDelete({
        postedBy: user._id,
        retweetData: postId
    })

    var option = deletedPost ? "$pull" : "$addToSet";

    var repost = deletedPost;

    //if it doesn't have retweet post => create a retweet
    if(!repost){
        repost = await Post.create({
            postedBy: user._id,
            retweetData: postId
        }).catch(err => {
            console.log(err.message);
            res.sendStatus(400);
        })
    }

    //if deletedPost is null, it will add. Otherwise it will pull
    //insert user retweets 
    req.session.user = await User.findByIdAndUpdate(
        user._id,
        {
            [option] : {
                retweets: repost._id 
            }
        },
        {
            new: true
        }
    ).catch(err => {
        console.log(err.message);
        res.sendStatus(400);
    });

    //insert post retweet users
    var post = await Post.findByIdAndUpdate(
        postId,
        {
            [option]: {
                retweetUsers: user._id
            }
        },
        {
            new: true
        }
    ).catch(err => {
        console.log(err.message);
        res.sendStatus(400);
    })

    return res.status(200).send(post);
})

module.exports = router;