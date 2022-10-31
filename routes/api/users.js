const router = require("express").Router();
const Post = require("../../schemas/Post");
const User = require("../../schemas/User");

//follow and unfollow user
router.put("/:userId/follow", async (req, res, next) => {
    const userId = req.params.userId;

    var user = await User.findById(userId);
    if(!user) return res.sendStatus(404);

    var isFollowing = user.followers && user.followers.includes(req.session.user._id);
    var option = isFollowing ? "$pull" : "$addToSet";

    //insert following in current user
    req.session.user = await User.findByIdAndUpdate(req.session.user._id, {
        [option]: {following: userId}
    },{
        new: true
    }).catch(err => {
        console.log(err.message);
        return res.sendStatus(400);
    })

    //insert followers in user
    await User.findByIdAndUpdate(userId, {
        [option]: {followers: req.session.user._id}
    }).catch(err => {
        console.log(err.message);
        return res.sendStatus(400);
    })

    return res.status(200).send(req.session.user);
})

//get following list
router.get("/:userId/following", async (req, res, next) => {
    try {
        var followingList = await User.findById(req.params.userId).select("following").populate("following");
        return res.status(200).send(followingList);
    } catch (error) {
        console.log(error.message);
        res.sendStatus(400);
    }
})

//get followers list
router.get("/:userId/followers", async (req, res, next) => {
    try {
        var followingList = await User.findById(req.params.userId).select("followers").populate("followers");
        return res.status(200).send(followingList);
    } catch (error) {
        console.log(error.message);
        res.sendStatus(400);
    }
})

module.exports = router;