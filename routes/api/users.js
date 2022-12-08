const router = require("express").Router();
const multer = require("multer");
const upload = multer({
    dest: "uploads/images/"
});
const path = require("path");
const fs = require("fs");
const Post = require("../../schemas/Post");
const User = require("../../schemas/User");
const Notification = require("../../schemas/Notification");

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

    //when follow, notification will be sent
    if(!isFollowing){
        await Notification.insertNotification(userId, req.session.user._id, "follow", req.session.user._id);
    }

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

//upload profile
router.post("/profilePicture", upload.single("croppedImage") , async (req, res, next) => {
    if(!req.file){
        console.log("No file uploaded with ajax request");
        return req.sendStatus(400);
    }

    var filePath = `/uploads/images/${req.file.filename}.png`;
    var tempPath = req.file.path;
    var targetPath = path.join(__dirname, `../../${filePath}`);

    fs.rename(tempPath, targetPath, async (err) => {
        if(err){
            console.log(err);
            return res.sendStatus(400);
        }
    });
     
    req.session.user = await User.findByIdAndUpdate(req.session.user._id, {
        profilePic: filePath
    },{
        new: true
    }).catch(err => {
        console.log(err.message);
        return res.sendStatus(400);
    })

    return res.sendStatus(204);
})

//upload cover
router.post("/coverPhoto", upload.single("croppedImage") , async (req, res, next) => {
    if(!req.file){
        console.log("No file uploaded with ajax request");
        return req.sendStatus(400);
    }

    var filePath = `/uploads/images/${req.file.filename}.png`;
    var tempPath = req.file.path;
    var targetPath = path.join(__dirname, `../../${filePath}`);

    fs.rename(tempPath, targetPath, async (err) => {
        if(err){
            console.log(err);
            return res.sendStatus(400);
        }
    });
     
    req.session.user = await User.findByIdAndUpdate(req.session.user._id, {
        coverPhoto: filePath
    },{
        new: true
    }).catch(err => {
        console.log(err.message);
        return res.sendStatus(400);
    })

    return res.sendStatus(204);
})

//search user
router.get("/", async (req, res, next) => {
    var searchObj = req.query;

    if(searchObj.search){
        searchObj = {
            $or: [
                { firstName: { $regex: searchObj.search, $options: "i"}},
                { lastName: { $regex: searchObj.search, $options: "i" }},
                { username: { $regex: searchObj.search, $options: "i" }},
                { email: { $regex: searchObj.search, $options: "i" }}
            ]
        }
    }

    User.find(searchObj)
    .then((results) => {
        return res.status(200).send(results);
    })
    .catch((error) => {
        console.log(error.message);
        return res.sendStatus(400);
    })
})

module.exports = router;