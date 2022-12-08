const router = require("express").Router();
const Post = require("../../schemas/Post");
const User = require("../../schemas/User");
const Notification = require("../../schemas/Notification");

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

    if(req.body.replyTo){
        postData.replyTo = req.body.replyTo;
    }


    Post.create(postData)
    .then(async (newPost) => {
        newPost = await User.populate(newPost, {path: "postedBy"});
        newPost = await User.populate(newPost, {path: "replyTo"});

        if(newPost.replyTo){
            await Notification.insertNotification(newPost.replyTo.postedBy, newPost.postedBy, "reply", newPost._id);
        }

        return res.status(201).send(newPost);
    })
    .catch((err) =>{
        console.log(err.message);
        return res.sendStatus(400);
    })
})

//get timeline
router.get("/", async (req, res, next) => {
    var searchObj = req.query;
    if(searchObj.isReply){
        var isReply = searchObj.isReply == "true";
        searchObj.replyTo = { $exists: isReply};
        delete searchObj.isReply;
    }

    if(searchObj.search){
        searchObj.content = { $regex: searchObj.search, $options: "i"}
        delete searchObj.search
    }

    if(searchObj.followingOnly){
        var followingOnly = searchObj.followingOnly == "true";

        if(followingOnly){
            var objectIds = [];
            
            if(req.session.user.following){
                req.session.user.following.forEach(user => {
                    objectIds.push(user);
                })
            }

            objectIds.push(req.session.user._id);

            searchObj.postedBy = { $in: objectIds};
        }

        delete searchObj.followingOnly;
    }

    var results = await getPosts(searchObj);
    return res.status(200).send(results);
})

//get post by id and get replies to that post
router.get("/:postId", async (req, res, next) => {
    var postId = req.params.postId;
    var filter = {
        _id: postId
    }
    var postData = await getPosts(filter);
    postData = postData[0];

    var results = {
        postData
    }

    //take the post which this post reply to
    if(postData.replyTo){
        results.replyTo = postData.replyTo
    }

    //take replies to this post
    results.replies = await getPosts({
        replyTo: postId
    })
    
    return res.status(200).send(results);
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

    if(!isLiked){
        await Notification.insertNotification(post.postedBy, user._id, "postLike", postId);
    }

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

    //when retweet post create, it wil send notification
    if(!deletedPost){
        await Notification.insertNotification(post.postedBy, user._id, "retweet", post._id);
    }

    return res.status(200).send(post);
})

//delete post
router.delete("/:postId", async (req, res, next) => {
    Post.findByIdAndDelete(req.params.postId)
    .then( async () => {
        await Post.deleteMany({
            retweetData: req.params.postId
        })

        return res.sendStatus(202)
    })
    .catch(error => {
        console.log(error);
        return res.sendStatus(400);
    })
})

//pin post
router.put("/:postId", async (req, res, next) => {
    if(req.body.pinned){
        await Post.updateMany({postedBy: req.session.user}, {pinned: false})
        .catch(err => {
            console.log(err.message);
            return res.sendStatus(400);
        })
    }

    await Post.findByIdAndUpdate(req.params.postId, req.body)
    .catch(error => {
        console.log(error);
        return res.sendStatus(400);
    })

    return res.sendStatus(204);
})

async function getPosts(filter = {}) {
    var results = await Post.find(filter)
    .populate("postedBy")
    .populate("retweetData")
    .populate("replyTo")
    .sort({
        createdAt: -1
    })
    .catch((err) => console.log(err.message))

    results = await User.populate(results, {path: "replyTo.postedBy"});
    return await User.populate(results, {path: "retweetData.postedBy"});
}

module.exports = router;