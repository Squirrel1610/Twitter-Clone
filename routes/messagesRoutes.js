const router = require("express").Router();
const Chat = require("../schemas/Chat");
const User = require("../schemas/User");
const mongoose = require("mongoose");

router.get("/", (req, res, next) => {
    var payload = {
        pageTitle: "Inbox",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }
    return res.status(200).render("inboxPage", payload)
})

router.get("/new", (req, res, next) => {
    var payload = {
        pageTitle: "New Message",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }
    return res.status(200).render("newMessage", payload)
})

router.get("/:chatId", async (req, res, next) => {
    var chatId = req.params.chatId;
    var userId = req.session.user._id;
    var isValidId = mongoose.isValidObjectId(chatId);

    var payload = {
        pageTitle: "Chat",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }

    if(!isValidId){
        payload.errorMessage = "Chat does not exist or you don't have permission to view";
        return res.status(200).render("chatPage", payload);
    }

    var chat = await Chat.findOne({ _id: chatId, users: { $elemMatch:  { $eq: userId }}}).populate("users");

    if(!chat){
        //check the chatId is really userId
        var userFound = await User.findById(chatId);

        if(userFound){
            //get chat by using userId
            chat = await getChatByUserId(userId, userFound._id);
        }
    }

    if(!chat){
        //if chat not exist
        payload.errorMessage = "Chat does not exist or you don't have permission to view";
    }else{
        payload.chat = chat;
    }

    
    return res.status(200).render("chatPage", payload)
})

function getChatByUserId(userLoggedInId, otherUserId){
    return Chat.findOneAndUpdate({
        isGroupChat: false,
        users: {
            $size: 2,
            $all: [
                { $elemMatch: { $eq: mongoose.Types.ObjectId(userLoggedInId) } },
                { $elemMatch: { $eq: mongoose.Types.ObjectId(otherUserId) } }
            ]
        }
    },
    {
        $setOnInsert: {
            users: [userLoggedInId, otherUserId] //just need this data because isGroupChat set default false when create
        }
    },
    {
        new: true,
        upsert: true //when not find the filter, db will create data in $setOnInsert
    })
    .populate("users");
}

module.exports = router;